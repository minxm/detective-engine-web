import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function HudInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <div className="hud-input-wrap">
      <div className="hud-input-scan" aria-hidden />
      <input className={`hud-input ${className}`} {...rest} />
    </div>
  );
}

export function HudTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <div className="hud-input-wrap">
      <div className="hud-input-scan" aria-hidden />
      <textarea className={`hud-input resize-none ${className}`} {...rest} />
    </div>
  );
}
