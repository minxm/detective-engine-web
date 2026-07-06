import { apiRequest } from './api';
import type { LeaderboardEntry } from '@/types';

export async function fetchLeaderboard() {
  return apiRequest<{ success: boolean; entries: LeaderboardEntry[] }>('/rank');
}
