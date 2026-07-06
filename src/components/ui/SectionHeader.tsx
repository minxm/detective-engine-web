import type { LucideIcon } from 'lucide-react';

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-8">
      <div className="section-divider mb-4">
        <span className="conan-subtitle flex items-center gap-2 shrink-0">
          {Icon && <Icon className="w-3.5 h-3.5 text-conan-gold" />}
          {title}
        </span>
      </div>
      {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
    </div>
  );
}
