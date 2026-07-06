import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

export default function FingerprintScanner({ active = true }: { active?: boolean }) {
  return (
    <div className="relative w-36 h-36 mx-auto mb-8">
      <div className="absolute inset-0 border border-spec-cyan/30 bg-spec-cyan/[0.03]" style={{ clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }} />
      <div className="absolute inset-2 border border-spec-cyan/15 overflow-hidden">
        {active && <div className="fp-scan-line" />}
        <div className="absolute inset-0 flex items-center justify-center">
          <Fingerprint className="w-20 h-20 text-spec-cyan/40" strokeWidth={1} />
        </div>
      </div>
      <motion.div
        className="absolute -inset-4 border border-spec-red/20 pointer-events-none"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)' }}
      />
    </div>
  );
}
