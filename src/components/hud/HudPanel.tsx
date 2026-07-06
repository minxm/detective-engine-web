import type { ReactNode } from 'react';

export default function HudPanel({
  children,
  className = '',
  hover = false,
  solid = false,
  scan = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  solid?: boolean;
  scan?: boolean;
}) {
  const base = solid ? 'hud-panel hud-panel-solid' : hover ? 'hud-panel-hover' : 'hud-panel';
  return (
    <div className={`${base} ${className}`}>
      {scan && <div className="hud-scan-sweep" />}
      <div className="hud-panel-inner">{children}</div>
    </div>
  );
}
