import { useEffect, useState } from 'react';
import { Activity, Database, Cpu, Users } from 'lucide-react';
import BackButton from '@/components/BackButton';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import { apiRequest } from '@/services/api';
import { t } from '@/i18n/zh';

interface Dashboard {
  onlineUsers: number;
  inventoryCounts: Record<string, number>;
  aiStats: { totalCalls: number; totalTokens: number };
  recentLogs: Array<{ type: string; model: string; totalTokens: number; createdAt: number }>;
  leaderboardSize: number;
  kvAdapter: string;
  blobAdapter: string;
  dbAdapter: string;
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ success: boolean; dashboard: Dashboard }>('/admin/dashboard')
      .then((res) => setDashboard(res.dashboard))
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <PageLayout maxWidth="max-w-5xl">
      <BackButton />
      <p className="hud-label mt-6 mb-2">{t.nav.admin}</p>
      <h1 className="text-2xl font-black hud-title mb-8 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400/70" /> {t.admin.title}
      </h1>

      {error && (
        <HudPanel className="p-4 text-red-400 font-mono text-sm mb-6 hud-badge-red">{error}</HudPanel>
      )}

      {dashboard && (
        <>
          <div className="grid md:grid-cols-3 gap-3 mb-8">
            {[
              { icon: Users, label: '在线', value: dashboard.onlineUsers },
              { icon: Cpu, label: 'AI 调用', value: dashboard.aiStats.totalCalls },
              { icon: Database, label: '排行榜', value: dashboard.leaderboardSize },
            ].map(({ icon: Icon, label, value }) => (
              <HudPanel key={label} className="p-5">
                <Icon className="w-4 h-4 text-cyan-500/50 mb-2" />
                <p className="text-2xl font-black font-mono hud-title">{value}</p>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-1">{label}</p>
              </HudPanel>
            ))}
          </div>

          <HudPanel solid className="p-5 font-mono text-xs text-slate-400 space-y-1">
            <p>DB · {dashboard.dbAdapter}</p>
            <p>KV · {dashboard.kvAdapter}</p>
            <p>BLOB · {dashboard.blobAdapter}</p>
            <p>Tokens · {dashboard.aiStats.totalTokens.toLocaleString()}</p>
          </HudPanel>
        </>
      )}
    </PageLayout>
  );
}
