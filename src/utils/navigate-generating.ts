import type { NavigateFunction } from 'react-router-dom';
import type { CaseData } from '@/types';
import { saveCaseData, scrollWindowToTop } from '@/utils/case-store';

export const GENERATING_ASSIGN_JOB_ID = 'assign';

export type InstantGeneratingState = {
  instant: true;
  caseId: string;
  caseData?: CaseData;
};

type CreateCaseResult =
  | { success: true; source: 'inventory'; caseId: string; caseData: CaseData }
  | { success: true; source: 'generating'; jobId: string };

export function navigateToGenerating(
  navigate: NavigateFunction,
  difficulty: string,
  data: CreateCaseResult,
) {
  scrollWindowToTop();
  const qs = `?difficulty=${encodeURIComponent(difficulty)}`;

  if ('caseData' in data && data.source === 'inventory') {
    void saveCaseData(data.caseData);
    navigate(`/generating/${GENERATING_ASSIGN_JOB_ID}${qs}`, {
      state: {
        instant: true,
        caseId: data.caseId,
      } satisfies InstantGeneratingState,
    });
    return;
  }

  if ('jobId' in data) {
    navigate(`/generating/${data.jobId}${qs}`);
  }
}
