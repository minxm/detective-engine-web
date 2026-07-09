import { useParams } from 'react-router-dom';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import SceneFrame from '@/components/ui/SceneFrame';
import HudPanel from '@/components/hud/HudPanel';
import P5Title from '@/components/hud/P5Title';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { resolveAssetUrl } from '@/utils/asset-url';
import { t } from '@/i18n/zh';

export default function ForensicsPage() {
  const { id = '' } = useParams();

  return (
    <CaseRoomShell caseId={id} step="forensics" loadingLabel={t.forensics.loading} nextLabel={t.flow.toInterrogate}>
      {(caseData) => {
        const sceneImage = resolveAssetUrl(caseData.sceneImageUrl);
        const victimImage = resolveAssetUrl(caseData.victim.imageUrl);

        return (
          <>
            <P5Title className="mb-6">{t.flow.forensics}</P5Title>

            {/* 受害者档案 — 含图像 */}
            <HudPanel className="p-5 mb-6">
              <p className="hud-label mb-4">{t.forensics.report}</p>
              <div className="flex gap-5 items-start">
                {/* 受害者画像 */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: 96,
                      height: 96,
                      clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                      boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.35), 0 0 20px rgba(229,9,20,0.08)',
                      background: 'rgba(11,15,20,0.9)',
                    }}
                  >
                    {victimImage ? (
                      <img
                        src={victimImage}
                        alt={caseData.victim.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CharacterPortrait name={caseData.victim.name} size="lg" />
                      </div>
                    )}
                    {/* 已故标记 */}
                    <div
                      className="absolute bottom-0 inset-x-0 py-0.5 text-center font-mono text-[7px] tracking-widest"
                      style={{
                        background: 'rgba(229,9,20,0.65)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      DECEASED
                    </div>
                  </div>
                  <span className="font-mono text-[8px] text-spec-gray/35 tracking-widest">VICTIM</span>
                </div>

                {/* 受害者信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white/95 mb-1">{caseData.victim.name}</p>
                  <p className="font-mono text-xs text-spec-gray/55 mb-3">
                    {caseData.victim.age}{t.case.ageUnit} · {caseData.victim.occupation}
                  </p>
                  <p className="hud-label mb-1">{t.case.deathCause}</p>
                  <p className="text-sm text-spec-gray leading-relaxed">{caseData.deathMethod}</p>
                </div>
              </div>
            </HudPanel>

            {/* 受害者背景档案 */}
            <HudPanel className="p-5 mb-6">
              <p className="hud-label mb-3">{t.forensics.victimProfile}</p>
              <p className="text-sm text-spec-gray leading-relaxed">{caseData.victim.background}</p>
            </HudPanel>

            {/* 案发现场 */}
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
