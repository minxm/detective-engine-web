import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, CheckCircle2, Radar, History, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { fetchHistory } from '@/services/history';
import { fetchUserStats } from '@/services/user';
import { t } from '@/i18n/zh';
import type { HistoryEntry, UserStats } from '@/types';

const EMPTY_STATS: UserStats = { casesCompleted: 0, averageScore: 0, perfectSolves: 0, streak: 0, achievements: [] };

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        fetchHistory({ page: targetPage, limit: 10 }),
        fetchUserStats(),
      ]);
      setEntries(historyRes.entries);
      setPage(historyRes.page);
      setTotalPages(historyRes.totalPages);
      setStats(statsRes.stats);
    } catch {
      setEntries([]);
      setStats(EMPTY_STATS);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(page); }, [page]);

  const statItems = t.history.stats.map((label, i) => ({
    label,
    value: [stats.casesCompleted, Math.round(stats.averageScore), stats.perfectSolves, stats.streak][i],
  }));

  return (
    <PageLayout maxWidth="max-w-3xl">
      <div className="flex items-center justify-between mb-10">
        <BackButton />
        <HudButton variant="icon" onClick={() => void load(page)}>
          <RefreshCw className="w-4 h-4" />
        </HudButton>
      </div>

      <p className="hud-label mb-2">{t.hud.caseFile}</p>
      <h1 className="text-2xl font-black hud-title mb-8 flex items-center gap-2">
        <History className="w-5 h-5 text-cyan-500/60" />
        {t.history.title}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {statItems.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <HudPanel className="p-4 text-center">
              <p className="text-2xl font-black hud-title font-mono">{item.value}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono tracking-wider">{item.label}</p>
            </HudPanel>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-cyan-500/50" /></div>
      ) : entries.length === 0 ? (
        <HudPanel solid className="p-12 text-center text-slate-500 text-sm font-mono">
          {t.history.empty}
        </HudPanel>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const href = entry.status === 'completed'
              ? `/case/${entry.caseId}/archive`
              : `/case/${entry.caseId}`;
            return (
              <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Link to={href} className="block group">
                  <HudPanel hover className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`neo-icon-box !w-10 !h-10 shrink-0 ${entry.status === 'completed' ? 'text-emerald-400' : 'text-accent-gold'}`}>
                        {entry.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Radar className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">{entry.caseTitle}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          #{entry.caseId.slice(-6).toUpperCase()} ù {entry.rating}{entry.score != null ? ` ù ${entry.score}${t.history.scoreUnit}` : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </HudPanel>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <HudButton variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            {t.history.prevPage}
          </HudButton>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {t.history.pageInfo.replace('{page}', String(page)).replace('{totalPages}', String(totalPages))}
          </span>
          <HudButton variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            {t.history.nextPage}
          </HudButton>
        </div>
      )}
    </PageLayout>
  );
}
