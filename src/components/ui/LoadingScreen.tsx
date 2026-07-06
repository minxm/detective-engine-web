import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { t } from '@/i18n/zh';

const BOOT_MSGS = [
  'CONNECTING TO IB MAINFRAME…',
  'LOADING SECURE MODULES…',
  'DECRYPTING CASE DATABASE…',
  'INITIALIZING AI ENGINE…',
];

/** AAA Game Loading Screen — 禁止普通 Spinner */
export default function LoadingScreen({ label = t.common.loading }: { label?: string }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    /* Animate progress bar */
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return p; }
        return p + Math.random() * 8 + 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((n) => (n + 1) % BOOT_MSGS.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">

      {/* IB Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 blur-2xl bg-spec-cyan/10 animate-pulse-cyan" />
        <div
          className="relative w-16 h-16 flex items-center justify-center"
          style={{
            clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)',
            background: 'rgba(11,15,20,0.9)',
            boxShadow: '0 0 0 1px rgba(229,9,20,0.3), 0 0 40px rgba(229,9,20,0.2)',
          }}
        >
          <span
            className="font-display font-black text-2xl text-spec-red"
            style={{ textShadow: '0 0 20px rgba(229,9,20,0.8)', animation: 'glitch 4s step-end infinite' }}
          >
            IB
          </span>
        </div>
      </motion.div>

      {/* 进度条 */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: '100%' }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs"
      >
        {/* 标签 */}
        <div className="flex justify-between items-center mb-2">
          <motion.span
            key={msgIdx}
            className="font-mono text-[9px] text-spec-cyan/55 tracking-[0.15em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {BOOT_MSGS[msgIdx]}
          </motion.span>
          <span className="font-mono text-[9px] text-spec-cyan/40 tabular-nums">
            {Math.min(99, Math.round(progress))}%
          </span>
        </div>

        {/* 进度条轨道 */}
        <div
          className="relative h-1.5 w-full overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.6)',
            clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.1)',
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            animate={{ width: `${Math.min(99, progress)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(90deg, rgba(0,245,255,0.4), rgba(0,245,255,0.9), rgba(229,9,20,0.6))',
              boxShadow: '0 0 8px rgba(0,245,255,0.5)',
            }}
          />
          {/* 扫描光 */}
          <div
            className="absolute inset-y-0 w-8"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'data-stream 1.5s linear infinite',
            }}
          />
        </div>

        {/* 底部系统文字 */}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-1.5 h-1.5 rounded-full bg-spec-red"
            style={{ animation: 'pulse-red 1s ease-in-out infinite', boxShadow: '0 0 6px rgba(229,9,20,0.8)' }}
          />
          <span
            className="font-mono text-[8px] tracking-[0.25em] uppercase"
            style={{ color: 'rgba(0,245,255,0.4)', animation: 'data-flicker 3s step-end infinite' }}
          >
            {label}
          </span>
          <span className="boot-cursor" style={{ width: 6, height: 10 }} />
        </div>
      </motion.div>
    </div>
  );
}
