import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { getInterrogation, getSuspectId } from '@/utils/case-store';
import { t } from '@/i18n/zh';

export default function InterrogateHubPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  return (
    <CaseRoomShell caseId={id} step="interrogate" loadingLabel={t.interrogate.loading} nextLabel={t.flow.toDeduction}>
      {(caseData) => {
        const interrogated = caseData.suspects.map((s, i) => {
          const sid = getSuspectId(s, i);
          return getInterrogation(caseData.id, sid).some((m) => m.role === 'user') ? sid : null;
        }).filter(Boolean) as string[];
        return (
          <>
            <p className="hud-label mb-2">{t.flow.interrogate}</p>
            <h1 className="text-xl font-black hud-title mb-2">{t.interrogate.selectSuspect}</h1>
            <p className="text-sm text-slate-500 font-mono mb-8">{caseData.title}</p>

            <div className="grid md:grid-cols-2 gap-3">
              {caseData.suspects.map((suspect, index) => {
                const suspectId = getSuspectId(suspect, index);
                const interviewed = interrogated.includes(suspectId);
                return (
                  <HudPanel key={suspect.id} hover className="p-4">
                    <div className="flex gap-4 items-center">
                      <CharacterPortrait name={suspect.name} imageUrl={suspect.imageUrl} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-white text-sm">{suspect.name}</p>
                        <p className="text-[11px] text-slate-500">{suspect.occupation}</p>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{suspect.relationship}</p>
                        <HudButton
                          variant="ghost"
                          onClick={() => navigate(`/case/${id}/interrogate/${encodeURIComponent(suspectId)}`)}
                          className="!text-[11px] !py-1.5 !px-3 mt-3"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> {interviewed ? t.interrogate.continueBtn : t.investigate.interrogateBtn}
                        </HudButton>
                      </div>
                    </div>
                  </HudPanel>
                );
              })}
            </div>
          </>
        );
      }}
    </CaseRoomShell>
  );
}
