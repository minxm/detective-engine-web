import { MessageCircle } from 'lucide-react';
import HudButton from '@/components/hud/HudButton';
import { t } from '@/i18n/zh';

export default function WechatLoginButton({
  loading,
  disabled,
  onClick,
  className = '',
}: {
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <HudButton
      disabled={disabled || loading}
      onClick={onClick}
      className={`w-full !py-3 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(7,193,96,0.18), rgba(7,193,96,0.08))',
        boxShadow: 'inset 0 0 0 1px rgba(7,193,96,0.35)',
      }}
    >
      <MessageCircle className="w-4 h-4 text-[#07C160]" />
      <span className="text-[#9ef0c4]">{loading ? t.auth.wechatRedirecting : t.auth.wechatLogin}</span>
    </HudButton>
  );
}
