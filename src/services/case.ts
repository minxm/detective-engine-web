import { apiRequest } from './api';
import type { CaseData } from '@/types';

type CreateCaseResponse =
  | { success: true; source: 'inventory'; caseId: string; caseData: CaseData }
  | { success: true; source: 'generating'; jobId: string };

type CaseStatusResponse = {
  success: boolean;
  status: string;
  stage: string;
  caseId?: string;
  caseData?: CaseData | null;
  error?: string;
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

export async function scoreCase(payload: {
  caseData: CaseData;
  userDeduction: string;
  displayName?: string;
}) {
  return apiRequest<{ success: boolean; evaluation: import('@/types').CaseEvaluation }>('/score', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
