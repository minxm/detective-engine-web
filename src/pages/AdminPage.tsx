import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Database, Cpu, Trash2, Plus, RefreshCw, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import DataStreamBar from '@/components/hud/DataStreamBar';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  fetchAdminDashboard,
  fetchOnlineUsers,
  fetchAdminInventory,
  fetchAdminAiLogs,
  fetchAdminLoginAudits,
  fetchInventoryClaims,
  refillInventory,
  fetchRefillStatus,
  cleanupAiLogs,
  deleteAiLog,
  type Dashboard,
  type Paginated,
  type ClaimUser,
  type RefillStatus,
} from '@/services/admin';
import { t } from '@/i18n/zh';
import { formatApiError } from '@/utils/apiError';

type Tab = 'online' | 'inventory' | 'logs' | 'logins';

/** 领取用户列表弹出面板 */
function ClaimUsersPanel({
  caseId,
  caseTitle,
  onClose,
}: {
  caseId: string;
  caseTitle: string;
  onClose: () => void;
}) {
  const [claimData, setClaimData] = useState<Paginated<ClaimUser> | null>(null);
  const [claimPage, setClaimPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    fetchInventoryClaims(caseId, claimPage, 10)
      .then(setClaimData)
      .catch((err) => {
        setClaimData(null);
        setFetchError(formatApiError(err, '加载领取记录失败'));
      })
      .finally(() => setLoading(false));
  }, [caseId, claimPage]);

  const panel = (
    <motion.div
      key="claim-users-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative"
        style={{
          background: 'rgba(11,15,20,0.97)',
          boxShadow: '0 0 0 1px rgba(0,245,255,0.2), 0 24px 64px rgba(0,0,0,0.7)',
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-spec-cyan/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-spec-cyan/60" />
              <div>
                <p className="font-mono text-xs text-spec-cyan font-bold">领取用户列表</p>
                <p className="font-mono text-[9px] text-spec-gray/40 mt-0.5 truncate max-w-[260px]">{caseTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[10px] text-spec-gray/45 hover:text-spec-cyan px-2 py-1"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="font-mono text-xs text-spec-gray/45 text-center py-6">{t.common.loading}</p>
          ) : fetchError ? (
            <p className="font-mono text-xs text-spec-red/80 text-center py-6">{fetchError}</p>
          ) : !claimData || claimData.items.length === 0 ? (
            <p className="font-mono text-xs text-spec-gray/45 text-center py-6">暂无领取记录</p>
          ) : (
            <>
              <p className="font-mono text-[9px] text-spec-gray/35 mb-3 tracking-wider">
                共 {claimData.total} 条领取记录
              </p>
              <div className="space-y-1.5">
                {claimData.items.map((claim, i) => (
                  <div
                    key={claim._id}
                    className="flex items-center gap-3 p-2.5"
                    style={{
                      background: 'rgba(17,24,32,0.7)',
                      boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.07)',
                    }}
                  >
                    <span className="font-mono text-[8px] text-spec-gray/25 shrink-0 tabular-nums w-4 text-right">
                      {(claimPage - 1) * 10 + i + 1}
                    </span>
                    <div
                      className="w-1 h-6 shrink-0"
                      style={{ background: 'rgba(0,245,255,0.4)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white/80 truncate">{claim.nickname}</span>
                      </div>
                      <p className="font-mono text-[8px] text-spec-gray/35 mt-0.5">
                        {new Date(claim.claimedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {claimData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 font-mono text-[10px]">
                  <button
                    type="button"
                    disabled={claimPage <= 1}
                    onClick={() => setClaimPage((p) => p - 1)}
                    className="px-2 py-1 text-spec-cyan/60 disabled:opacity-30"
                  >
                    上一页
                  </button>
                  <span className="text-spec-gray/50">{claimPage} / {claimData.totalPages}</span>
                  <button
                    type="button"
                    disabled={claimPage >= claimData.totalPages}
                    onClick={() => setClaimPage((p) => p + 1)}
                    className="px-2 py-1 text-spec-cyan/60 disabled:opacity-30"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(panel, document.body);
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN');
}

function Paginator({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4 font-mono text-[10px]">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="px-2 py-1 text-spec-cyan/60 disabled:opacity-30"
      >
        上一页
      </button>
      <span className="text-spec-gray/50">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="px-2 py-1 text-spec-cyan/60 disabled:opacity-30"
      >
        下一页
      </button>
    </div>
  );
}

function AdminTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="font-mono text-xs text-spec-gray/45 text-center py-8">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-[10px] text-left">
        <thead>
          <tr className="text-spec-gray/45 border-b border-spec-cyan/10">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-3 font-normal tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-spec-cyan/5 text-spec-gray/70">
              {cells.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2 pr-3 align-top max-w-[200px] ${j === 3 ? '' : 'truncate'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, initialized, refreshAdminStatus } = useAuthStore();
  const [tab, setTab] = useState<Tab>('online');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [onlineData, setOnlineData] = useState<Paginated<import('@/services/admin').OnlineUser> | null>(null);
  const [inventoryData, setInventoryData] = useState<Paginated<import('@/services/admin').InventoryItem> | null>(null);
  const [logsData, setLogsData] = useState<Paginated<import('@/services/admin').AiLogItem> | null>(null);
  const [loginAuditsData, setLoginAuditsData] = useState<Paginated<import('@/services/admin').LoginAuditItem> | null>(null);
  const [refillDifficulty, setRefillDifficulty] = useState('medium');
  const [refillCount, setRefillCount] = useState(1);
  const [refillRunning, setRefillRunning] = useState(false);
  const [refillStatus, setRefillStatus] = useState<RefillStatus | null>(null);
  const [claimPanel, setClaimPanel] = useState<{ caseId: string; title: string } | null>(null);

  useEffect(() => {
    void refreshAdminStatus();
  }, [refreshAdminStatus]);

  useEffect(() => {
    fetchAdminDashboard().then(setDashboard).catch(() => undefined);
  }, []);

  const refreshDashboard = useCallback(async () => {
    const dash = await fetchAdminDashboard();
    setDashboard(dash);
  }, []);

  const refreshAfterRefill = useCallback(async () => {
    try {
      setPage(1);
      setInventoryData(await fetchAdminInventory(1));
      await refreshDashboard();
    } catch (err) {
      setWarning(
        `案件已成功入库，但刷新列表时遇到问题：${formatApiError(err, '刷新失败')}。已生成的案例不受影响，请点击右上角「刷新」重试。`,
      );
    }
  }, [refreshDashboard]);

  const loadTab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'online') setOnlineData(await fetchOnlineUsers(page));
      if (tab === 'inventory') setInventoryData(await fetchAdminInventory(page));
      if (tab === 'logs') setLogsData(await fetchAdminAiLogs(page));
      if (tab === 'logins') setLoginAuditsData(await fetchAdminLoginAudits(page));
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadTab();
  }, [isAdmin, loadTab]);

  const handleRefill = async () => {
    setMessage('');
    setError('');
    setWarning('');
    setRefillRunning(true);
    setRefillStatus(null);
    let refillFinal: RefillStatus | null = null;
    try {
      const start = await refillInventory(refillDifficulty, refillCount);
      const jobId = start.refillJobId;
      setRefillStatus({
        success: true,
        status: start.status as RefillStatus['status'],
        stage: start.stage,
        progress: start.progress,
        stageLabel: start.stageLabel,
        current: 0,
        total: start.total,
      });

      const poll = async (): Promise<RefillStatus> => {
        const data = await fetchRefillStatus(jobId);
        setRefillStatus(data);
        if (data.status === 'running' || data.status === 'pending') {
          await new Promise((r) => setTimeout(r, 1500));
          return poll();
        }
        return data;
      };

      const final = await poll();
      refillFinal = final;
      setRefillStatus(final);

      const createdCount = final.created?.length ?? 0;
      const errorCount = final.errors?.length ?? 0;

      if (final.status === 'failed' && createdCount === 0) {
        setError(formatApiError(final.error ?? final.message, t.admin.refillFail));
      } else if (errorCount > 0) {
        setMessage(final.message ?? t.admin.refillPartial.replace('{ok}', String(createdCount)).replace('{fail}', String(errorCount)));
        await refreshAfterRefill();
      } else {
        setMessage(final.message ?? t.admin.refillSuccess.replace('{n}', String(createdCount)));
        await refreshAfterRefill();
      }
    } catch (err) {
      const msg = formatApiError(err, t.admin.refillFail);
      if (refillFinal?.status === 'ready' && (refillFinal.created?.length ?? 0) > 0) {
        setMessage(refillFinal.message ?? t.admin.refillSuccess.replace('{n}', String(refillFinal.created?.length ?? 0)));
        setWarning(`案件已成功入库，但后续操作遇到问题：${msg}。已生成的案例不受影响。`);
        return;
      }
      setError(msg);
      setRefillStatus({
        success: false,
        status: 'failed',
        stage: 'failed',
        progress: 0,
        stageLabel: t.admin.refillFailTitle,
        current: 0,
        total: refillCount,
        error: msg,
      });
    } finally {
      setRefillRunning(false);
    }
  };

  const refillActiveStep = (() => {
    const stage = refillStatus?.stage ?? 'pending';
    if (stage === 'images') return 1;
    if (stage === 'persisting' || stage === 'ready') return 2;
    if (stage === 'generating') return 0;
    return 0;
  })();

  const refillFailed = refillStatus?.status === 'failed';
  const refillPartial =
    refillStatus?.status === 'ready' && (refillStatus.errors?.length ?? 0) > 0;
  const refillSucceeded =
    refillStatus?.status === 'ready' && !refillPartial && !refillRunning;
  const showRefillPanel =
    refillStatus && (refillRunning || refillFailed || refillPartial || refillSucceeded);

  const handleCleanupAiLogs = async () => {
    setMessage('');
    try {
      const res = await cleanupAiLogs(30);
      setMessage(res.message);
      void loadTab();
      await refreshDashboard();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const handleDeleteAiLog = async (logId: string) => {
    setMessage('');
    try {
      await deleteAiLog(logId);
      setMessage('已删除 AI 日志');
      void loadTab();
      await refreshDashboard();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  if (!initialized) return null;
  if (!isAdmin) return <Navigate to="/lobby" replace />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'online', label: t.admin.tabOnline },
    { id: 'inventory', label: t.admin.tabInventory },
    { id: 'logs', label: t.admin.tabLogs },
    { id: 'logins', label: t.admin.tabLoginAudits },
  ];

  return (
    <PageLayout maxWidth="max-w-6xl">
      <AnimatePresence>
        {claimPanel && (
          <ClaimUsersPanel
            key={claimPanel.caseId}
            caseId={claimPanel.caseId}
            caseTitle={claimPanel.title}
            onClose={() => setClaimPanel(null)}
          />
        )}
      </AnimatePresence>
      <BackButton to="/lobby" label={t.flow.lobby} />
      <p className="hud-label mt-6 mb-2">{t.nav.admin}</p>
      <h1 className="text-2xl font-black hud-title mb-2 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400/70" /> {t.admin.title}
      </h1>
      <p className="font-mono text-[10px] text-spec-gray/40 mb-6 tracking-wide">{t.admin.subtitle}</p>

      {dashboard && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { icon: Users, label: t.admin.onlineCount, value: dashboard.onlineUsers },
            { icon: Cpu, label: t.admin.aiCalls, value: dashboard.aiStats.totalCalls },
            { icon: Database, label: 'DB', value: dashboard.dbAdapter },
          ].map(({ icon: Icon, label, value }) => (
            <HudPanel key={label} className="p-2.5 sm:p-4 min-w-0">
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500/50 mb-1.5 sm:mb-2" />
              <p className="text-base sm:text-xl font-black font-mono hud-title truncate">{value}</p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 font-mono tracking-wider mt-0.5 sm:mt-1 leading-tight">{label}</p>
            </HudPanel>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setPage(1);
            }}
            className={`font-mono text-[10px] px-3 py-2 tracking-wider transition-colors ${
              tab === id ? 'text-spec-cyan bg-spec-cyan/10' : 'text-spec-gray/45'
            }`}
            style={{
              clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              boxShadow:
                tab === id
                  ? 'inset 0 0 0 1px rgba(0,245,255,0.25)'
                  : 'inset 0 0 0 1px rgba(0,245,255,0.06)',
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void loadTab()}
          className="ml-auto font-mono text-[10px] text-spec-gray/45 flex items-center gap-1 px-2"
        >
          <RefreshCw className="w-3 h-3" /> 刷新
        </button>
      </div>

      {error && (
        <HudPanel className="p-3 text-spec-red font-mono text-xs mb-4">{error}</HudPanel>
      )}
      {warning && (
        <HudPanel className="p-3 text-amber-300/90 font-mono text-xs mb-4">{warning}</HudPanel>
      )}
      {message && (
        <HudPanel className="p-3 text-spec-cyan font-mono text-xs mb-4">{message}</HudPanel>
      )}

      <HudPanel solid className="p-5">
        {loading && <p className="font-mono text-xs text-spec-gray/45 mb-4">{t.common.loading}</p>}

        {tab === 'online' && onlineData && (
          <>
            <AdminTable
              headers={['用户 ID', '昵称', '角色', '最后活跃']}
              empty={t.admin.emptyOnline}
              rows={onlineData.items.map((u) => [
                u.userId,
                u.nickname ?? '—',
                u.role === 'admin' ? t.admin.roleAdmin : t.admin.roleUser,
                fmtTime(u.lastSeen),
              ])}
            />
            <Paginator page={onlineData.page} totalPages={onlineData.totalPages} onPage={setPage} />
          </>
        )}

        {tab === 'inventory' && inventoryData && (
          <>
            <div className="flex flex-wrap items-end gap-2 mb-4 pb-4 border-b border-spec-cyan/10">
              <label className="font-mono text-[10px] text-spec-gray/45">
                难度
                <select
                  value={refillDifficulty}
                  onChange={(e) => setRefillDifficulty(e.target.value)}
                  className="block mt-1 bg-spec-black border border-spec-cyan/15 text-spec-cyan text-xs px-2 py-1"
                >
                  {['easy', 'medium', 'hard', 'expert'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-mono text-[10px] text-spec-gray/45">
                数量
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={refillCount}
                  onChange={(e) => setRefillCount(Number(e.target.value))}
                  className="block mt-1 w-16 bg-spec-black border border-spec-cyan/15 text-spec-cyan text-xs px-2 py-1"
                />
              </label>
              <HudButton
                onClick={() => void handleRefill()}
                disabled={refillRunning}
                className="!text-xs !py-2"
              >
                <Plus className="w-3 h-3" /> {t.admin.refill}
              </HudButton>
            </div>

            {showRefillPanel && refillStatus && (
              <HudPanel
                className={`p-4 mb-4 ${
                  refillFailed
                    ? '!shadow-[inset_0_0_0_1px_rgba(229,9,20,0.35)]'
                    : refillPartial
                      ? '!shadow-[inset_0_0_0_1px_rgba(212,168,83,0.35)]'
                      : refillSucceeded
                        ? '!shadow-[inset_0_0_0_1px_rgba(74,222,128,0.25)]'
                        : ''
                }`}
              >
                {refillRunning ? (
                  <>
                    <p className="font-mono text-[10px] text-spec-gray/50 mb-2">{t.admin.refillProgress}</p>
                    <DataStreamBar
                      value={refillStatus.progress}
                      label={refillStatus.stageLabel}
                      className="mb-4"
                    />
                    <div className="space-y-1.5">
                      {[t.admin.refillStepGenerating, t.admin.refillStepImages, t.admin.refillStepPersist].map((label, i) => {
                        const active = i === refillActiveStep;
                        const done = i < refillActiveStep;
                        return (
                          <div
                            key={label}
                            className={`flex items-center gap-2 font-mono text-[10px] px-3 py-2 ${
                              active ? 'text-spec-cyan/80' : done ? 'text-emerald-400/70' : 'text-spec-gray/35'
                            }`}
                            style={{
                              background: active ? 'rgba(0,245,255,0.05)' : 'rgba(0,0,0,0.2)',
                              boxShadow: active ? 'inset 0 0 0 1px rgba(0,245,255,0.15)' : 'inset 0 0 0 1px rgba(0,245,255,0.05)',
                            }}
                          >
                            <span className="w-4 text-center">{done ? '✓' : active ? '›' : '·'}</span>
                            <span>{label}</span>
                            {refillStatus.total > 1 && active && (
                              <span className="ml-auto text-spec-gray/40">
                                {refillStatus.current + 1}/{refillStatus.total}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : refillFailed ? (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-4 h-4 text-spec-red shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-spec-red font-bold">{t.admin.refillFailTitle}</p>
                        <p className="font-mono text-[10px] text-spec-red/80 mt-1 leading-relaxed break-words">
                          {formatApiError(refillStatus.error ?? refillStatus.message, t.admin.refillFail)}
                        </p>
                      </div>
                    </div>
                    {refillStatus.errors && refillStatus.errors.length > 0 && (
                      <ul className="space-y-1.5 mt-3 pt-3 border-t border-spec-red/15">
                        {refillStatus.errors.map((item, i) => (
                          <li
                            key={i}
                            className="font-mono text-[9px] text-spec-red/70 px-3 py-2 break-words"
                            style={{ background: 'rgba(229,9,20,0.06)', boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.1)' }}
                          >
                            {refillStatus.total > 1 ? `${i + 1}. ` : ''}{formatApiError(item)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="font-mono text-[9px] text-spec-gray/40 mt-3">{t.admin.refillFailHint}</p>
                  </div>
                ) : refillPartial ? (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-amber-300/90 font-bold">{t.admin.refillPartialTitle}</p>
                        <p className="font-mono text-[10px] text-amber-200/70 mt-1 leading-relaxed">
                          {refillStatus.message}
                        </p>
                      </div>
                    </div>
                    {refillStatus.errors && refillStatus.errors.length > 0 && (
                      <ul className="space-y-1.5">
                        {refillStatus.errors.map((item, i) => (
                          <li
                            key={i}
                            className="font-mono text-[9px] text-amber-200/60 px-3 py-2 break-words"
                            style={{ background: 'rgba(212,168,83,0.06)', boxShadow: 'inset 0 0 0 1px rgba(212,168,83,0.12)' }}
                          >
                            {i + 1}. {formatApiError(item)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-xs text-emerald-300/90 font-bold">{t.admin.refillSuccessTitle}</p>
                      <p className="font-mono text-[10px] text-emerald-200/70 mt-1">
                        {refillStatus.message ??
                          t.admin.refillSuccess.replace('{n}', String(refillStatus.created?.length ?? 0))}
                      </p>
                    </div>
                  </div>
                )}
              </HudPanel>
            )}

            <p className="font-mono text-[9px] text-spec-gray/35 mb-3">{t.admin.refillHint}</p>
            <AdminTable
              headers={['标题', '难度', '状态', '已领用户', '案件 ID', '创建时间']}
              empty={t.admin.emptyInventory}
              rows={inventoryData.items.map((item) => [
                item.title,
                item.difficulty,
                item.status === 'available' ? '可用' : '已领取',
                <button
                  key="claim"
                  type="button"
                  onClick={() => setClaimPanel({ caseId: item.caseId, title: item.title })}
                  className="flex items-center gap-1 text-spec-cyan hover:text-spec-cyan/70 transition-colors"
                  title="点击查看领取用户列表"
                >
                  <UserCheck className="w-3 h-3 shrink-0" />
                  <span className="font-bold">{item.claimCount ?? 0}</span>
                  <span className="text-spec-gray/40 text-[9px]">人</span>
                </button>,
                item.caseId.slice(-8),
                fmtTime(item.createdAt),
              ])}
            />
            <Paginator
              page={inventoryData.page}
              totalPages={inventoryData.totalPages}
              onPage={setPage}
            />
          </>
        )}

        {tab === 'logs' && logsData && (
          <>
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-spec-cyan/10">
              <HudButton variant="ghost" onClick={() => void handleCleanupAiLogs()} className="!text-xs !py-2">
                <Trash2 className="w-3 h-3" /> {t.admin.cleanupAiLogs}
              </HudButton>
            </div>
            <p className="font-mono text-[9px] text-spec-gray/35 mb-3">{t.admin.logsHint}</p>
            <AdminTable
              headers={['类型', '模型', '案件', '耗时', 'Token', '时间', '操作']}
              empty={t.admin.emptyLogs}
              rows={logsData.items.map((log) => [
                log.type,
                log.model,
                log.caseId ?? '—',
                `${log.durationMs}ms`,
                log.totalTokens,
                fmtTime(log.createdAt),
                <button
                  key="del"
                  type="button"
                  className="text-spec-red/60 hover:text-spec-red text-[10px]"
                  onClick={() => void handleDeleteAiLog(log._id)}
                >
                  {t.admin.deleteLog}
                </button>,
              ])}
            />
            <Paginator page={logsData.page} totalPages={logsData.totalPages} onPage={setPage} />
          </>
        )}

        {tab === 'logins' && (
          <>
            {dashboard?.dailyActivity && (
              <div className="mb-6 pb-6 border-b border-spec-cyan/10">
                <p className="font-mono text-xs text-spec-cyan font-bold mb-1">{t.admin.dailyStatsTitle}</p>
                <p className="font-mono text-[9px] text-spec-gray/40 mb-4 tracking-wide">{t.admin.dailyStatsHint}</p>
                <AdminTable
                  headers={[t.admin.dailyStatsDate, t.admin.dailyStatsLogin]}
                  empty={t.admin.dailyStatsEmpty}
                  rows={dashboard.dailyActivity.map((row) => [
                    row.date,
                    row.loginCount,
                  ])}
                />
              </div>
            )}
            <p className="font-mono text-[9px] text-spec-gray/35 mb-3">{t.admin.loginAuditsHint}</p>
            {loginAuditsData && (
              <>
                <AdminTable
                  headers={['时间', '用户 ID', '账号', '昵称', '类型']}
                  empty={t.admin.emptyLoginAudits}
                  rows={loginAuditsData.items.map((item) => [
                    fmtTime(item.createdAt),
                    item.userId.slice(-12),
                    item.username ?? '—',
                    item.nickname,
                    item.source === 'register' ? t.admin.loginAuditRegister : t.admin.loginAuditLogin,
                  ])}
                />
                <Paginator
                  page={loginAuditsData.page}
                  totalPages={loginAuditsData.totalPages}
                  onPage={setPage}
                />
              </>
            )}
          </>
        )}
      </HudPanel>
    </PageLayout>
  );
}
