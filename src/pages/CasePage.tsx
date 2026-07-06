import { useParams } from 'react-router-dom';
import { Eye, FileText, Users } from 'lucide-react';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import SceneFrame from '@/components/ui/SceneFrame';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import P5Title from '@/components/hud/P5Title';
import { t } from '@/i18n/zh';

export default function CasePage() {
  const { id = '' } = useParams();

  return (
    <CaseRoomShell caseId={id} step="open" loadingLabel={t.case.loading} nextLabel={t.flow.toEvidence}>
      {(caseData) => {
        const caseNum = caseData.id.slice(-6).toUpperCase();
        return (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="hud-badge font-mono"><FileText className="w-3 h-3" /> #{caseNum}</div>
              <span className="hud-stamp"><Eye className="w-3 h-3" /> {t.hud.classified}</span>
            </div>

            <P5Title>{t.flow.open}</P5Title>
            <h2 className="text-lg text-white font-mono mt-3 mb-6">{caseData.title}</h2>

            {caseData.sceneImageUrl && (
              <SceneFrame src={caseData.sceneImageUrl} alt={t.case.sceneAlt} subtitle={t.hud.crimeScene} label={caseData.setting} />
            )}

            <div className="archive-panel p-6 mb-6 relative z-[1]">
              <p className="archive-text text-[10px] tracking-widest mb-3 uppercase">Manila Folder / {caseNum}</p>
              <p className="archive-text text-sm leading-relaxed opacity-90">{caseData.sceneDescription}</p>
              <div className="hud-divider my-4 opacity-30" />
              <p className="archive-text text-xs opacity-70">{caseData.setting} � {caseData.deathMethod}</p>
            </div>

            <p className="hud-label mb-3"><Users className="w-3 h-3 inline" /> {t.case.suspects}</p>
            <div className="grid grid-cols-3 gap-3">
              {caseData.suspects.map((s) => (
                <div key={s.id} className="file-card p-3 text-center">
                  <div className="flex justify-center mb-2"><CharacterPortrait name={s.name} imageUrl={s.imageUrl} size="md" /></div>
                  <p className="font-mono text-xs text-white truncate">{s.name}</p>
                </div>
              ))}
            </div>
          </>
        );
      }}
    </CaseRoomShell>
  );
}
