import { useEffect, useRef } from 'react';

/** 案件重建 3D 线框场景（Canvas 透视投影） */
export default function WireframeReconstruction({ label }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const verts: [number, number, number][] = [
      [-1, -0.6, -1], [1, -0.6, -1], [1, -0.6, 1], [-1, -0.6, 1],
      [-1, 0.6, -1], [1, 0.6, -1], [1, 0.6, 1], [-1, 0.6, 1],
      [0, 0.6, 0], [0, 1.2, 0], [-0.3, 0.9, 0.2], [0.3, 0.9, 0.2],
      [0, -0.3, 0.5], [0.4, -0.5, 0.3],
    ];
    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7], [8, 9], [9, 10], [9, 11], [8, 12], [12, 13],
    ];

    let raf = 0;
    const project = (x: number, y: number, z: number, rot: number) => {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const rx = x * cos - z * sin;
      const rz = x * sin + z * cos;
      const scale = 120 / (3 + rz);
      return { x: w / 2 + rx * scale, y: h * 0.55 + y * scale, z: rz };
    };

    const draw = () => {
      angleRef.current += 0.008;
      const rot = angleRef.current;
      ctx.fillStyle = 'rgba(11, 15, 20, 0.9)';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = -4; i <= 4; i++) {
        const a = project(i * 0.25, -0.6, -1, rot);
        const b = project(i * 0.25, -0.6, 1, rot);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const c = project(-1, -0.6, i * 0.25, rot);
        const d = project(1, -0.6, i * 0.25, rot);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }

      const projected = verts.map(([x, y, z]) => project(x, y, z, rot));

      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const depth = (pa.z + pb.z) / 2;
        const alpha = 0.2 + (depth + 1) * 0.25;
        const isBody = a >= 8 || b >= 8;
        ctx.strokeStyle = isBody ? `rgba(229, 9, 20, ${alpha})` : `rgba(0, 245, 255, ${alpha})`;
        ctx.lineWidth = isBody ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      const scanY = (Math.sin(angleRef.current * 2) * 0.5 + 0.5) * h;
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="wireframe-scene relative overflow-hidden mb-6 border border-spec-cyan/15"
      style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
    >
      <canvas ref={canvasRef} width={640} height={280} className="w-full h-[280px]" />
      {label && (
        <div className="absolute bottom-3 left-4 font-mono text-[9px] text-spec-cyan/60 tracking-widest uppercase">{label}</div>
      )}
      <div className="absolute top-3 right-4 font-mono text-[9px] text-spec-red/70 animate-data-flicker">WIREFRAME · SIM</div>
    </div>
  );
}
