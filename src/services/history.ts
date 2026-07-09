import { apiRequest } from './api';
import type { HistoryEntry } from '@/types';

export type HistoryStats = {
  total: number;
  active: number;
  completed: number;
};

export type HistoryListResult = {
  success: boolean;
  entries: HistoryEntry[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  stats: HistoryStats;
};

export type HistoryFilter = 'all' | 'active' | 'completed';

export async function fetchHistory(params?: {
  page?: number;
  limit?: number;
  filter?: HistoryFilter;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.filter && params.filter !== 'all') {
    qs.set('status', params.filter === 'active' ? 'in_progress' : 'completed');
  }
  const query = qs.toString();
  return apiRequest<HistoryListResult>(`/history${query ? `?${query}` : ''}`);
}

export async function fetchHistoryStats() {
  return apiRequest<{ success: boolean; stats: HistoryStats }>('/history/stats');
}

export async function fetchHistoryItem(caseId: string) {
  return apiRequest<{ success: boolean; entry: HistoryEntry | null }>(
    `/history/item?caseId=${encodeURIComponent(caseId)}`,
  );
}
