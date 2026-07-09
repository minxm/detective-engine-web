import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import HudButton from '@/components/hud/HudButton';
import CaseFlowBar from '@/components/case/CaseFlowBar';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { useCaseLoader } from '@/hooks/useCaseLoader';
import {
  advanceFlowStep,
  CASE_FLOW_PATHS,
  getMaxFlowStep,
  nextFlowStep,
  prevFlowStep,
} from '@/utils/case-flow';
import { t } from '@/i18n/zh';
import type { CaseData, CaseFlowStep } from '@/types';

export default function CaseRoomShell({
  caseId,
  step,
  loadingLabel,
  children,
  onNext,
  nextLabel,
  hideNext,
  hidePrev,
}: {
  caseId: string;
  step: CaseFlowStep;
  loadingLabel: string;
  children: (caseData: CaseData) => ReactNode;
  onNext?: () => void | boolean | Promise<void | boolean>;
  nextLabel?: string;
  hideNext?: boolean;
  hidePrev?: boolean;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { caseData, loading, notFound } = useCaseLoader(caseId, step);
  const isClosedArchive =
    searchParams.get('view') === 'archive' ||
    (getMaxFlowStep(caseId) === 'closed' && step === 'open');

  const goNext = async () => {
    if (onNext) {
      const ok = await onNext();
      if (ok === false) return;
    }
    const next = nextFlowStep(step);
    if (!next) return;
    advanceFlowStep(caseId, next);
    navigate(CASE_FLOW_PATHS[next](caseId));
  };

  const goPrev = () => {
    const prev = prevFlowStep(step);
    if (!prev) return;
    navigate(CASE_FLOW_PATHS[prev](caseId));
  };

  if (loading) {
    return <PageLayout><LoadingScreen label={loadingLabel} /></PageLayout>;
  }

  if (notFound || !caseData) {
    return (
      <PageLayout maxWidth="max-w-md">
        <p className="text-center text-slate-400 py-20">{t.case.notFound}</p>
        <div className="flex justify-center">
          <HudButton variant="ghost" onClick={() => navigate('/archive')}>{t.flow.backArchive}</HudButton>
        </div>
      </PageLayout>
    );
  }

  const next = nextFlowStep(step);

  return (
    <RoomAtmosphere room={step === 'closed' ? 'closed' : step}>
      <PageLayout maxWidth="max-w-5xl">
      {!isClosedArchive && <CaseFlowBar current={step} />}
      {isClosedArchive && (
        <p className="font-mono text-[10px] text-emerald-400/70 tracking-widest mb-4">
          {t.history.statusCompleted} · {t.hud.caseFile}
        </p>
      )}
      {children(caseData)}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-spec-cyan/10 gap-3">
        {!hidePrev && prevFlowStep(step) ? (
          <HudButton variant="ghost" onClick={goPrev}>
            <ChevronLeft className="w-4 h-4" /> {t.flow.prev}
          </HudButton>
        ) : (
          <HudButton variant="ghost" onClick={() => navigate('/archive')}>
            <ChevronLeft className="w-4 h-4" /> {t.flow.backArchive}
          </HudButton>
        )}
        {!hideNext && next && !isClosedArchive && (
          <HudButton onClick={goNext}>
            {nextLabel ?? t.flow.next} <ArrowRight className="w-4 h-4" />
          </HudButton>
        )}
      </div>
    </PageLayout>
    </RoomAtmosphere>
  );
}
