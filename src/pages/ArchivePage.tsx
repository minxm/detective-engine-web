import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  CheckCircle2,
  Radar,
  RefreshCw,
  FolderOpen,
  FileText,
  Plus,
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

export default function ArchivePage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  const activeCount = stats.active;
  const completedCount = stats.completed;

  const loadHistory = async (targetPage = page, targetFilter = filter) => {
    setLoadingHistory(true);
    try {
      const res = await fetchHistory({ page: targetPage, limit: 10, filter: targetFilter });
      setEntries(res.entries);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      setStats(res.stats);
    } catch {
      setEntries([]);
      setTotal(0);
      setTotalPages(1);
      setStats({ total: 0, active: 0, completed: 0 });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    void loadHistory(page, filter);
  }, [page, filter]);

  const changeFilter = (next: 'all' | 'active' | 'completed') => {
    setFilter(next);
    setPage(1);
  };

  return (
    <RoomAtmosphere room="archive">
      <PageLayout maxWidth="max-w-4xl">
        <BackButton to="/lobby" label={t.flow.lobby} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="archive-page-header mt-8 mb-8"
        >
          <p className="hud-label mb-2">{t.flow.archive}</p>
          <P5Title>{t.flow.archiveTitle}</P5Title>
          <p className="font-mono text-xs text-spec-gray/45 mt-3 tracking-wide leading-relaxed max-w-lg">
            {t.flow.archiveDesc}
          </p>
          <div className="mt-5">
            <Link to="/new-case">
              <HudButton>
                <Plus className="w-4 h-4" />
                {t.flow.startNewTask}
              </HudButton>
            </Link>
          </div>
        </motion.div>

        {/* 统计摘要 */}
        {!loadingHistory && stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { label: '全部卷宗', value: stats.total, color: 'cyan' },
              { label: '进行中', value: activeCount, color: 'red' },
              { label: '已结案', value: completedCount, color: 'gold' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="p-3 flex flex-col"
                style={{
                  background: 'rgba(11,15,20,0.7)',
                  clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                  boxShadow: `inset 0 0 0 1px ${
                    color === 'red' ? 'rgba(229,9,20,0.2)' :
                    color === 'gold' ? 'rgba(212,168,83,0.2)' :
                    'rgba(0,245,255,0.15)'
                  }`,
                }}
              >
                <p className="font-mono text-[8px] text-spec-gray/40 tracking-widest mb-1">{label}</p>
                <p
                  className="font-display font-black text-2xl leading-none"
                  style={{
                    color: color === 'red' ? '#E50914' : color === 'gold' ? '#D4A853' : '#00F5FF',
                    textShadow: `0 0 14px ${color === 'red' ? 'rgba(229,9,20,0.5)' : color === 'gold' ? 'rgba(212,168,83,0.4)' : 'rgba(0,245,255,0.4)'}`,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* 列表标题行 */}
        <div className="archive-section-label">
          <FileText className="w-4 h-4 text-spec-cyan/50" />
          <p className="hud-label mb-0">{t.history.title}</p>
          {!loadingHistory && total > 0 && (
            <span className="font-mono text-[9px] text-spec-gray/35 tabular-nums">
              {entries.length} / {total}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => void loadHistory(page, filter)} className="hud-btn-icon" aria-label="刷新">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 过滤标签 */}
        {!loadingHistory && (
          <div className="archive-filter-tabs">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => changeFilter(f)}
                className={`archive-filter-tab ${filter === f ? 'archive-filter-tab-active' : ''}`}
              >
                {f === 'all' ? `${t.history.tabAll}${stats.total > 0 ? ` · ${stats.total}` : ''}` :
                 f === 'active' ? `${t.history.tabActive}${activeCount > 0 ? ` · ${activeCount}` : ''}` :
                 `已结案${completedCount > 0 ? ` · ${completedCount}` : ''}`}
              </button>
            ))}
          </div>
        )}

        {/* 案件列表 */}
        {loadingHistory ? (
          <p className="text-center text-spec-gray py-10 font-mono text-sm">{t.common.loading}</p>
        ) : entries.length === 0 ? (
          <HudPanel className="p-10 text-center">
            {stats.total === 0 && filter === 'all' && (
              <FolderOpen className="w-10 h-10 text-spec-gray/20 mx-auto mb-4" />
            )}
            <p className="text-spec-gray/70 text-sm font-mono leading-relaxed">
              {filter === 'active' ? t.history.emptyActive : t.history.empty}
            </p>
          </HudPanel>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const href =
                entry.status === 'completed'
                  ? `/case/${entry.caseId}/archive`
                  : resumePath(entry.caseId);
              const caseNum = entry.caseId.slice(-6).toUpperCase();
              const isCompleted = entry.status === 'completed';
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link to={href} className="block group">
                    <div
                      className={`filing-drawer archive-case-card ${
                        isCompleted ? 'archive-case-completed' : 'archive-case-active'
                      }`}
                    >
                      <span className="filing-drawer-handle" aria-hidden />
                      <div className="flex items-center gap-4">
                        <div
                          className={`neo-icon-box !w-11 !h-11 shrink-0 ${
                            isCompleted ? 'text-emerald-400/90' : 'text-spec-red/80'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Radar className="w-5 h-5 animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`archive-status-badge ${
                                isCompleted ? 'archive-status-completed' : 'archive-status-active'
                              }`}
                            >
                              {isCompleted ? t.history.statusCompleted : t.history.statusInProgress}
                            </span>
                            <span className="archive-case-meta">#{caseNum}</span>
                          </div>
                          <p className="font-archive text-sm text-white truncate group-hover:text-spec-cyan transition-colors">
                            {entry.caseTitle}
                          </p>
                          <p className="archive-case-meta mt-1">
                            {formatCaseDate(entry.createdAt)}
                            {!isCompleted && ` · ${t.flow.continueCase}`}
                          </p>
                        </div>
                        {isCompleted && entry.score != null && (
                          <div className="archive-case-score-wrap shrink-0">
                            <span className="archive-case-score">{entry.score}</span>
                            <span className="archive-case-score-unit">{t.history.scoreUnit}</span>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-spec-gray/35 group-hover:text-spec-cyan transition-colors shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loadingHistory && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 pb-4">
            <HudButton
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t.history.prevPage}
            </HudButton>
            <span className="font-mono text-xs text-spec-gray/60 tabular-nums">
              {t.history.pageInfo.replace('{page}', String(page)).replace('{totalPages}', String(totalPages))}
            </span>
            <HudButton
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t.history.nextPage}
            </HudButton>
          </div>
        )}
      </PageLayout>
    </RoomAtmosphere>
  );
}
