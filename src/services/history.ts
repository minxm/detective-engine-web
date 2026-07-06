import { apiRequest } from './api';
import type { HistoryEntry } from '@/types';

export async function fetchHistory() {
  return apiRequest<{ success: boolean; entries: HistoryEntry[] }>('/history');
}
