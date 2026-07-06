import { useEffect, useRef } from 'react';

/** 审讯室 HUD 音频波形 */
export default function InterrogationWaveform({ active, variant = 'cyan' }: { active: boolean; variant?: 'cyan' | 'red' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const color = variant === 'red' ? '229, 9, 20' : '0, 245, 255';

    const draw = () => {
      frameRef.current += 1;
      const t = frameRef.current * 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bars = 48;
      const gap = w / bars;
      for (let i = 0; i < bars; i++) {
        const x = i * gap + gap * 0.2;
        const bw = gap * 0.5;
        const base = active ? 0.15 + Math.abs(Math.sin(t + i * 0.35)) * 0.55 + Math.random() * 0.08 : 0.08 + Math.sin(t * 0.5 + i) * 0.04;
        const barH = base * h;
        const y = (h - barH) / 2;
        const alpha = active ? 0.5 + base * 0.5 : 0.2;
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fillRect(x, y, bw, barH);
      }

      ctx.strokeStyle = `rgba(${color}, 0.15)`;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, variant]);

  return <canvas ref={canvasRef} width={320} height={48} className="w-full h-12 opacity-90" aria-hidden />;
}
