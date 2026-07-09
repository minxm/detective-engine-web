import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Loader2, Medal, RefreshCw, Star } from 'lucide-react';
import BackButton from '@/components/BackButton';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import P5Title from '@/components/hud/P5Title';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { fetchLeaderboard } from '@/services/leaderboard';
import { t } from '@/i18n/zh';
import type { LeaderboardEntry } from '@/types';

const PODIUM = [
  { rank: 2, h: 72, icon: Medal, accent: 'text-spec-gray', bar: 'from-spec-gray/30 to-transparent', border: 'border-spec-gray/30' },
  { rank: 1, h: 96, icon: Crown, accent: 'text-accent-gold', bar: 'from-accent-gold/40 to-transparent', border: 'border-accent-gold/40' },
  { rank: 3, h: 56, icon: Medal, accent: 'text-orange-400/90', bar: 'from-orange-500/25 to-transparent', border: 'border-orange-500/30' },
];

/** ??????????????? */
const LIST_GRID = 'grid grid-cols-[2.5rem_minmax(0,1fr)_3.5rem] gap-x-4 items-center';

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-1 bg-spec-navy overflow-hidden ml-3" style={{ clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-spec-cyan/60 to-spec-cyan/20"
      />
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaderboard();
      setEntries(res.entries);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const top3 = PODIUM.map((m) => ({ meta: m, entry: entries.find((e) => e.rank === m.rank) }));
  const maxScore = entries.length ? Math.max(...entries.map((e) => e.avgScore)) : 100;
  const showList = entries.length > 4;
  const rest = showList ? entries.slice(3) : [];

  return (
    <RoomAtmosphere room="lobby">
      <PageLayout maxWidth="max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/lobby" label={t.flow.lobby} />
          <HudButton variant="icon" onClick={load}>
            <RefreshCw className="w-4 h-4" />
          </HudButton>
        </div>

        <P5Title className="mb-2">{t.leaderboard.title}</P5Title>
        <p className="text-spec-gray font-mono text-xs mb-10">{t.nav.rank} · GLOBAL</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-spec-cyan/50" />
          </div>
        ) : entries.length === 0 ? (
          <HudPanel solid className="p-16 text-center">
            <Star className="w-8 h-8 text-spec-gray/30 mx-auto mb-4" />
            <p className="text-spec-gray font-mono text-sm">
              {t.leaderboard.empty}
            </p>
          </HudPanel>
        ) : (
          <>
            <div className="flex items-end justify-center gap-4 mb-14 px-2 pt-2">
              {top3.map(({ meta, entry }) => {
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={meta.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: meta.rank * 0.1, type: 'spring', stiffness: 120 }}
                    className={`flex flex-col items-center flex-1 max-w-[120px] ${meta.rank === 1 ? 'order-2 -mt-4' : meta.rank === 2 ? 'order-1' : 'order-3'}`}
                  >
                    <div className="relative mb-3 w-14 h-14 shrink-0">
                      <div
                        className={`w-full h-full flex items-center justify-center border ${meta.border} bg-spec-black/80`}
                        style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
                      >
                        <Icon className={`w-6 h-6 ${meta.accent}`} />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 flex items-center justify-center rounded-sm bg-spec-red text-white text-[11px] font-black font-mono leading-none shadow-md">
                        {meta.rank}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-white truncate w-full text-center mb-1">{entry?.displayName ?? '-'}</p>
                    <p className={`text-2xl font-black font-mono ${meta.accent}`}>{entry ? Math.round(entry.avgScore) : '-'}</p>
                    <p className="text-[9px] text-spec-gray font-mono mb-2">{t.leaderboard.avgScore}</p>
                    <div
                      className={`w-full bg-gradient-to-t ${meta.bar} border-t ${meta.border}`}
                      style={{ height: meta.h }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {showList && (
              <>
                <div className={`${LIST_GRID} px-4 py-2 mb-2 font-mono text-[9px] text-spec-gray tracking-widest uppercase whitespace-nowrap`}>
                  <span>{t.leaderboard.rank}</span>
                  <span>{t.leaderboard.detective}</span>
                  <span className="text-right">{t.leaderboard.avgScore}</span>
                </div>

                <div className="space-y-1.5">
                  {rest.map((entry, i) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                    >
                      <HudPanel className="group hover:border-spec-cyan/30 transition-colors">
                        <div className={`${LIST_GRID} p-4`}>
                          <span className="font-mono text-sm text-spec-cyan/50 font-bold">{String(entry.rank).padStart(2, '0')}</span>
                          <div className="min-w-0">
                            <p className="font-mono text-sm text-white truncate group-hover:text-spec-cyan transition-colors">{entry.displayName}</p>
                            <div className="flex items-center mt-1.5">
                              <p className="text-[10px] text-spec-gray font-mono shrink-0">
                                {entry.casesCompleted}{t.leaderboard.casesUnit} · {entry.perfectSolves}{t.leaderboard.perfectUnit}
                              </p>
                              <ScoreBar value={entry.avgScore} max={maxScore} />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black font-mono text-spec-cyan">{Math.round(entry.avgScore)}</p>
                            <p className="text-[9px] text-spec-gray font-mono">{entry.totalScore} {t.leaderboard.totalScore}</p>
                          </div>
                        </div>
                      </HudPanel>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </PageLayout>
    </RoomAtmosphere>
  );
}
