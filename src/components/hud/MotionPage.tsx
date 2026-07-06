import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { motion as motionTokens } from '@/design/tokens';

export default function MotionPage({
  children,
  className = '',
  variant = 'page',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'page' | 'glitch';
}) {
  const tokens = variant === 'glitch' ? motionTokens.glitch : motionTokens.page;
  return (
    <motion.div
      initial={tokens.initial}
      animate={tokens.animate}
      exit={tokens.exit}
      transition={tokens.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
