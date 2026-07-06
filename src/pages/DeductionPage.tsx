import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import HudPanel from '@/components/hud/HudPanel';
import P5Title from '@/components/hud/P5Title';
import { HudTextarea } from '@/components/hud/HudInput';
import DeductionGraph from '@/components/rooms/DeductionGraph';
import { getProgress, saveProgress } from '@/utils/case-store';
import { t } from '@/i18n/zh';

export default function DeductionPage() {
  const { id = '' } = useParams();
  const [deduction, setDeduction] = useState(() => getProgress(id)?.notes ?? '');

  const saveDraft = () => {
    const progress = getProgress(id);
    if (!progress) return false;
    saveProgress({ ...progress, notes: deduction });
    return deduction.trim().length > 0;
  };

  return (
    <CaseRoomShell
      caseId={id}
      step="deduction"
      loadingLabel={t.deduction.loading}
      nextLabel={t.flow.toReconstruction}
      onNext={() => {
        if (!deduction.trim()) {
          alert(t.investigate.submitHint);
          return false;
        }
        saveDraft();
        return true;
      }}
    >
      {(caseData) => {
        const discovered = getProgress(caseData.id)?.discoveredEvidence ?? [];
        return (
          <>
            <P5Title className="mb-2">{t.flow.deduction}</P5Title>
            <p className="text-spec-gray font-mono text-xs mb-6">{caseData.title}</p>

            <DeductionGraph caseData={caseData} discoveredIds={discovered} />

            <HudPanel solid scan className="p-6">
              <h2 className="font-bold text-white flex items-center gap-2 mb-1">
                <Send className="w-4 h-4 text-spec-cyan" /> {t.investigate.submitTitle}
              </h2>
              <p className="text-xs text-spec-gray mb-3 font-mono">{t.deduction.hint}</p>
              <ul className="mb-4 space-y-1.5">
                {t.investigate.submitRequirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-spec-gray/80 font-mono">
                    <span className="text-spec-cyan shrink-0">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
              <HudTextarea
                value={deduction}
                onChange={(e) => setDeduction(e.target.value)}
                onBlur={saveDraft}
                rows={6}
                placeholder={t.investigate.submitPlaceholder}
              />
            </HudPanel>
          </>
        );
      }}
    </CaseRoomShell>
  );
}
