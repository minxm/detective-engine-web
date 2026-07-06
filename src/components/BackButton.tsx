import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { t } from '@/i18n/zh';

export default function BackButton({ to = '/', label = t.common.back }: { to?: string; label?: string }) {
  return (
    <Link to={to} className="hud-btn-ghost inline-flex !py-2 !px-3 text-xs group">
      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      <span className="font-mono tracking-wider">{label}</span>
    </Link>
  );
}
