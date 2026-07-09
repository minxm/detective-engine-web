import { apiRequest } from './api';

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OnlineUser = {
  userId: string;
  nickname?: string;
  role: 'user' | 'admin';
  lastSeen: number;
};

export type InventoryItem = {
  _id: string;
  caseId: string;
  title: string;
  difficulty: string;
  status: 'available' | 'claimed';
  claimedBy?: string;
  /** 已领取用户数 */
  claimCount: number;
  createdAt: number;
};

export type ClaimUser = {
  _id: string;
  inventoryId: string;
  caseId: string;
  userId: string;
  nickname: string;
  claimedAt: number;
};

export type AiLogItem = {
  _id: string;
  type: string;
  caseId?: string;
  model: string;
  totalTokens: number;
  durationMs: number;
  createdAt: number;
};

export type LoginAuditItem = {
  _id: string;
  userId: string;
  username?: string;
  nickname: string;
  source: 'login' | 'register';
  createdAt: number;
};

export type DailyActivityRow = {
  date: string;
  loginCount: number;
  onlineCount: number;
};

export type Dashboard = {
  onlineUsers: number;
  inventoryCounts: Record<string, number>;
  aiStats: { totalCalls: number; totalTokens: number };
  recentLogs: AiLogItem[];
  dailyActivity: DailyActivityRow[];
  leaderboardSize: number;
  kvAdapter: string;
  blobAdapter: string;
  dbAdapter: string;
};

export function fetchAdminDashboard() {
  return apiRequest<{ success: boolean; dashboard: Dashboard }>('/admin/dashboard').then((r) => r.dashboard);
}

export function fetchOnlineUsers(page = 1, limit = 20) {
  return apiRequest<{ success: boolean } & Paginated<OnlineUser>>(
    `/admin/online-users?page=${page}&limit=${limit}`
  );
}

export function fetchAdminInventory(page = 1, limit = 20, status?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set('status', status);
  return apiRequest<{ success: boolean } & Paginated<InventoryItem>>(`/admin/inventory?${qs}`);
}

export function fetchAdminAiLogs(page = 1, limit = 20, type?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) qs.set('type', type);
  return apiRequest<{ success: boolean } & Paginated<AiLogItem>>(`/admin/ai-logs?${qs}`);
}

export function fetchAdminLoginAudits(page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest<{ success: boolean } & Paginated<LoginAuditItem>>(`/admin/login-audits?${qs}`);
}

export type RefillStatus = {
  success: boolean;
  status: 'pending' | 'running' | 'ready' | 'failed';
  stage: string;
  progress: number;
  stageLabel: string;
  current: number;
  total: number;
  created?: string[];
  errors?: string[];
  error?: string;
  message?: string;
  inventoryCounts?: Record<string, number>;
};

export function startRefillInventory(difficulty: string, count: number) {
  return apiRequest<{
    success: boolean;
    refillJobId: string;
    status: string;
    stage: string;
    progress: number;
    stageLabel: string;
    total: number;
  }>('/admin/inventory/refill', {
    method: 'POST',
    body: JSON.stringify({ difficulty, count }),
  });
}

export function fetchRefillStatus(jobId: string) {
  return apiRequest<RefillStatus>(`/admin/inventory/refill/status?jobId=${encodeURIComponent(jobId)}`);
}

/** @deprecated 使用 startRefillInventory + fetchRefillStatus 轮询 */
export function refillInventory(difficulty: string, count: number) {
  return startRefillInventory(difficulty, count);
}

export function deleteAiLog(logId: string) {
  return apiRequest<{ success: boolean }>(`/admin/ai-logs/${logId}`, { method: 'DELETE' });
}

export function cleanupAiLogs(olderThanDays = 30, type?: string) {
  return apiRequest<{ success: boolean; removed: number; message: string }>(
    '/admin/ai-logs/cleanup',
    { method: 'POST', body: JSON.stringify({ olderThanDays, type }) }
  );
}

export function fetchInventoryClaims(caseId: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({ caseId, page: String(page), limit: String(limit) });
  return apiRequest<{ success: boolean } & Paginated<ClaimUser>>(`/admin/inventory/claims?${qs}`);
}
