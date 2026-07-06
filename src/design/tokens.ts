/** Design spec tokens — AI 推理侦探平台 UI 规范 */
export const colors = {
  black: '#0B0F14',
  navy: '#111820',
  red: '#E50914',
  cyan: '#00F5FF',
  white: '#FFFFFF',
  gray: '#8A8F98',
} as const;

export const slant = { title: '-6deg', panel: '-3deg' } as const;

export const motion = {
  /* 标准页面切换 — 带 blur + y 偏移 */
  page: {
    initial: { opacity: 0, y: 20, filter: 'blur(8px) brightness(1.5)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)' },
    exit: { opacity: 0, y: -16, filter: 'blur(8px) brightness(0.7)' },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  /* Glitch 转场 — Persona 5 风格斜切 */
  glitch: {
    initial: { opacity: 0, x: -16, skewX: -4, filter: 'hue-rotate(90deg) brightness(2)' },
    animate: { opacity: 1, x: 0, skewX: 0, filter: 'hue-rotate(0deg) brightness(1)' },
    exit: { opacity: 0, x: 16, skewX: 4, filter: 'hue-rotate(-90deg) brightness(0.5)' },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
  /* 扫描入场 — Detroit 风格 */
  scan: {
    initial: { opacity: 0, clipPath: 'inset(50% 0 50% 0)' },
    animate: { opacity: 1, clipPath: 'inset(0% 0 0% 0)' },
    exit: { opacity: 0, clipPath: 'inset(50% 0 50% 0)' },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const;
