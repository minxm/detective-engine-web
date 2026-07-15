import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, Trophy, AlertTriangle, Radio, Target, ChevronRight, Zap, Activity } from 'lucide-react';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthStore } from '@/hooks/useAuthStore';
import { fetchHistoryStats } from '@/services/history';
import { t } from '@/i18n/zh';

/* ─── Stat Block ─── */
function StatBlock({
  label, value, sub, color = 'cyan', delay = 0,
}: {
  label: string; value: string | number; sub?: string;
  color?: 'cyan' | 'red' | 'gold'; delay?: number;
}) {
  const colors = {
    cyan: { text: 'text-spec-cyan', glow: '0 0 16px rgba(0,245,255,0.4)', border: 'rgba(0,245,255,0.2)' },
    red:  { text: 'text-spec-red', glow: '0 0 16px rgba(229,9,20,0.4)', border: 'rgba(229,9,20,0.2)' },
    gold: { text: 'text-yellow-400', glow: '0 0 16px rgba(212,168,83,0.4)', border: 'rgba(212,168,83,0.2)' },
  }[color];
  return (
    <motion.div
      className="relative p-3 flex flex-col"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{
        background: 'rgba(11,15,20,0.7)',
        clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
        boxShadow: `inset 0 0 0 1px ${colors.border}`,
      }}
    >
      <p className="font-mono text-[8px] text-spec-gray/40 tracking-[0.2em] mb-1">{label}</p>
      <p
        className={`font-display font-black text-2xl leading-none ${colors.text}`}
        style={{ textShadow: colors.glow }}
      >
        {value}
      </p>
      {sub && <p className="font-mono text-[9px] text-spec-gray/40 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ─── Module Card ─── */
function ModuleCard({
  icon: Icon, title, desc, to, color = 'cyan', delay = 0, badge,
}: {
  icon: React.ElementType; title: string; desc: string; to: string;
  color?: 'cyan' | 'red'; delay?: number; badge?: string;
}) {
  const isRed = color === 'red';
  return (
    <Link
      to={to}
      className="group relative block overflow-hidden transition-all duration-300"
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(17,24,32,0.7), rgba(11,15,20,0.8))',
        clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
        boxShadow: `inset 0 0 0 1px ${isRed ? 'rgba(229,9,20,0.12)' : 'rgba(0,245,255,0.1)'}`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: isRed ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${isRed ? 'rgba(229,9,20,0.06)' : 'rgba(0,245,255,0.04)'}, transparent)`,
          }}
        />
        <div
          className="absolute left-0 top-3 bottom-3 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isRed
              ? 'linear-gradient(180deg, transparent, rgba(229,9,20,0.8), transparent)'
              : 'linear-gradient(180deg, transparent, rgba(0,245,255,0.8), transparent)',
          }}
        />

        <div className="relative z-10 flex items-start gap-4">
          <div
            className="shrink-0 w-10 h-10 flex items-center justify-center transition-all duration-300"
            style={{
              clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              background: isRed ? 'rgba(229,9,20,0.08)' : 'rgba(0,245,255,0.06)',
              boxShadow: `inset 0 0 0 1px ${isRed ? 'rgba(229,9,20,0.3)' : 'rgba(0,245,255,0.2)'}`,
            }}
          >
            <Icon
              className={`w-5 h-5 transition-all duration-300 ${isRed ? 'text-spec-red group-hover:drop-shadow-neon-red' : 'text-spec-cyan group-hover:drop-shadow-neon-cyan'}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-display text-sm font-black tracking-wider uppercase ${isRed ? 'text-white group-hover:text-spec-red' : 'text-white group-hover:text-spec-cyan'} transition-colors duration-200`}
              >
                {title}
              </h3>
              {badge && (
                <span
                  className="font-mono text-[8px] px-1.5 py-0.5 tracking-widest"
                  style={{
                    background: isRed ? 'rgba(229,9,20,0.1)' : 'rgba(0,245,255,0.08)',
                    boxShadow: `inset 0 0 0 1px ${isRed ? 'rgba(229,9,20,0.3)' : 'rgba(0,245,255,0.2)'}`,
                    color: isRed ? '#E50914' : '#00F5FF',
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-[12px] text-spec-gray/55 leading-snug">{desc}</p>
            <div className={`flex items-center gap-1 mt-2 font-mono text-[9px] tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 ${isRed ? 'text-spec-red' : 'text-spec-cyan'}`}>
              进入 <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Tactical Feed Line ─── */
function TacticalFeed({ items }: { items: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((n) => (n + 1) % items.length), 3000);
    return () => clearInterval(id);
  }, [items.length]);
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="w-1 h-1 bg-spec-red rounded-full shrink-0 animate-pulse-red" />
      <motion.span
        key={idx}
        className="font-mono text-[9px] text-spec-gray/50 tracking-wider truncate"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
      >
        {items[idx]}
      </motion.span>
    </div>
  );
}

export default function LobbyPage() {
  const nickname = useAuthStore((s) => s.nickname);
  const authMode = useAuthStore((s) => s.authMode);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [activeCases, setActiveCases] = useState(0);
  const [completedCases, setCompletedCases] = useState(0);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void fetchHistoryStats()
      .then((res) => {
        setActiveCases(res.stats.active);
        setCompletedCases(res.stats.completed);
      })
      .catch(() => { setActiveCases(0); setCompletedCases(0); });
  }, [authMode]);

  const threatLevel = Math.min(97, activeCases * 18 + 12);
  const totalCases = activeCases + completedCases;

  const FEED_LINES = [
    `特工 ${nickname ?? '未知'} — 会话已认证`,
    `${activeCases} 个案件进行中`,
    'AI 推理引擎：运行正常',
    '安全链路：已建立',
    '访问凭证：有效',
    `累计破案：${completedCases} 件 | 成功率：${totalCases ? Math.round((completedCases / totalCases) * 100) : 0}%`,
  ];

  return (
    <div className="flex-1 bg-spec-black relative z-10 overflow-hidden page-shell">
      <CinematicBackdrop variant="lobby" />
      <ParticleBackground />

      {/* ══ TOP HUD BAR ══ */}
      <motion.div
        className="relative z-20 flex items-center justify-between px-6 py-2 border-b border-spec-cyan/06"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(180deg, rgba(11,15,20,0.9), rgba(11,15,20,0.6))',
          borderBottom: '1px solid rgba(0,245,255,0.06)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-8 h-8 shrink-0"
            style={{
              clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)',
              background: 'rgba(229,9,20,0.12)',
              boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.3)',
            }}
          >
            <span className="font-display font-black text-xs text-spec-red" style={{ textShadow: '0 0 8px rgba(229,9,20,0.8)' }}>IB</span>
          </div>
          <div>
            <p className="font-mono text-[8px] text-spec-gray/30 tracking-[0.25em]">情 报 局</p>
            <p className="font-mono text-[9px] text-spec-cyan/60 tracking-wider">指挥中心 · 在线</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <TacticalFeed items={FEED_LINES} />
          <div className="hidden sm:flex items-center gap-2">
            <Radio className="w-3 h-3 text-spec-cyan/50 animate-pulse" />
            <span className="font-mono text-[9px] text-spec-cyan/50 tabular-nums">{time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-spec-red"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-mono text-[8px] text-spec-red/60 tracking-widest">LIVE</span>
          </div>
        </div>
      </motion.div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-5xl lg:max-w-6xl">

        {/* ── 顶部 Agent 标识 ── */}
        <motion.div
          className="pt-8 pb-6 flex items-end justify-between gap-4 flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="hud-label mb-3">指挥中心 · 总部大厅</p>
            <div className="p5-title-wrap">
              <h1 className="p5-title text-[clamp(1.8rem,4vw,3rem)]">
                INTELLIGENCE{' '}
                <span className="p5-title-red">BUREAU</span>
              </h1>
            </div>
            <p className="font-mono text-[11px] text-spec-gray/50 mt-2 tracking-wide">
              AI 特别调查员指挥中心 — CLASSIFIED ACCESS
            </p>
          </div>

          <div className="text-right">
            <p className="font-mono text-[8px] text-spec-gray/30 tracking-[0.25em] mb-1">当前特工</p>
            <p
              className="font-display font-black text-lg text-spec-cyan tracking-wider"
              style={{ textShadow: '0 0 20px rgba(0,245,255,0.5)' }}
            >
              {nickname ?? '特工'}
            </p>
            <p className="font-mono text-[8px] text-spec-gray/30 mt-0.5 tracking-wider">权限等级 · LEVEL 5</p>
          </div>
        </motion.div>

        {/* ── PC 两列 / 移动单列 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start pb-10">

          {/* ═══ 左/主列：CTA + 功能入口 ═══ */}
          <motion.div
            className="space-y-3 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* 开始任务 — 大 CTA 卡片（PC 端突出展示） */}
            <Link
              to="/new-case"
              className="group relative block overflow-hidden transition-all duration-300"
              style={{
                padding: '20px 28px',
                background: 'linear-gradient(135deg, rgba(229,9,20,0.12), rgba(17,24,32,0.85))',
                clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                boxShadow: '0 0 0 1px rgba(229,9,20,0.35), 0 0 40px rgba(229,9,20,0.08)',
              }}
            >
              <motion.div
                className="flex items-center gap-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <div
                  className="shrink-0 w-12 h-12 flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                    background: 'rgba(229,9,20,0.12)',
                    boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.4)',
                  }}
                >
                  <Zap
                    className="w-6 h-6 text-spec-red group-hover:drop-shadow-neon-red transition-all duration-300"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(229,9,20,0.4))' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-display font-black text-base tracking-[0.2em] uppercase text-white group-hover:text-spec-red transition-colors duration-200"
                    style={{ textShadow: '0 0 16px rgba(229,9,20,0.3)' }}
                  >
                    开始任务
                  </h3>
                  <p className="font-mono text-[11px] text-spec-gray/50 mt-0.5 leading-snug">
                    AI 生成专属案件，选择难度立即出发
                  </p>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] text-spec-red/60 tracking-wider group-hover:text-spec-red transition-colors shrink-0">
                  进入 <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
              {/* 光晕 */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(229,9,20,0.06), transparent)' }}
              />
              <div
                className="absolute left-0 top-3 bottom-3 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(229,9,20,0.9), transparent)' }}
              />
            </Link>

            {/* 功能入口 */}
            <p className="hud-label mt-5 mb-2">功能入口</p>

            <ModuleCard
              icon={Archive}
              title={t.flow.modules[0]?.title ?? '案件档案库'}
              desc={t.flow.modules[0]?.desc ?? '查阅所有案件档案，开启新调查'}
              to="/archive"
              color="cyan"
              delay={0.35}
              badge="PRIMARY"
            />
            <ModuleCard
              icon={Target}
              title="进行中案件"
              desc="查看进行中的案件，继续未完成的调查"
              to="/active"
              color="red"
              delay={0.4}
              badge={activeCases > 0 ? `${activeCases}` : undefined}
            />
            <ModuleCard
              icon={Trophy}
              title={t.flow.modules[1]?.title ?? '排行榜'}
              desc={t.flow.modules[1]?.desc ?? '全球侦探排行榜，比较战绩'}
              to="/leaderboard"
              color="cyan"
              delay={0.45}
            />
            {isAdmin && (
              <ModuleCard
                icon={Activity}
                title={t.admin.title}
                desc={t.admin.subtitle}
                to="/admin"
                color="red"
                delay={0.5}
                badge="ADMIN"
              />
            )}
          </motion.div>

          {/* ═══ 右/侧边栏：统计 + 系统状态 ═══ */}
          <motion.div
            className="space-y-3 min-w-0 mt-6 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <p className="hud-label mb-2">任务统计</p>

            <div className="grid grid-cols-2 gap-2">
              <StatBlock label="进行中" value={activeCases} sub="案件" color="red" delay={0.3} />
              <StatBlock label="已破获" value={completedCases} sub="案件" color="cyan" delay={0.35} />
              <StatBlock
                label="成功率"
                value={totalCases ? `${Math.round((completedCases / totalCases) * 100)}%` : '0%'}
                sub="SUCCESS"
                color="gold"
                delay={0.4}
              />
              <StatBlock
                label="等级"
                value={completedCases >= 10 ? 'S' : completedCases >= 5 ? 'A' : 'B'}
                sub="特工"
                color="cyan"
                delay={0.45}
              />
            </div>

            {/* 威胁仪表盘 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 space-y-2"
              style={{
                background: 'linear-gradient(135deg, rgba(11,15,20,0.8), rgba(17,24,32,0.6))',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                boxShadow: activeCases > 2
                  ? 'inset 0 0 0 1px rgba(229,9,20,0.2), 0 0 20px rgba(229,9,20,0.05)'
                  : 'inset 0 0 0 1px rgba(0,245,255,0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${threatLevel > 60 ? 'text-spec-red' : 'text-spec-cyan/60'}`} />
                  <span className="font-mono text-[9px] text-spec-gray/50 tracking-[0.2em]">威胁等级</span>
                </div>
                <span
                  className="font-mono text-sm font-bold"
                  style={{
                    color: threatLevel > 60 ? '#E50914' : '#00F5FF',
                    textShadow: threatLevel > 60 ? '0 0 10px rgba(229,9,20,0.6)' : '0 0 10px rgba(0,245,255,0.6)',
                  }}
                >
                  {threatLevel > 60 ? '高' : threatLevel > 30 ? '中' : '低'}
                </span>
              </div>
              <div
                className="h-2 w-full"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.1)',
                }}
              >
                <motion.div
                  className="h-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${threatLevel}%` }}
                  transition={{ delay: 0.6, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: threatLevel > 60
                      ? 'linear-gradient(90deg, rgba(229,9,20,0.6), rgba(229,9,20,0.9))'
                      : 'linear-gradient(90deg, rgba(0,245,255,0.4), rgba(0,245,255,0.8))',
                    boxShadow: `0 0 8px ${threatLevel > 60 ? 'rgba(229,9,20,0.5)' : 'rgba(0,245,255,0.4)'}`,
                  }}
                />
              </div>
              <div className="flex justify-between">
                {[0, 25, 50, 75, 100].map((v) => (
                  <span key={v} className="font-mono text-[7px] text-spec-gray/25">{v}</span>
                ))}
              </div>
            </motion.div>

            {/* 系统状态 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-1.5 p-3"
              style={{
                background: 'rgba(11,15,20,0.6)',
                boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.07)',
              }}
            >
              <p className="font-mono text-[8px] text-spec-gray/30 tracking-[0.25em] mb-2">系统状态</p>
              {[
                { name: 'AI 推理引擎', status: '在线', ok: true },
                { name: '案件数据库', status: '同步', ok: true },
                { name: '安全链路',   status: '加密', ok: true },
                { name: '神经网络',   status: '激活', ok: true },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-spec-gray/40">{s.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1 h-1 rounded-full ${s.ok ? 'bg-green-400' : 'bg-spec-red'}`}
                      style={{ boxShadow: s.ok ? '0 0 4px rgba(74,222,128,0.8)' : '0 0 4px rgba(229,9,20,0.8)' }}
                    />
                    <span
                      className="font-mono text-[8px] tracking-wider"
                      style={{ color: s.ok ? 'rgba(74,222,128,0.7)' : 'rgba(229,9,20,0.7)' }}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* 近期动态 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="p-4 space-y-2"
              style={{
                background: 'rgba(11,15,20,0.6)',
                boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.07)',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
              }}
            >
              <p className="font-mono text-[8px] text-spec-gray/30 tracking-[0.25em] mb-2">近期动态</p>
              {[
                { time: '03:14', msg: '案件 #7821 — 分析完成', color: 'cyan' },
                { time: '02:58', msg: '新物证已上传', color: 'gold' },
                { time: '02:31', msg: '特工登录记录', color: 'gray' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-mono text-[8px] text-spec-gray/25 shrink-0 tabular-nums">{item.time}</span>
                  <span
                    className="font-mono text-[9px] leading-relaxed"
                    style={{
                      color: item.color === 'cyan' ? 'rgba(0,245,255,0.55)'
                        : item.color === 'gold' ? 'rgba(212,168,83,0.55)'
                        : 'rgba(138,143,152,0.4)',
                    }}
                  >
                    {item.msg}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ══ 底部 HUD 分类线 ══ */}
      <div className="fixed bottom-0 inset-x-0 h-px z-20" style={{
        background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.15) 30%, rgba(229,9,20,0.1) 70%, transparent)',
      }} />
    </div>
  );
}
