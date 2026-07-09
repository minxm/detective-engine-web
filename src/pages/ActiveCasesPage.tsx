import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radar,
  ChevronRight,
  RefreshCw,
  Plus,
  Activity,
} from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import P5Title from '@/components/hud/P5Title';
import BackButton from '@/components/BackButton';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { fetchHistory } from '@/services/history';

import { CASE_FLOW_PATHS } from '@/utils/case-flow';
import { getProgress } from '@/utils/case-store';
import { t } from '@/i18n/zh';
import type { HistoryEntry } from '@/types';
import type { CaseFlowStep } from '@/types';

function resumePath(caseId: string): string {
  const step = (getProgress(caseId)?.flowStep ?? 'open') as CaseFlowStep;
  return CASE_FLOW_PATHS[step](caseId);
}

function formatCaseDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STEP_LABELS: Record<string, string> = {
  open: '案件概览',
  evidence: '证据分析',
  forensics: '法医报告',
  interrogate: '审讯室',
  deduction: '推理室',
  reconstruction: '案件重建',
  closed: '结案',
};

export default function ActiveCasesPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const activeEntries = entries;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchHistory({ page: 1, limit: 20, filter: 'active' });
      setEntries(res.entries);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <RoomAtmosphere room="archive">
      <PageLayout maxWidth="max-w-3xl">
        <BackButton to="/lobby" label={t.flow.lobby} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 mb-8"
        >
          <p className="hud-label mb-2">任务监控 · 进行中</p>
          <P5Title>
            进行中
            <span className="p5-title-red ml-2">案件</span>
          </P5Title>
          <p className="font-mono text-xs text-spec-gray/45 mt-3 tracking-wide leading-relaxed">
            继续未完成的调查任务，每个案件保留完整调查进度
          </p>
        </motion.div>

        {/* 统计栏 */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 mb-6 p-3"
          style={{
            background: 'rgba(11,15,20,0.7)',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
            boxShadow: activeEntries.length > 0
              ? 'inset 0 0 0 1px rgba(229,9,20,0.2)'
              : 'inset 0 0 0 1px rgba(0,245,255,0.1)',
          }}
        >
          <Activity className={`w-4 h-4 shrink-0 ${activeEntries.length > 0 ? 'text-spec-red animate-pulse' : 'text-spec-cyan/50'}`} />
          <span className="font-mono text-[9px] text-spec-gray/40 tracking-wider">进行中</span>
          <span
            className="font-mono text-xl font-black ml-1"
            style={{
              color: activeEntries.length > 0 ? '#E50914' : '#00F5FF',
              textShadow: activeEntries.length > 0 ? '0 0 12px rgba(229,9,20,0.6)' : '0 0 12px rgba(0,245,255,0.5)',
            }}
          >
            {loading ? '—' : activeEntries.length}
          </span>
          <span className="font-mono text-[9px] text-spec-gray/35">个案件</span>
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => void loadHistory()}
              className="hud-btn-icon"
              aria-label="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* 案件列表 */}
        <>

            {loading ? (
              <p className="text-center text-spec-gray py-10 font-mono text-sm">{t.common.loading}</p>
            ) : activeEntries.length === 0 ? (
              <HudPanel className="p-10 text-center mb-6">
                <Radar className="w-10 h-10 text-spec-gray/20 mx-auto mb-4" />
                <p className="text-spec-gray/60 text-sm font-mono leading-relaxed">
                  {t.history.emptyActive}
                </p>
              </HudPanel>
            ) : (
              <div className="space-y-2 mb-6">
                {activeEntries.map((entry, i) => {
                  const href = resumePath(entry.caseId);
                  const caseNum = entry.caseId.slice(-6).toUpperCase();
                  const progress = getProgress(entry.caseId);
                  const stepLabel = STEP_LABELS[progress?.flowStep ?? 'open'] ?? '进行中';

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={href} className="block group">
                        <div className="filing-drawer archive-case-card archive-case-active relative">
                          <span className="filing-drawer-handle" aria-hidden />

                          {/* 进度指示条 */}
                          <div
                            className="absolute top-0 left-0 w-0.5 h-full group-hover:opacity-100 opacity-60 transition-opacity"
                            style={{
                              background: 'linear-gradient(180deg, transparent, rgba(229,9,20,0.9), transparent)',
                            }}
                          />

                          <div className="flex items-center gap-4 pl-2">
                            <div className="neo-icon-box !w-11 !h-11 shrink-0 text-spec-red/80">
                              <Radar className="w-5 h-5 animate-pulse" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="archive-status-badge archive-status-active">
                                  {stepLabel}
                                </span>
                                <span className="archive-case-meta">#{caseNum}</span>
                              </div>
                              <p className="font-archive text-sm text-white truncate group-hover:text-spec-red transition-colors">
                                {entry.caseTitle}
                              </p>
                              <p className="archive-case-meta mt-1">
                                {formatCaseDate(entry.createdAt)} · {t.flow.continueCase}
                              </p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-spec-gray/35 group-hover:text-spec-red transition-colors shrink-0" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* 底部快捷操作 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex gap-3 flex-wrap"
            >
              <Link to="/new-case">
                <HudButton variant="ghost">
                  <Plus className="w-4 h-4" />
                  {t.flow.startNewTask}
                </HudButton>
              </Link>
              <Link to="/archive">
                <HudButton variant="ghost">
                  {t.flow.viewAllArchive}
                </HudButton>
              </Link>
            </motion.div>
        </>
      </PageLayout>
    </RoomAtmosphere>
  );
}
