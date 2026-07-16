import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress, scrollWindowToTop } from '@/utils/case-store';
import { resolveCaseData } from '@/utils/resolve-case-data';
import { canAccessFlowStep, CASE_FLOW_PATHS, initCaseProgress } from '@/utils/case-flow';
import type { CaseData, CaseFlowStep } from '@/types';

export function useCaseLoader(caseId: string, requiredStep?: CaseFlowStep) {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrollWindowToTop();
    let cancelled = false;
    (async () => {
      const data = await resolveCaseData(caseId);
      if (cancelled) return;
      if (!data) {
        setLoading(false);
        return;
      }
      initCaseProgress(caseId);
      if (requiredStep && !canAccessFlowStep(caseId, requiredStep)) {
        const max = getProgress(caseId)?.flowStep ?? 'open';
        navigate(CASE_FLOW_PATHS[max](caseId), { replace: true });
        return;
      }
      setCaseData(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [caseId, requiredStep, navigate]);

  return { caseData, loading, notFound: !loading && !caseData };
}
