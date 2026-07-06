import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Scan, Flame, Skull, ChevronRight, CheckCircle2, Radar, RefreshCw, FolderOpen } from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import P5Title from '@/components/hud/P5Title';
import BackButton from '@/components/BackButton';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { createCase } from '@/services/case';
import { fetchHistory } from '@/services/history';
import { CASE_FLOW_PATHS } from '@/utils/case-flow';
import { getProgress, saveCaseData, scrollWindowToTop } from '@/utils/case-store';
import { t } from '@/i18n/zh';
import type { HistoryEntry } from '@/types';
import type { CaseFlowStep } from '@/types';

const DIFF_ICONS = [Target, Scan, Flame, Skull] as const;

function resumePath(caseId: string): string {
  const step = (getProgress(caseId)?.flowStep ?? 'open') as CaseFlowStep;
  return CASE_FLOW_PATHS[step](caseId);
}

export default function ArchivePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterActive = searchParams.get('filter') === 'active';
  const actionNew = searchParams.get('action') === 'new';
  const newCaseRef = useRef<HTMLDivElement>(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetchHistory();
      setEntries(res.entries);
    } catch {
      setEntries([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { void loadHistory(); }, []);

  useEffect(() => {
    if (actionNew && newCaseRef.current) {
      setTimeout(() => {
        newCaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [actionNew]);

  const handleStartCase = async () => {
    setIsGenerating(true);
    setGeneratingStatus(t.home.matching);
    try {
      const data = await createCase(selectedDifficulty);
      if ('caseData' in data && data.source === 'inventory') {
        setGeneratingStatus(t.home.ready);
        await saveCaseData(data.caseData);
        scrollWindowToTop();
        navigate(`/case/${data.caseId}`);
        return;
      }
      if ('jobId' in data) {
        setGeneratingStatus(t.home.generating);
        scrollWindowToTop();
        navigate(`/generating/${data.jobId}?difficulty=${encodeURIComponent(selectedDifficulty)}`);
      }
    } catch (error) {
      alert(`${t.home.genFail}${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
    }
  };

  return (
    <RoomAtmosphere room="archive">
      <PageLayout maxWidth="max-w-4xl">
        <BackButton to="/lobby" label={t.flow.lobby} />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-10">
          <p className="hud-label mb-2">{t.flow.archive}</p>
          <P5Title>{t.flow.archiveSub}</P5Title>
        </motion.div>

        {/* 新建案件 — 档案柜顶部 */}
        <div ref={newCaseRef}>
        <HudPanel solid scan className={`filing-cabinet p-6 mb-10 transition-all duration-500 ${actionNew ? 'ring-1 ring-spec-red/40 shadow-[0_0_32px_rgba(229,9,20,0.12)]' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-4 h-4 text-spec-cyan/60" />
            <p className="hud-label !text-spec-cyan/70 mb-0">{t.flow.newCase}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {t.home.difficulties.map((d, i) => {
              const selected = selectedDifficulty === d.id;
              const Icon = DIFF_ICONS[i];
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`hud-diff ${selected ? 'hud-diff-active' : ''}`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-spec-cyan' : 'text-spec-gray/40'}`} />
                  <div className="font-mono font-bold text-white text-sm">{d.name}</div>
                  <div className="text-[10px] text-spec-gray/60 font-archive">{d.desc}</div>
                </button>
              );
            })}
          </div>
          <HudButton onClick={handleStartCase} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <div className="hud-loader !w-4 !h-4" />
                <span className="font-mono text-xs">{generatingStatus}</span>
              </>
            ) : (
              <>
                {t.flow.newCase} <ChevronRight className="w-4 h-4" />
              </>
            )}
          </HudButton>
          <p className="hud-meta mt-3">{t.home.estTime}</p>
        </HudPanel>
        </div>

        {/* 历史卷宗 — 档案抽屉列表 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="hud-label">{filterActive ? '进行中案件' : t.history.title}</p>
            {filterActive && (
              <span
                className="font-mono text-[8px] px-2 py-0.5 tracking-widest"
                style={{
                  background: 'rgba(229,9,20,0.1)',
                  boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.3)',
                  color: '#E50914',
                }}
              >
                ACTIVE ONLY
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filterActive && (
              <Link
                to="/archive"
                className="font-mono text-[9px] text-spec-gray/40 hover:text-spec-cyan transition-colors tracking-wider"
              >
                查看全部
              </Link>
            )}
            <button type="button" onClick={loadHistory} className="hud-btn-icon">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loadingHistory ? (
          <p className="text-center text-spec-gray py-8 font-mono text-sm">{t.common.loading}</p>
        ) : entries.length === 0 ? (
          <HudPanel className="p-8 text-center text-spec-gray text-sm font-mono">{t.history.empty}</HudPanel>
        ) : (() => {
          const displayed = filterActive ? entries.filter((e) => e.status !== 'completed') : entries;
          return displayed.length === 0 ? (
            <HudPanel className="p-8 text-center text-spec-gray text-sm font-mono">暂无进行中的案件</HudPanel>
          ) : (
          <div className="space-y-1.5">
            {displayed.map((entry, i) => {
              const href = entry.status === 'completed' ? `/case/${entry.caseId}/result` : resumePath(entry.caseId);
              const caseNum = entry.caseId.slice(-6).toUpperCase();
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={href} className="block group">
                    <div className="filing-drawer pl-5 pr-4 py-4">
                      <span className="filing-drawer-handle" aria-hidden />
                      <div className="flex items-center gap-4">
                        <div className={`neo-icon-box !w-10 !h-10 ${entry.status === 'completed' ? 'text-emerald-400' : 'text-accent-gold'}`}>
                          {entry.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Radar className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-archive text-sm text-white truncate group-hover:text-spec-cyan transition-colors">{entry.caseTitle}</p>
                          <p className="text-[10px] text-spec-gray/60 font-mono mt-0.5">
                            FILE #{caseNum} · {entry.status === 'completed' ? t.flow.closed : t.flow.continueCase}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-spec-gray/40 group-hover:text-spec-cyan transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          );
        })()}
      </PageLayout>
    </RoomAtmosphere>
  );
}
