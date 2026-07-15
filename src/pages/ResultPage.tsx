import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Trophy, Star } from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { useCaseStore } from '@/utils/case-store';
import { t } from '@/i18n/zh';

function scoreToRank(score: number): string {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
}

const RANK_META: Record<string, { color: string; glow: string; label: string; bg: string }> = {
  S: { color: '#E50914', glow: 'rgba(229,9,20,0.7)', label: 'SUPREME · 完美侦破', bg: 'rgba(229,9,20,0.06)' },
  A: { color: '#00F5FF', glow: 'rgba(0,245,255,0.6)', label: 'EXCELLENT · 出色表现', bg: 'rgba(0,245,255,0.04)' },
  B: { color: '#D4A853', glow: 'rgba(212,168,83,0.6)', label: 'GOOD · 良好发挥', bg: 'rgba(212,168,83,0.04)' },
  C: { color: '#8A8F98', glow: 'rgba(138,143,152,0.5)', label: 'AVERAGE · 基本完成', bg: 'rgba(138,143,152,0.04)' },
  D: { color: '#555', glow: 'rgba(80,80,80,0.4)', label: 'FAILED · 调查失败', bg: 'rgba(80,80,80,0.04)' },
};

export default function ResultPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const evaluation = useCaseStore((s) => s.evaluation);

  if (!evaluation) {
    return (
      <RoomAtmosphere room="closed">
        <CinematicBackdrop />
        <PageLayout maxWidth="max-w-md">
          <HudPanel solid className="p-12 text-center">
            <p className="font-mono text-spec-gray/50 text-sm mb-6">{t.case.notFound}</p>
            <HudButton onClick={() => navigate('/archive')}>{t.flow.backArchive}</HudButton>
          </HudPanel>
        </PageLayout>
      </RoomAtmosphere>
    );
  }

  const rank = scoreToRank(evaluation.score);
  const meta = RANK_META[rank] ?? RANK_META['C']!;

  return (
    <RoomAtmosphere room="closed">
      <CinematicBackdrop />

      <div className="flex-1 relative overflow-hidden">
        {/* 背景光晕 — 随评级变色 */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 60% at 50% 40%, ${meta.bg.replace('0.06', '0.12')}, transparent 65%)`,
          }}
        />

        <PageLayout maxWidth="max-w-lg" py="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >

            {/* CASE CLOSED 印章 */}
            <motion.div
              initial={{ scale: 2.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.1 }}
              className="inline-block"
            >
              <div
                className="px-6 py-3"
                style={{
                  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                  border: '2px solid rgba(229,9,20,0.6)',
                  background: 'rgba(229,9,20,0.07)',
                  boxShadow: '0 0 20px rgba(229,9,20,0.2)',
                }}
              >
                <span
                  className="font-display text-spec-red font-black tracking-[0.5em] text-sm"
                  style={{ textShadow: '0 0 20px rgba(229,9,20,0.7)' }}
                >
                  CASE CLOSED
                </span>
              </div>
            </motion.div>

            {/* 巨大等级字 — Persona 5 */}
            <div className="relative py-4">
              {/* 背景辉光 */}
              <div
                className="absolute inset-0 blur-3xl opacity-30"
                style={{ background: `radial-gradient(ellipse at center, ${meta.glow}, transparent 70%)` }}
              />
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.25 }}
                className="rank-display relative"
                style={{ color: meta.color, textShadow: `0 0 60px ${meta.glow}, 0 0 120px ${meta.glow.replace('0.7', '0.35')}, 0 12px 0 rgba(0,0,0,0.5)` }}
              >
                <span className="rank-display-inner">{rank}</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-[10px] tracking-[0.3em] uppercase mt-2"
                style={{ color: meta.color, textShadow: `0 0 10px ${meta.glow}` }}
              >
                {meta.label}
              </motion.p>
            </div>

            {/* 评分数字 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-end justify-center gap-2"
            >
              <span
                className="font-display font-black text-5xl"
                style={{ color: meta.color, textShadow: `0 0 30px ${meta.glow}` }}
              >
                {evaluation.score}
              </span>
              <span className="font-mono text-spec-gray/50 text-sm pb-2">{t.result.scoreUnit}</span>
            </motion.div>

            {/* 评价文字 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-semibold"
              style={{ color: meta.color, textShadow: `0 0 16px ${meta.glow}` }}
            >
              {evaluation.rating}
            </motion.p>

            {/* 凶手判断 */}
            {evaluation.killerCorrect !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                    background: evaluation.killerCorrect ? 'rgba(74,222,128,0.08)' : 'rgba(229,9,20,0.08)',
                    boxShadow: `inset 0 0 0 1px ${evaluation.killerCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(229,9,20,0.3)'}`,
                    color: evaluation.killerCorrect ? 'rgb(74,222,128)' : '#E50914',
                  }}
                >
                  {evaluation.killerCorrect
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <XCircle className="w-4 h-4" />
                  }
                  {t.result.killer} — {evaluation.killerCorrect ? t.result.correct : t.result.wrong}
                </div>
              </motion.div>
            )}

            {/* 详细评语 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <HudPanel scan className="p-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-spec-cyan/50" />
                  <p className="hud-label mb-0">{t.hud.evaluation}</p>
                </div>
                <p className="text-spec-gray/80 text-sm leading-relaxed">{evaluation.feedback}</p>
              </HudPanel>
            </motion.div>

            {/* 成就 / 统计 行 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { icon: Star, label: 'RANK', value: rank },
                { icon: Trophy, label: 'SCORE', value: String(evaluation.score) },
                { icon: CheckCircle2, label: 'KILLER', value: evaluation.killerCorrect ? 'CORRECT' : 'WRONG' },
              ].map(({ icon: Icon, label, value }, i) => (
                <div
                  key={i}
                  className="p-3 text-center"
                  style={{
                    background: 'rgba(11,15,20,0.7)',
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.08)',
                  }}
                >
                  <Icon className="w-4 h-4 text-spec-cyan/40 mx-auto mb-1" />
                  <p className="font-mono text-[8px] text-spec-gray/30 tracking-wider">{label}</p>
                  <p className="font-display font-black text-sm text-white mt-0.5">{value}</p>
                </div>
              ))}
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            >
              <HudButton onClick={() => navigate('/archive')}>
                {t.result.again} <ArrowRight className="w-4 h-4" />
              </HudButton>
              <HudButton variant="ghost" onClick={() => navigate(`/case/${id}/archive`)}>
                {t.result.viewCase}
              </HudButton>
            </motion.div>

          </motion.div>
        </PageLayout>
      </div>
    </RoomAtmosphere>
  );
}
