import { useEffect, useRef, useState } from 'react';

/** AAA 自定义鼠标光晕 — 机械感十字准星 + 发光尾迹 */
export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const counterRef = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      /* Add trail point */
      counterRef.current++;
      const id = counterRef.current;
      setTrail((prev) => {
        const next = [...prev.slice(-6), { x: e.clientX, y: e.clientY, id }];
        return next;
      });
    };
    const leave = () => setVisible(false);
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseleave', leave);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden>

      {/* 尾迹光点 */}
      {trail.map((point, i) => (
        <div
          key={point.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: point.x - 2,
            top: point.y - 2,
            background: i % 2 === 0 ? 'rgba(0,245,255,0.4)' : 'rgba(229,9,20,0.3)',
            boxShadow: i % 2 === 0 ? '0 0 4px rgba(0,245,255,0.5)' : '0 0 4px rgba(229,9,20,0.5)',
            opacity: (i + 1) / (trail.length + 1) * 0.5,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* 环境光晕 */}
      <div
        className="absolute rounded-full transition-all duration-75"
        style={{
          left: pos.x - 200,
          top: pos.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)',
          opacity: clicking ? 0.8 : 0.5,
        }}
      />

      {/* 十字准星 */}
      <div
        className="absolute transition-all duration-75"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${clicking ? 0.85 : 1})`,
        }}
      >
        {/* 中心点 */}
        <div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: -3, top: -3,
            background: '#00F5FF',
            boxShadow: '0 0 6px rgba(0,245,255,0.9)',
          }}
        />
        {/* 十字线 */}
        {[
          { w: 8, h: 1, l: 6, t: 0 },   /* 右 */
          { w: 8, h: 1, l: -14, t: 0 }, /* 左 */
          { w: 1, h: 8, l: 0, t: 6 },   /* 下 */
          { w: 1, h: 8, l: 0, t: -14 }, /* 上 */
        ].map((line, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: line.w,
              height: line.h,
              left: line.l,
              top: line.t,
              background: clicking ? 'rgba(229,9,20,0.9)' : 'rgba(0,245,255,0.7)',
              boxShadow: clicking ? '0 0 4px rgba(229,9,20,0.8)' : '0 0 4px rgba(0,245,255,0.6)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
