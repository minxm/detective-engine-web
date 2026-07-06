import type { LucideIcon } from 'lucide-react';

export default function HudTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon: LucideIcon; count?: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="hud-tabs overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button key={tab.id} type="button" onClick={() => onChange(tab.id)} className={isActive ? 'hud-tab-active' : 'hud-tab'}>
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count && <span className="opacity-40">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
