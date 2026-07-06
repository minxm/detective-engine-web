import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, Trophy, AlertTriangle, Radio, Target, ChevronRight, Zap } from 'lucide-react';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthStore } from '@/hooks/useAuthStore';
import { fetchHistory } from '@/services/history';
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
    void fetchHistory()
      .then((res) => {
        const entries = res.entries ?? [];
        setActiveCases(entries.filter((e) => e.status !== 'completed').length);
        setCompletedCases(entries.filter((e) => e.status === 'completed').length);
      })
      .catch(() => { setActiveCases(0); setCompletedCases(0); });
  }, []);

  const threatLevel = Math.min(97, activeCases * 18 + 12);
  const totalCases = activeCases + completedCases;

  const FEED_LINES = [
    `特工 ${nickname ?? '未知'} — 会话已认证`,
    `${activeCases} 个案件进行中`,
    'AI 推理引擎：运行正常',
    '安全链路：已建立',
    '生物特征：已验证',
    `累计破案：${completedCases} 件 | 成功率：${totalCases ? Math.round((completedCases / totalCases) * 100) : 0}%`,
  ];

  return (
    <div className="min-h-screen bg-spec-black relative z-10 overflow-hidden page-shell">
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
          className="pt-8 pb-6 lg:pb-8 flex items-end justify-between gap-4 flex-wrap"
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

        {/* ── 三栏布局 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_240px_minmax(0,1fr)] gap-6 lg:gap-x-8 lg:items-start pb-10">

          {/* 左栏 — 统计 */}
          <motion.div
            className="space-y-3 lg:min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="hud-label mb-2">任务统计</p>

            <div className="grid grid-cols-2 gap-2">
              <StatBlock label="进行中" value={activeCases} sub="案件" color="red" delay={0.25} />
              <StatBlock label="已破获" value={completedCases} sub="案件" color="cyan" delay={0.3} />
              <StatBlock
                label="成功率"
                value={totalCases ? `${Math.round((completedCases / totalCases) * 100)}%` : '—'}
                sub="SUCCESS"
                color="gold"
                delay={0.35}
              />
              <StatBlock label="等级" value={completedCases >= 10 ? 'S' : completedCases >= 5 ? 'A' : 'B'} sub="特工" color="cyan" delay={0.4} />
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
                    <div className={`w-1 h-1 rounded-full ${s.ok ? 'bg-green-400' : 'bg-spec-red'}`}
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
          </motion.div>

          {/* 中栏 — AI 核心（PC 面板 / 移动端保持原样） */}
          <motion.div
            className="flex flex-col items-center justify-start pt-4 lg:pt-0 lg:sticky lg:top-20 lg:w-full lg:min-w-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hud-label mb-4 lg:mb-2 text-center lg:text-left w-full">AI核心 · 监控</p>

            <div className="flex flex-col items-center w-full max-w-[200px] lg:max-w-none lg:p-6 lg:min-h-[320px] lg:justify-between lg:relative">
              {/* PC 面板样式 — 通过 lg 类覆盖 */}
              <div
                className="hidden lg:block absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(11,15,20,0.8), rgba(17,24,32,0.6))',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.1)',
                }}
              />
              <div className="hidden lg:block absolute left-0 top-1/2 -translate-x-full w-8 h-px bg-gradient-to-l from-spec-cyan/20 to-transparent" />
              <div className="hidden lg:block absolute right-0 top-1/2 translate-x-full w-8 h-px bg-gradient-to-r from-spec-cyan/20 to-transparent" />

              <div className="relative z-10 text-center space-y-1 lg:space-y-2 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:py-4">
                <div
                  className="hidden lg:flex mx-auto w-16 h-16 items-center justify-center mb-2"
                  style={{
                    background: 'rgba(0,245,255,0.06)',
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.2)',
                  }}
                >
                  <Zap className="w-6 h-6 text-spec-cyan" style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.6))' }} />
                </div>
                <p
                  className="font-display font-black text-xs tracking-[0.25em] text-spec-cyan"
                  style={{ textShadow: '0 0 12px rgba(0,245,255,0.6)' }}
                >
                  AI · 推理引擎
                </p>
                <p className="font-mono text-[8px] text-spec-gray/35 tracking-widest">
                  分析就绪 · 系统正常
                </p>
              </div>

              <Link
                to="/archive?action=new"
                className="group relative z-10 flex items-center justify-center gap-3 w-full py-4 lg:hover:scale-[1.02] transition-all duration-200"
                style={{
                  clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
                  background: 'linear-gradient(180deg, rgba(229,9,20,0.15), rgba(229,9,20,0.06))',
                  boxShadow: '0 0 0 1px rgba(229,9,20,0.5), 0 0 30px rgba(229,9,20,0.12)',
                }}
              >
                <motion.div
                  className="flex items-center justify-center gap-3 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Zap className="w-4 h-4 text-spec-red group-hover:drop-shadow-[0_0_6px_rgba(229,9,20,0.8)] transition-all" />
                  <span
                    className="font-display font-black text-xs tracking-[0.2em] uppercase text-white"
                    style={{ textShadow: '0 0 12px rgba(229,9,20,0.5)' }}
                  >
                    开始任务
                  </span>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* 右栏 — 功能入口 */}
          <motion.div
            className="space-y-3 lg:min-w-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="hud-label mb-2">功能入口</p>

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
              desc="查看进行中的案件，继续调查"
              to="/archive?filter=active"
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

            {/* 近期动态 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
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
