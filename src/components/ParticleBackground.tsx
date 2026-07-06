import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type: 'ambient' | 'data' | 'spark';
  life: number;
  maxLife: number;
}

interface DataLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  chars: string[];
}

/** AAA Game-Level Particle System — Intelligence Bureau */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let particles: Particle[] = [];
    let dataLines: DataLine[] = [];
    let frame = 0;

    const MATRIX_CHARS = '01アイウエオカキクケコSATELLITE●◆■░▒▓'.split('');
    const COLORS = {
      cyan: 'rgba(34, 211, 238',
      red: 'rgba(229, 9, 20',
      gold: 'rgba(212, 168, 83',
      white: 'rgba(255, 255, 255',
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const randomColor = () => {
      const r = Math.random();
      if (r < 0.72) return COLORS.cyan;
      if (r < 0.88) return COLORS.red;
      if (r < 0.95) return COLORS.gold;
      return COLORS.white;
    };

    const createParticle = (x?: number, y?: number): Particle => {
      const type = Math.random() < 0.08 ? 'spark' : Math.random() < 0.25 ? 'data' : 'ambient';
      const maxLife = type === 'spark' ? 60 + Math.random() * 40 : Infinity;
      return {
        x: x ?? Math.random() * canvas.width,
        y: y ?? Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (type === 'data' ? 0.8 : 0.2),
        vy: type === 'data' ? -0.5 - Math.random() * 0.8 : (Math.random() - 0.5) * 0.25,
        size: type === 'spark' ? Math.random() * 2 + 0.5 : Math.random() * 1.2 + 0.3,
        alpha: type === 'ambient' ? Math.random() * 0.3 + 0.06 : Math.random() * 0.5 + 0.2,
        color: randomColor(),
        type,
        life: 0,
        maxLife,
      };
    };

    const createDataLine = (): DataLine => ({
      x: Math.random() * canvas.width,
      y: -20,
      length: 20 + Math.floor(Math.random() * 15),
      speed: 0.5 + Math.random() * 1.5,
      alpha: Math.random() * 0.12 + 0.04,
      chars: Array.from({ length: 20 + Math.floor(Math.random() * 15) }, () =>
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      ),
    });

    const init = () => {
      particles = Array.from({ length: 55 }, () => createParticle());
      dataLines = Array.from({ length: 8 }, () => {
        const dl = createDataLine();
        dl.y = Math.random() * canvas.height;
        return dl;
      });
    };

    /* Draw connection lines between nearby particles */
    const drawConnections = () => {
      const ambients = particles.filter((p) => p.type === 'ambient');
      for (let i = 0; i < ambients.length; i++) {
        for (let j = i + 1; j < ambients.length; j++) {
          const dx = ambients[i].x - ambients[j].x;
          const dy = ambients[i].y - ambients[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(ambients[i].x, ambients[i].y);
            ctx.lineTo(ambients[j].x, ambients[j].y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    /* Draw matrix rain columns */
    const drawDataLines = () => {
      ctx.font = '10px "Share Tech Mono", monospace';
      for (const dl of dataLines) {
        dl.y += dl.speed;
        if (dl.y > canvas.height + dl.length * 14) {
          dl.y = -dl.length * 14;
          dl.x = Math.random() * canvas.width;
          dl.alpha = Math.random() * 0.12 + 0.04;
          dl.chars = dl.chars.map(() =>
            MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          );
        }
        for (let i = 0; i < dl.length; i++) {
          const charY = dl.y - i * 14;
          if (charY < 0 || charY > canvas.height) continue;
          /* Top char brighter */
          const alpha = i === 0
            ? Math.min(dl.alpha * 4, 0.5)
            : dl.alpha * (1 - i / dl.length);
          ctx.fillStyle = i === 0
            ? `rgba(0, 245, 255, ${alpha})`
            : `rgba(34, 211, 238, ${alpha})`;
          /* Occasionally mutate chars */
          if (frame % 12 === 0 && Math.random() < 0.1) {
            dl.chars[i] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }
          ctx.fillText(dl.chars[i] ?? '0', dl.x, charY);
        }
      }
    };

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Matrix rain */
      drawDataLines();

      /* Connection lines */
      drawConnections();

      /* Particles */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        /* Wrap around */
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.y > canvas.height + 5) p.y = -5;

        /* Fade out sparks */
        let alpha = p.alpha;
        if (p.type === 'spark') {
          alpha = p.alpha * (1 - p.life / p.maxLife);
          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
            particles.push(createParticle());
            continue;
          }
        }

        /* Draw particle */
        ctx.beginPath();
        if (p.type === 'data') {
          /* Data particles: small rectangles */
          ctx.fillStyle = `${p.color}, ${alpha})`;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 2);
          /* Glow */
          ctx.shadowBlur = 4;
          ctx.shadowColor = `${p.color}, 0.4)`;
        } else if (p.type === 'spark') {
          /* Sparks: bright dots with glow */
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          gradient.addColorStop(0, `${p.color}, ${alpha})`);
          gradient.addColorStop(1, `${p.color}, 0)`);
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `${p.color}, 0.5)`;
        } else {
          /* Ambient: subtle circles */
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}, ${alpha})`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      /* Occasionally spawn sparks */
      if (frame % 90 === 0 && particles.length < 70) {
        particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height * 0.8));
      }

      animId = requestAnimationFrame(draw);
    };

    const handleResize = () => { resize(); init(); };

    resize();
    init();
    draw();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.45 }}
    />
  );
}
