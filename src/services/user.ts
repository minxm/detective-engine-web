import { apiRequest } from './api';
import type { UserStats } from '@/types';

export async function fetchAuthConfig() {
  return apiRequest<{
    success: boolean;
    auth: { enabled: boolean; envId: string; region: string; providers?: string[] };
  }>('/auth/config', {}, { skipTokenRefresh: true });
}

export async function sendHeartbeat() {
  return apiRequest<{ success: boolean }>('/auth/heartbeat', { method: 'POST', body: '{}' });
}

export async function fetchUserStats() {
  return apiRequest<{ success: boolean; stats: UserStats }>('/user/stats');
}

export async function fetchUserProfile() {
  return apiRequest<{ success: boolean; user: { nickname: string; avatar?: string; role: 'user' | 'admin' } }>('/user/profile');
}

export async function updateUserProfile(payload: { nickname?: string; avatar?: string }) {
  return apiRequest<{ success: boolean; user: { nickname: string; avatar?: string } }>('/user/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminStatus() {
  return apiRequest<{ success: boolean; isAdmin: boolean; role: 'user' | 'admin' }>('/admin/status');
}
