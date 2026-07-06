import { type ButtonHTMLAttributes, type ReactNode, useRef } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'ghost' | 'danger' | 'icon' | 'red';

/* ─── Audio Hook (pre-wired, audio files TBD) ─── */
function playClick(_variant: Variant) {
  // TODO: connect to /public/sfx/click.wav etc.
  // const ctx = new AudioContext();
  // const buffer = await ctx.decodeAudioData(sfxData);
  // const src = ctx.createBufferSource(); src.buffer = buffer; src.connect(ctx.destination); src.start();
}

/** AAA Game-Level HUD Button with mechanical feedback */
export default function HudButton({
  variant = 'primary',
  children,
  className = '',
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  const rippleRef = useRef<HTMLSpanElement>(null);

  const variantClass: Record<Variant, string> = {
    primary: 'hud-btn-primary',
    ghost:   'hud-btn-ghost',
    danger:  'hud-btn-danger',
    red:     'hud-btn-red',
    icon:    'hud-btn-icon',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    /* Mechanical ripple */
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rippleRef.current) {
      const ripple = rippleRef.current;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '0';
      ripple.style.height = '0';
      ripple.style.opacity = '1';
      /* Force reflow */
      void ripple.offsetWidth;
      const size = Math.max(btn.clientWidth, btn.clientHeight) * 2;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.marginLeft = `${-size / 2}px`;
      ripple.style.marginTop = `${-size / 2}px`;
      ripple.style.opacity = '0';
    }

    playClick(variant);
    onClick?.(e);
  };

  return (
    <motion.button
      type="button"
      className={`${variantClass[variant]} ${className}`}
      onClick={handleClick}
      whileTap={!props.disabled ? { scale: 0.98 } : undefined}
      {...(props as Record<string, unknown>)}
    >
      {children}
      {/* Mechanical ripple */}
      <span
        ref={rippleRef}
        className="absolute pointer-events-none rounded-full"
        style={{
          background:
            variant === 'primary' ? 'rgba(0, 245, 255, 0.12)' :
            variant === 'danger' || variant === 'red' ? 'rgba(229, 9, 20, 0.12)' :
            'rgba(255, 255, 255, 0.08)',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.4s ease-out, height 0.4s ease-out, opacity 0.4s ease-out',
          opacity: 0,
          width: 0,
          height: 0,
        }}
      />
    </motion.button>
  );
}
