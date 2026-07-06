import { useParams } from 'react-router-dom';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import SceneFrame from '@/components/ui/SceneFrame';
import HudPanel from '@/components/hud/HudPanel';
import P5Title from '@/components/hud/P5Title';
import { resolveAssetUrl } from '@/utils/asset-url';
import { t } from '@/i18n/zh';

export default function ForensicsPage() {
  const { id = '' } = useParams();

  return (
    <CaseRoomShell caseId={id} step="forensics" loadingLabel={t.forensics.loading} nextLabel={t.flow.toInterrogate}>
      {(caseData) => {
        const sceneImage = resolveAssetUrl(caseData.sceneImageUrl);

        return (
          <>
            <P5Title className="mb-6">{t.flow.forensics}</P5Title>

            <HudPanel className="p-5 mb-6">
              <p className="hud-label mb-3">{t.forensics.report}</p>
              <p className="text-sm font-bold text-white/90">{caseData.victim.name}</p>
              <p className="font-mono text-xs text-spec-gray/60 mt-1">
                {caseData.victim.age} · {caseData.victim.occupation}
              </p>
              <p className="hud-label mt-4 mb-2">{t.case.deathCause}</p>
              <p className="text-sm text-spec-gray leading-relaxed">{caseData.deathMethod}</p>
            </HudPanel>

            <HudPanel className="p-5 mb-6">
              <p className="hud-label mb-3">{t.forensics.victimProfile}</p>
              <p className="text-sm text-spec-gray leading-relaxed">{caseData.victim.background}</p>
            </HudPanel>

            {sceneImage ? (
              <SceneFrame
                src={sceneImage}
                alt={t.case.sceneAlt}
                subtitle={t.forensics.sceneAnalysis}
                label={caseData.setting}
              />
            ) : (
              <HudPanel className="p-5">
                <p className="hud-label mb-2">{t.forensics.sceneAnalysis}</p>
                <p className="text-sm text-spec-gray leading-relaxed italic">{caseData.sceneDescription}</p>
              </HudPanel>
            )}
          </>
        );
      }}
    </CaseRoomShell>
  );
}
