import { apiRequest } from './api';
import { isTransientApiError } from '@/utils/apiError';
import type { CaseData } from '@/types';

type CreateCaseResponse =
  | { success: true; source: 'inventory'; caseId: string; caseData: CaseData }
  | { success: true; source: 'generating'; jobId: string };

type CaseStatusResponse = {
  success: boolean;
  status: string;
  stage: string;
  progress?: number;
  caseId?: string;
  caseData?: CaseData | null;
  error?: string;
  caseParseError?: string;
};

export async function createCase(difficulty: string) {
  return apiRequest<CreateCaseResponse>('/case/create', {
    method: 'POST',
    body: JSON.stringify({ difficulty, phase: 'start' }),
  });
}

export async function fetchCaseStatus(jobId: string) {
  return apiRequest<CaseStatusResponse>(`/case/status?jobId=${encodeURIComponent(jobId)}`);
}

export async function fetchCaseById(caseId: string) {
  return apiRequest<{ success: boolean; caseData: CaseData }>(`/case/${encodeURIComponent(caseId)}`);
}

export async function fetchInventoryHint(difficulty?: string) {
  const qs = difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : '';
  return apiRequest<{
    success: boolean;
    available?: number;
    counts?: Record<string, number>;
    total?: number;
  }>(`/case/inventory-hint${qs}`, {}, { skipTokenRefresh: true });
}

export async function syncSession(payload: {
  caseId: string;
  progress?: {
    discoveredEvidence?: string[];
    interrogatedSuspects?: string[];
    notes?: string;
    startTime?: number;
    endTime?: number;
    score?: number;
    flowStep?: string;
  };
  messages?: Array<{
    suspectId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}) {
  return apiRequest<{ success: boolean }>('/session/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function scoreCase(payload: {
  caseData: CaseData;
  userDeduction: string;
  displayName?: string;
  progress?: {
    discoveredEvidence?: string[];
    interrogatedSuspects?: string[];
    notes?: string;
    startTime?: number;
    flowStep?: string;
  };
}) {
  const body = JSON.stringify(payload);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await apiRequest<{ success: boolean; evaluation: import('@/types').CaseEvaluation }>('/score', {
        method: 'POST',
        body,
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const transient = isTransientApiError(lastError.message) || (error as { status?: number }).status === 503;
      if (!transient || attempt >= 2) throw lastError;
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }

  throw lastError ?? new Error('评分失败，请稍后重试');
}

export async function interrogateSuspect(payload: {
  suspect: { id: string; name: string; isGuilty?: boolean };
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  evidence: string[];
  caseData: CaseData;
}, onDelta: (content: string) => void) {
  const { apiStream } = await import('./api');
  return apiStream('/interrogate', payload, onDelta);
}
