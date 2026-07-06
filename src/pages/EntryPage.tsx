import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '@/components/ParticleBackground';
import CinematicBackdrop from '@/components/CinematicBackdrop';

/* ─── Boot sequence lines ─── */
const BOOT_LINES = [
  { text: 'INTELLIGENCE BUREAU MAINFRAME v4.7.2', delay: 0 },
  { text: 'INITIALIZING SECURE CONNECTION...', delay: 180 },
  { text: 'BIOMETRIC PROTOCOL LOADED ✓', delay: 360 },
  { text: 'AI DEDUCTION ENGINE ONLINE ✓', delay: 540 },
  { text: 'CASE DATABASE SYNC COMPLETE ✓', delay: 720 },
  { text: 'NEURAL INTERFACE READY ✓', delay: 900 },
  { text: 'CLASSIFIED ACCESS GRANTED — SEC-LVL-5', delay: 1100 },
];

/* ─── Scan corner component ─── */
function ScanCorners({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top-left */}
      <div className="absolute top-0 left-0 w-6 h-6">
        <div className="absolute top-0 left-0 w-full h-px bg-spec-cyan shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
        <div className="absolute top-0 left-0 h-full w-px bg-spec-cyan shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
      </div>
      {/* Top-right */}
      <div className="absolute top-0 right-0 w-6 h-6">
        <div className="absolute top-0 right-0 w-full h-px bg-spec-cyan shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
        <div className="absolute top-0 right-0 h-full w-px bg-spec-cyan shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 w-6 h-6">
        <div className="absolute bottom-0 left-0 w-full h-px bg-spec-cyan shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
        <div className="absolute bottom-0 left-0 h-full w-px bg-spec-cyan shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 w-6 h-6">
        <div className="absolute bottom-0 right-0 w-full h-px bg-spec-red shadow-[0_0_6px_rgba(229,9,20,0.8)]" />
        <div className="absolute bottom-0 right-0 h-full w-px bg-spec-red shadow-[0_0_6px_rgba(229,9,20,0.8)]" />
      </div>
    </motion.div>
  );
}

