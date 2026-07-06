/** 电影级背景层 — Intelligence Bureau */
export default function CinematicBackdrop({
  variant = 'default',
}: {
  variant?: 'default' | 'entry' | 'recon' | 'auth' | 'lobby' | 'archive' | 'interrogate';
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-spec-black" aria-hidden>

      {/* ── 基础网格 ── */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.028) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── 噪波纹理 ── */}
      <div className="absolute inset-0 bg-noise opacity-35" />

      {/* ── 变体专属背景 ── */}
      {variant === 'entry' && (
        <>
          {/* 中央红色光晕 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(229,9,20,0.12)_0%,transparent_60%)]" />
          {/* 底部红色烟雾 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_110%,rgba(229,9,20,0.09),transparent_55%)]" />
          {/* 顶部青色 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_30%_at_50%_-5%,rgba(0,245,255,0.07),transparent_50%)]" />
          {/* 斜向光束 */}
          <div
            className="absolute top-0 left-1/3 w-px h-full opacity-30"
            style={{ background: 'linear-gradient(180deg, rgba(229,9,20,0.4), transparent 40%)' }}
          />
          <div
            className="absolute top-0 right-1/4 w-px h-full opacity-20"
            style={{ background: 'linear-gradient(180deg, rgba(0,245,255,0.4), transparent 40%)' }}
          />
        </>
      )}

      {variant === 'auth' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(0,245,255,0.08)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_30%_at_50%_0%,rgba(0,245,255,0.06),transparent_50%)]" />
          {/* 侧边扫描线 */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px opacity-25"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(0,245,255,0.6) 50%, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-px opacity-15"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(0,245,255,0.4) 50%, transparent)' }}
          />
        </>
      )}

      {variant === 'lobby' && (
        <>
          {/* 中央放射光 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(0,245,255,0.06)_0%,transparent_55%)]" />
          {/* 底部地平线光 */}
          <div
            className="absolute bottom-0 inset-x-0 h-48"
            style={{ background: 'linear-gradient(to top, rgba(0,245,255,0.04), transparent)' }}
          />
          {/* 透视网格感 */}
          <div
            className="absolute bottom-0 inset-x-0 h-64 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,245,255,0.12) 1px, transparent 1px)',
              backgroundSize: '100% 32px',
              transform: 'perspective(300px) rotateX(60deg)',
              transformOrigin: 'bottom center',
            }}
          />
        </>
      )}

      {variant === 'archive' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(139,119,80,0.08)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,22,16,0.3)_0%,transparent_30%)]" />
        </>
      )}

      {variant === 'interrogate' && (
        <>
          {/* 黑暗审讯室——聚光灯效果 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_50%_at_50%_35%,rgba(255,240,200,0.05)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
        </>
      )}

      {variant === 'recon' && (
        <>
          {/* 全息蓝色 */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,245,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(0,245,255,0.06)_0%,transparent_60%)]" />
        </>
      )}

      {/* ── 默认顶部光晕 ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-5%,rgba(0,245,255,0.07),transparent_55%)]" />

      {/* ── 全局晕影 ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,15,20,0.7)_100%)]" />

      {/* ── CRT 微扫描线 ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.15) 2px, rgba(0,245,255,0.15) 4px)',
        }}
      />

      {/* ── 全局动态扫描线 ── */}
      <div
        className="absolute inset-x-0 h-[2px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.18), rgba(229,9,20,0.08), rgba(0,245,255,0.18), transparent)',
          animation: 'scan-line 8s linear infinite',
        }}
      />

      {/* ── 左右装饰光束 ── */}
      <div
        className="absolute top-0 left-1/4 w-px h-full opacity-50"
        style={{ background: 'linear-gradient(180deg, rgba(0,245,255,0.07), transparent 60%)' }}
      />
      <div
        className="absolute top-0 right-1/3 w-px h-full opacity-30"
        style={{ background: 'linear-gradient(180deg, rgba(229,9,20,0.06), transparent 60%)' }}
      />
    </div>
  );
}
