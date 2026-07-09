import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { t } from '@/i18n/zh';

type HudPasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function HudPasswordInput({ className = '', ...rest }: HudPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="hud-input-wrap hud-password-wrap">
      <div className="hud-input-scan" aria-hidden />
      <input
        className={`hud-input hud-password-input ${className}`}
        type={visible ? 'text' : 'password'}
        {...rest}
      />
      <button
        type="button"
        className="hud-password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
