/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'Consolas', 'monospace'],
        display: ['Orbitron', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        archive: ['"Special Elite"', '"Courier New"', 'Courier', 'ui-monospace', 'monospace'],
        rajdhani: ['Rajdhani', '"PingFang SC"', 'system-ui', 'sans-serif'],
        exo: ['"Exo 2"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        spec: {
          black: '#0B0F14',
          navy: '#111820',
          red: '#E50914',
          cyan: '#00F5FF',
          gray: '#C4C8D4',
          amber: '#F59E0B',
          gold: '#D4A853',
        },
        hud: {
          void: '#0B0F14',
          deep: '#111820',
          surface: '#151c28',
          elevated: '#1a2332',
          cyan: '#00F5FF',
          red: '#E50914',
          gold: '#d4a853',
          amber: '#F59E0B',
          green: '#00FF41',
          border: 'rgba(0, 245, 255, 0.18)',
          'border-red': 'rgba(229, 9, 20, 0.25)',
        },
        dark: { 950: '#0B0F14', 900: '#111820', 800: '#151c28', 700: '#1a2332' },
        accent: { blue: '#00F5FF', cyan: '#00F5FF', red: '#E50914', gold: '#d4a853', green: '#00FF41' },
      },
      screens: {
        'xs': '375px',
      },
      animation: {
        /* 原有 */
        'scan-line': 'scan-line 8s linear infinite',
        'hud-pulse': 'hud-pulse 3s ease-in-out infinite',
        'shimmer-sweep': 'shimmer-sweep 3s ease-in-out infinite',
        'float-subtle': 'float-subtle 6s ease-in-out infinite',
        'data-flicker': 'data-flicker 4s step-end infinite',
        'fp-scan': 'fp-scan 2.5s ease-in-out infinite',
        'glitch': 'glitch 4s step-end infinite',
        'wire-pulse': 'wire-pulse 3s ease-in-out infinite',
        'crt-flicker': 'crt-flicker 8s step-end infinite',
        'data-stream': 'data-stream 2s linear infinite',
        'corner-pulse': 'corner-pulse 3s ease-in-out infinite',
        /* 新增 AAA 级动画 */
        'glitch-rgb': 'glitch-rgb 6s step-end infinite',
        'glitch-text': 'glitch-text 5s step-end infinite',
        'boot-blink': 'boot-blink 1s step-end infinite',
        'scan-full': 'scan-full 4s linear infinite',
        'scan-fast': 'scan-fast 1.5s linear infinite',
        'hologram': 'hologram 3s ease-in-out infinite',
        'hologram-flicker': 'hologram-flicker 0.15s step-end 3',
        'neon-pulse-red': 'neon-pulse-red 2s ease-in-out infinite',
        'neon-pulse-cyan': 'neon-pulse-cyan 2.5s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 2s linear infinite',
        'typewriter': 'typewriter 0.05s step-end',
        'enter-burst': 'enter-burst 0.6s ease-out forwards',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'orbit': 'orbit 8s linear infinite',
        'orbit-reverse': 'orbit 8s linear infinite reverse',
        'expand-x': 'expand-x 0.8s ease-out forwards',
        'expand-y': 'expand-y 0.6s ease-out forwards',
        'slide-left': 'slide-left 0.5s ease-out forwards',
        'slide-right': 'slide-right 0.5s ease-out forwards',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'iris-open': 'iris-open 0.8s ease-out forwards',
        'rgb-shift': 'rgb-shift 3s step-end infinite',
        'noise-shift': 'noise-shift 0.5s steps(2) infinite',
        'scan-vert': 'scan-vert 3s ease-in-out infinite',
        'border-flow': 'border-flow 2s linear infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 12s linear infinite reverse',
        'ping-slow': 'ping-slow 3s ease-in-out infinite',
        'dash': 'dash 1.5s ease-in-out infinite',
        'scanline-move': 'scanline-move 6s linear infinite',
      },
      keyframes: {
        /* 原有 */
        'scan-line': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        'hud-pulse': { '0%, 100%': { opacity: '0.35' }, '50%': { opacity: '1' } },
        'shimmer-sweep': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(200%)' } },
        'float-subtle': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'data-flicker': { '0%, 94%, 100%': { opacity: '1' }, '95%': { opacity: '0.5' } },
        'fp-scan': { '0%, 100%': { transform: 'translateY(-100%)' }, '50%': { transform: 'translateY(100%)' } },
        'glitch': { '0%, 97%, 100%': { transform: 'none' }, '98%': { transform: 'translateX(2px)' }, '99%': { transform: 'translateX(-2px)' } },
        'wire-pulse': { '0%, 100%': { opacity: '0.15' }, '50%': { opacity: '0.35' } },
        'crt-flicker': { '0%, 97%, 100%': { opacity: '1' }, '98%': { opacity: '0.97' }, '99%': { opacity: '0.99' } },
        'data-stream': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(400%)' } },
        'corner-pulse': { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
        /* 新增 — RGB Glitch */
        'glitch-rgb': {
          '0%, 92%, 100%': { transform: 'none', filter: 'none' },
          '93%': { transform: 'translateX(-3px)', filter: 'hue-rotate(-40deg) saturate(2)' },
          '94%': { transform: 'translateX(4px)', filter: 'hue-rotate(40deg) saturate(2)' },
          '95%': { transform: 'translateX(-2px) skewX(-5deg)', filter: 'none' },
          '96%': { transform: 'none', filter: 'brightness(2)' },
          '97%': { transform: 'translateX(3px)', filter: 'hue-rotate(-20deg)' },
          '98%': { transform: 'skewX(5deg)', filter: 'none' },
        },
        'glitch-text': {
          '0%, 90%, 100%': { 'text-shadow': 'none', transform: 'none' },
          '91%': { 'text-shadow': '-2px 0 #E50914, 2px 0 #00F5FF', transform: 'translateX(2px)' },
          '92%': { 'text-shadow': '2px 0 #E50914, -2px 0 #00F5FF', transform: 'translateX(-2px)' },
          '93%': { 'text-shadow': 'none', transform: 'skewX(-3deg)' },
          '94%': { 'text-shadow': '-1px 0 #E50914', transform: 'none' },
        },
        /* 光标闪烁 */
        'boot-blink': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        /* 全屏扫描线 */
        'scan-full': {
          '0%': { transform: 'translateY(-5%)' },
          '100%': { transform: 'translateY(105%)' },
        },
        'scan-fast': {
          '0%': { transform: 'translateY(-5%)' },
          '100%': { transform: 'translateY(105%)' },
        },
        /* 全息 */
        'hologram': {
          '0%, 100%': { opacity: '0.8', transform: 'scaleY(1)' },
          '25%': { opacity: '0.95', transform: 'scaleY(1.002)' },
          '50%': { opacity: '0.75', transform: 'scaleY(0.998)' },
          '75%': { opacity: '0.9', transform: 'scaleY(1.001)' },
        },
        'hologram-flicker': {
          '0%': { opacity: '1' },
          '33%': { opacity: '0.3' },
          '66%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        /* 霓虹脉冲 */
        'neon-pulse-red': {
          '0%, 100%': { 'box-shadow': '0 0 5px #E50914, 0 0 10px #E50914, 0 0 20px #E50914' },
          '50%': { 'box-shadow': '0 0 10px #E50914, 0 0 25px #E50914, 0 0 50px #E50914, 0 0 80px rgba(229,9,20,0.3)' },
        },
        'neon-pulse-cyan': {
          '0%, 100%': { 'box-shadow': '0 0 5px #00F5FF, 0 0 10px #00F5FF, 0 0 20px #00F5FF' },
          '50%': { 'box-shadow': '0 0 10px #00F5FF, 0 0 25px #00F5FF, 0 0 50px #00F5FF, 0 0 80px rgba(0,245,255,0.3)' },
        },
        /* 进入爆发 */
        'enter-burst': {
          '0%': { transform: 'scale(0.92)', opacity: '0', filter: 'brightness(3)' },
          '30%': { opacity: '1', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', opacity: '1', filter: 'brightness(1)' },
        },
        /* 雷达扫描 */
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        /* 环绕轨道 */
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        /* 横向展开 */
        'expand-x': {
          '0%': { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        /* 纵向展开 */
        'expand-y': {
          '0%': { transform: 'scaleY(0)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        /* 滑入 */
        'slide-left': {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        /* 虹膜开启 */
        'iris-open': {
          '0%': { 'clip-path': 'circle(0% at 50% 50%)' },
          '100%': { 'clip-path': 'circle(100% at 50% 50%)' },
        },
        /* RGB 偏移 */
        'rgb-shift': {
          '0%, 95%, 100%': { filter: 'none' },
          '96%': { filter: 'drop-shadow(2px 0 0 rgba(229,9,20,0.8)) drop-shadow(-2px 0 0 rgba(0,245,255,0.8))' },
          '97%': { filter: 'drop-shadow(-2px 0 0 rgba(229,9,20,0.8)) drop-shadow(2px 0 0 rgba(0,245,255,0.8))' },
          '98%': { filter: 'none' },
        },
        /* 噪波偏移 */
        'noise-shift': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-1px, 1px)' },
          '50%': { transform: 'translate(1px, -1px)' },
          '75%': { transform: 'translate(-1px, 0)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        /* 垂直扫描 */
        'scan-vert': {
          '0%, 100%': { top: '-5%' },
          '50%': { top: '105%' },
        },
        /* 边框流光 */
        'border-flow': {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '200% 50%' },
        },
        /* 红色脉冲 */
        'pulse-red': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        /* 青色脉冲 */
        'pulse-cyan': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        /* Ping 慢速 */
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        /* SVG dash */
        'dash': {
          '0%': { 'stroke-dashoffset': '1000' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        /* 扫描线移动 */
        'scanline-move': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        /* 原有 spin */
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      backgroundImage: {
        'hud-grid': 'linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)',
        'hud-grid-dense': 'linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)',
        'circuit': 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        'diagonal-stripes': 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,245,255,0.03) 2px, rgba(0,245,255,0.03) 4px)',
      },
      backgroundSize: {
        'hud-grid': '40px 40px',
        'hud-grid-dense': '20px 20px',
        'circuit': '32px 32px',
      },
      dropShadow: {
        'neon-red': ['0 0 8px rgba(229,9,20,0.9)', '0 0 20px rgba(229,9,20,0.5)'],
        'neon-cyan': ['0 0 8px rgba(0,245,255,0.9)', '0 0 20px rgba(0,245,255,0.5)'],
        'neon-gold': ['0 0 8px rgba(212,168,83,0.9)', '0 0 20px rgba(212,168,83,0.5)'],
      },
      boxShadow: {
        'neon-red': '0 0 5px rgba(229,9,20,0.5), 0 0 20px rgba(229,9,20,0.3), 0 0 40px rgba(229,9,20,0.15)',
        'neon-cyan': '0 0 5px rgba(0,245,255,0.5), 0 0 20px rgba(0,245,255,0.3), 0 0 40px rgba(0,245,255,0.15)',
        'neon-gold': '0 0 5px rgba(212,168,83,0.5), 0 0 20px rgba(212,168,83,0.3)',
        'hud': '0 0 0 1px rgba(34,211,238,0.12), 0 8px 40px rgba(0,0,0,0.5)',
        'hud-strong': '0 0 0 1px rgba(34,211,238,0.25), 0 12px 48px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.06)',
        'hud-red': '0 0 0 1px rgba(229,9,20,0.2), 0 8px 32px rgba(0,0,0,0.5)',
        'hud-red-strong': '0 0 0 1px rgba(229,9,20,0.4), 0 12px 48px rgba(0,0,0,0.6), 0 0 40px rgba(229,9,20,0.1)',
        'panel': '0 0 0 1px rgba(34,211,238,0.1), 0 20px 60px rgba(0,0,0,0.6)',
        'inner-glow': 'inset 0 0 30px rgba(0,245,255,0.05)',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'impact': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
