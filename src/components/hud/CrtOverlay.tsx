import { useEffect, useRef } from 'react';

/** 全局 CRT 效果叠加层 — Cyberpunk / Detroit / Persona 5 风格 */
export default function CrtOverlay() {
  const noiseRef = useRef<HTMLCanvasElement>(null);

  /* 动态噪波 (可选，每帧更新很耗性能，降频到 10fps) */
  useEffect(() => {
    const canvas = noiseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawNoise = (time: number) => {
      /* 限制到 ~8fps，降低性能消耗 */
      if (time - lastTime < 120) {
        animId = requestAnimationFrame(drawNoise);
        return;
      }
      lastTime = time;

      const W = canvas.width;
      const H = canvas.height;
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;

      /* 超轻量噪波 — 只写 1/4 的像素 */
      for (let i = 0; i < data.length; i += 16) {
        const v = Math.random() * 14;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = Math.random() * 20;
      }
      ctx.putImageData(imageData, 0, 0);
      animId = requestAnimationFrame(drawNoise);
    };

    resize();
    animId = requestAnimationFrame(drawNoise);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>

      {/* ── 扫描线纹路 ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
          opacity: 0.045,
          animation: 'crt-flicker 8s step-end infinite',
        }}
      />

      {/* ── 动态噪波 canvas ── */}
      <canvas
        ref={noiseRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.018, mixBlendMode: 'screen' }}
      />

      {/* ── 晕影（边缘暗化）── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
          opacity: 0.7,
        }}
      />

      {/* ── 顶部轻微色差（ChromaticAberration 感）── */}
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(229,9,20,0.06) 30%, rgba(0,245,255,0.06) 70%, transparent 95%)',
        }}
      />
    </div>
  );
}
