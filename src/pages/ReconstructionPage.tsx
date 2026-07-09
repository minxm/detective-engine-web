import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import P5Title from '@/components/hud/P5Title';
import { motion } from 'framer-motion';
import { Clock, Fingerprint, Send } from 'lucide-react';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { scoreCase } from '@/services/case';
import { advanceFlowStep, CASE_FLOW_PATHS } from '@/utils/case-flow';
import { getProgress, saveProgress, saveEvaluation, flushSessionSync, useCaseStore } from '@/utils/case-store';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';

export default function ReconstructionPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const nickname = useAuthStore((s) => s.nickname);
  const setEvaluation = useCaseStore((s) => s.setEvaluation);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const progress = getProgress(id);
      const deduction = progress?.notes?.trim();
      if (!deduction) {
        alert(t.reconstruction.noDeduction);
        return false;
      }
      const res = await fetchCaseDataAndScore(id, deduction, nickname);
      setEvaluation(res.evaluation);
      saveEvaluation(id, res.evaluation);
      saveProgress({
        ...(progress!),
        endTime: Date.now(),
        score: res.evaluation.score,
        flowStep: 'closed',
      });
      void flushSessionSync(id);
      advanceFlowStep(id, 'closed');
      navigate(CASE_FLOW_PATHS.closed(id));
      return false;
    } catch (error) {
      alert((error as Error).message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CaseRoomShell
      caseId={id}
      step="reconstruction"
      loadingLabel={t.reconstruction.loading}
      hideNext
    >
      {(caseData) => {
        const progress = getProgress(caseData.id);
        const discovered = caseData.evidence.filter((e) => progress?.discoveredEvidence.includes(e.id));
        const deduction = progress?.notes ?? '';

        return (
          <>
            <P5Title className="mb-4">{t.flow.reconstruction}</P5Title>
            <p className="text-spec-gray font-mono text-xs mb-6">{t.reconstruction.hint}</p>

            <div className="grid lg:grid-cols-3 gap-4 mb-8">
              <HudPanel className="p-5">
                <p className="hud-label mb-4 flex items-center gap-2"><Fingerprint className="w-3 h-3" /> {t.reconstruction.evidenceSummary}</p>
                {discovered.length === 0 ? (
                  <p className="text-sm text-slate-600 font-mono">{t.reconstruction.noEvidence}</p>
                ) : (
                  <ul className="space-y-2">
                    {discovered.map((e) => (
                      <li key={e.id} className="text-sm text-slate-400 border-l border-cyan-500/20 pl-3">
                        <span className="text-white font-mono text-xs">{e.name}</span>
                        <p className="text-[11px] mt-0.5">{e.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </HudPanel>

              <HudPanel className="p-5">
                <p className="hud-label mb-4 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {t.reconstruction.timeline}
                  <span className="font-mono text-[10px] text-spec-gray/40 ml-auto">{caseData.timeline.length}</span>
                </p>
                <ol className="space-y-3">
                  {caseData.timeline.map((event, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-l-2 border-spec-cyan/20 pl-3 min-w-0"
                    >
                      <span className="font-mono text-[10px] text-spec-cyan block mb-1 leading-snug break-words">
                        {event.time}
                      </span>
                      <p className="text-xs text-white/85 leading-snug break-words">{event.event}</p>
                      {event.location && (
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5 break-words">{event.location}</p>
                      )}
                    </motion.li>
                  ))}
                </ol>
              </HudPanel>

              <HudPanel className="p-5">
                <p className="hud-label mb-4 flex items-center gap-2"><Send className="w-3 h-3" /> {t.reconstruction.deductionPreview}</p>
                {deduction ? (
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{deduction}</p>
                ) : (
                  <p className="text-sm text-slate-600 font-mono">{t.reconstruction.noDeduction}</p>
                )}
              </HudPanel>
            </div>

            <div className="flex justify-center">
              <HudButton onClick={handleSubmit} disabled={isSubmitting || !deduction.trim()}>
                {isSubmitting ? t.investigate.submitting : t.flow.submitCase}
              </HudButton>
            </div>
          </>
        );
      }}
    </CaseRoomShell>
  );
}

async function fetchCaseDataAndScore(caseId: string, deduction: string, displayName: string) {
  const { loadCaseData } = await import('@/utils/case-store');
  const { fetchCaseById } = await import('@/services/case');
  let caseData = await loadCaseData(caseId);
  if (!caseData) {
    const res = await fetchCaseById(caseId);
    caseData = res.caseData;
  }
  if (!caseData) throw new Error(t.case.notFound);
  const progress = getProgress(caseId);
  return scoreCase({
    caseData,
    userDeduction: deduction,
    displayName,
    progress: progress
      ? {
          discoveredEvidence: progress.discoveredEvidence,
          interrogatedSuspects: progress.interrogatedSuspects,
          notes: progress.notes,
          startTime: progress.startTime,
          flowStep: progress.flowStep,
        }
      : undefined,
  });
}
