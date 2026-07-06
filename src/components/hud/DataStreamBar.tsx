import { motion } from 'framer-motion';

export default function DataStreamBar({
  value,
  max = 100,
  label,
  className = '',
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`data-stream-bar ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[9px] text-spec-cyan/60 tracking-[0.2em] uppercase">{label}</span>
          <span className="font-mono text-[9px] text-spec-cyan/80">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="data-stream-track">
        <motion.div
          className="data-stream-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="data-stream-scan" />
      </div>
    </div>
  );
}