/* ─── HUD Status Line ─── */
function HudStatusLine({ x, y, value, label }: { x: 'left' | 'right'; y: 'top' | 'bottom'; value: string; label: string }) {
  return (
    <motion.div
      className={`absolute font-mono text-[8px] tracking-[0.2em] pointer-events-none ${
        x === 'left' ? 'left-8' : 'right-8'
      } ${y === 'top' ? 'top-8' : 'bottom-8'}`}
      initial={{ opacity: 0, x: x === 'left' ? -20 : 20 }}
      animate={{ opacity: 0.5, x: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
    >
      <span className="text-spec-cyan/40">{label}</span>
      <br />
      <span className="text-spec-cyan/70">{value}</span>
    </motion.div>
  );
}

export default function EntryPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'black' | 'boot' | 'reveal' | 'ready'>('black');
  const [bootLines, setBootLines] = useState<number[]>([]);
  const [scanX, setScanX] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);

  /* Check if already seen */
  useEffect(() => {
    if (sessionStorage.getItem('detective-entry-seen') === '1') {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  /* Phase sequence */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('boot'), 400);
    const t2 = setTimeout(() => setPhase('reveal'), 1600);
    const t3 = setTimeout(() => setPhase('ready'), 2600);
    const t4 = setTimeout(() => setScanX(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  /* Reveal boot lines incrementally */
  useEffect(() => {
    if (phase !== 'boot') return;
    const timers = BOOT_LINES.map((_, i) =>
      setTimeout(() => setBootLines((prev) => [...prev, i]), i * 170)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleEnter = () => {
    sessionStorage.setItem('detective-entry-seen', '1');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-spec-black relative overflow-hidden flex items-center justify-center">
      <CinematicBackdrop variant="entry" />
      <ParticleBackground />

      {/* ── 电影信箱黑边 ── */}
      <motion.div
        className="fixed top-0 inset-x-0 z-[80] pointer-events-none"
        initial={{ height: '80px' }}
        animate={{ height: phase === 'ready' ? '56px' : '80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: '#000' }}
      />
      <motion.div
        className="fixed bottom-0 inset-x-0 z-[80] pointer-events-none"
        initial={{ height: '80px' }}
        animate={{ height: phase === 'ready' ? '56px' : '80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: '#000' }}
      />

      {/* ── 全屏扫描线 ── */}
      <AnimatePresence>
        {scanX && (
          <motion.div
            key="scan"
            className="fixed inset-x-0 z-[70] pointer-events-none"
            style={{
              height: '3px',
              background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.8), rgba(229,9,20,0.4), rgba(0,245,255,0.8), transparent)',
              boxShadow: '0 0 20px rgba(0,245,255,0.6)',
            }}
            initial={{ top: '-5%', opacity: 0 }}
            animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* ── Boot Terminal ── */}
      <AnimatePresence>
        {(phase === 'boot' || phase === 'reveal') && (
          <motion.div
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-8 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="boot-terminal space-y-0.5">
              {BOOT_LINES.map((line, i) => (
                <AnimatePresence key={i}>
                  {bootLines.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={i === bootLines[bootLines.length - 1] ? 'boot-line-active' : 'boot-line-done'}
                    >
                      <span className="text-spec-cyan/30 mr-2">{'>'}</span>
                      {line.text}
                      {i === bootLines[bootLines.length - 1] && <span className="boot-cursor ml-1" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 主内容区 ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'ready' ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* IB 徽章 */}
        <motion.div
          className="relative mb-10"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: phase === 'ready' ? 1 : 0.6, opacity: phase === 'ready' ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 外环光晕 */}
          <div className="absolute inset-0 -m-6 rounded-full bg-spec-red/5 blur-2xl animate-pulse-red" />

          {/* Ping 圆环 */}
          <div className="absolute inset-0 -m-8 rounded-full border border-spec-cyan/10 animate-ping-slow" />

          {/* 主徽章 */}
          <motion.div
            className="ib-emblem w-32 h-32"
            animate={{
              boxShadow: [
                '0 0 30px rgba(229,9,20,0.25)',
                '0 0 80px rgba(229,9,20,0.5)',
                '0 0 30px rgba(229,9,20,0.25)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* 内层菱形 */}
            <div
              className="w-20 h-20 flex flex-col items-center justify-center relative z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(17,24,32,0.9), rgba(11,15,20,0.95))',
                clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                border: '1px solid rgba(0,245,255,0.2)',
              }}
            >
              <span
                className="font-display font-black text-3xl tracking-widest"
                style={{
                  color: '#E50914',
                  textShadow: '0 0 30px rgba(229,9,20,0.8), 0 0 60px rgba(229,9,20,0.4)',
                  WebkitTextStroke: '0.5px rgba(229,9,20,0.6)',
                }}
              >
                IB
              </span>
              <div className="w-8 h-px bg-spec-cyan/40 mt-1" />
            </div>
          </motion.div>
        </motion.div>

        {/* 顶部标签 */}
        <motion.div
          className="flex items-center gap-3 mb-5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: phase === 'ready' ? 1 : 0, y: phase === 'ready' ? 0 : -10 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-spec-cyan/50" />
          <span className="hud-label text-[9px]">CLASSIFIED · SEC-LVL-5 · AUTHORIZED ONLY</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-spec-cyan/50" />
        </motion.div>

        {/* 主标题 — 超大 Persona 5 风格 */}
        <motion.div
          className="relative mb-3"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: phase === 'ready' ? 1 : 0,
            scale: phase === 'ready' ? 1 : 0.9,
            y: phase === 'ready' ? 0 : 20,
          }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 背景大字 — 装饰 */}
          <div
            className="absolute -inset-4 font-display font-black uppercase text-[clamp(4rem,15vw,9rem)] text-white/[0.015] select-none leading-none pointer-events-none"
            style={{ letterSpacing: '0.15em' }}
            aria-hidden
          >
            <span className="inline-block skew-x-[-4deg]">INTEL</span>
          </div>

          <div className="p5-title-wrap">
            <h1 className="p5-title text-[clamp(2.2rem,6vw,4rem)]">
              FUTURE
              <span className="p5-title-red ml-3">INTEL</span>
            </h1>
          </div>
          <div className="p5-title-wrap">
            <h1 className="p5-title text-[clamp(2.2rem,6vw,4rem)]">
              LIGENCE
              <span className="text-spec-cyan ml-2" style={{ textShadow: '0 0 30px rgba(0,245,255,0.7)' }}>
                BUREAU
              </span>
            </h1>
          </div>
        </motion.div>

        {/* 副标题 */}
        <motion.p
          className="font-mono text-[11px] text-spec-gray/60 tracking-[0.35em] uppercase mb-8 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'ready' ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          AI SPECIAL INVESTIGATOR SYSTEM · 2047
        </motion.p>

        {/* 分割线 */}
        <motion.div
          className="relative w-full max-w-sm mb-10"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: phase === 'ready' ? 1 : 0, opacity: phase === 'ready' ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ transformOrigin: 'center' }}
        >
          <div className="hud-divider" />
          <div className="absolute inset-x-0 -top-2 flex justify-center">
            <div className="w-1 h-1 bg-spec-red rotate-45 shadow-[0_0_6px_rgba(229,9,20,0.8)]" />
          </div>
        </motion.div>

        {/* ENTER 按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{
            opacity: phase === 'ready' ? 1 : 0,
            y: phase === 'ready' ? 0 : 16,
            scale: phase === 'ready' ? 1 : 0.95,
          }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            ref={enterRef}
            onClick={handleEnter}
            className="enter-btn group"
            type="button"
          >
            <span className="relative z-10 flex items-center gap-4">
              {/* 左装饰 */}
              <span className="w-6 h-px bg-white/40 group-hover:w-10 transition-all duration-300" />
              ENTER BUREAU
              <span className="w-6 h-px bg-white/40 group-hover:w-10 transition-all duration-300" />
            </span>
          </button>
        </motion.div>

        {/* 底部状态 */}
        <motion.p
          className="mt-8 font-mono text-[8px] text-spec-gray/35 tracking-[0.4em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'ready' ? 1 : 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            ● LIVE
          </motion.span>
          {' '}· SECURE CHANNEL ESTABLISHED · ENCRYPTION 4096-BIT
        </motion.p>
      </motion.div>

      {/* ── 四角 HUD 状态数据 ── */}
      <HudStatusLine x="left" y="top" label="UNIT" value="IB-MAINFRAME-04" />
      <HudStatusLine x="right" y="top" label="STATUS" value="OPERATIONAL" />
      <HudStatusLine x="left" y="bottom" label="PROTOCOL" value="SEC-LEVEL-ALPHA" />
      <HudStatusLine x="right" y="bottom" label="TIMESTAMP" value="2047.03.15 · 03:17" />

      {/* ── 中央扫描角线 ── */}
      <ScanCorners active={phase === 'ready'} />

      {/* ── P5 风格斜切背景装饰线 ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -left-1/4 top-1/3 w-[150%] h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.35), transparent)',
            transform: 'rotate(-6deg)',
          }}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '0%', opacity: phase === 'ready' ? 1 : 0 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-1/3 w-[150%] h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), transparent)',
            transform: 'rotate(-6deg)',
          }}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: '0%', opacity: phase === 'ready' ? 1 : 0 }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* 垂直装饰线 */}
        <motion.div
          className="absolute top-0 left-[15%] w-px h-full"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(229,9,20,0.15), transparent)' }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: phase === 'ready' ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <motion.div
          className="absolute top-0 right-[15%] w-px h-full"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(0,245,255,0.1), transparent)' }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: phase === 'ready' ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
      </div>
    </div>
  );
}
