import type { CaseFlowStep } from '@/types';
import { getProgress, saveProgress } from '@/utils/case-store';

/** 案件内流程顺序（与用户指定一致） */
export const CASE_FLOW_ORDER: CaseFlowStep[] = [
  'open',
  'evidence',
  'forensics',
  'interrogate',
  'deduction',
  'reconstruction',
  'closed',
];

export const CASE_FLOW_PATHS: Record<CaseFlowStep, (caseId: string) => string> = {
  open: (id) => `/case/${id}`,
  evidence: (id) => `/case/${id}/evidence`,
  forensics: (id) => `/case/${id}/forensics`,
  interrogate: (id) => `/case/${id}/interrogate`,
  deduction: (id) => `/case/${id}/deduction`,
  reconstruction: (id) => `/case/${id}/reconstruction`,
  closed: (id) => `/case/${id}/result`,
};

export function flowStepIndex(step: CaseFlowStep): number {
  return CASE_FLOW_ORDER.indexOf(step);
}

export function getMaxFlowStep(caseId: string): CaseFlowStep {
  return getProgress(caseId)?.flowStep ?? 'open';
}

export function canAccessFlowStep(caseId: string, target: CaseFlowStep): boolean {
  const max = getMaxFlowStep(caseId);
  return flowStepIndex(target) <= flowStepIndex(max);
}

export function advanceFlowStep(caseId: string, target: CaseFlowStep) {
  const progress = getProgress(caseId);
  if (!progress) return;
  const current = progress.flowStep ?? 'open';
  if (flowStepIndex(target) > flowStepIndex(current)) {
    saveProgress({ ...progress, flowStep: target });
  }
}

export function nextFlowStep(current: CaseFlowStep): CaseFlowStep | null {
  const idx = flowStepIndex(current);
  return idx < CASE_FLOW_ORDER.length - 1 ? CASE_FLOW_ORDER[idx + 1] : null;
}

export function prevFlowStep(current: CaseFlowStep): CaseFlowStep | null {
  const idx = flowStepIndex(current);
  return idx > 0 ? CASE_FLOW_ORDER[idx - 1] : null;
}

export function initCaseProgress(caseId: string) {
  const existing = getProgress(caseId);
  if (existing) {
    if (!existing.flowStep) {
      const updated = { ...existing, flowStep: 'open' as CaseFlowStep };
      saveProgress(updated);
      return updated;
    }
    return existing;
  }
  const progress = {
    caseId,
    discoveredEvidence: [] as string[],
    interrogatedSuspects: [] as string[],
    notes: '',
    startTime: Date.now(),
    flowStep: 'open' as CaseFlowStep,
  };
  saveProgress(progress);
  return progress;
}
