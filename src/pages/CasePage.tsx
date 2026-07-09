import { useParams } from 'react-router-dom';
import { Eye, FileText, User, Users } from 'lucide-react';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import SceneFrame from '@/components/ui/SceneFrame';
import HudPanel from '@/components/hud/HudPanel';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import P5Title from '@/components/hud/P5Title';
import { resolveAssetUrl } from '@/utils/asset-url';
import { t } from '@/i18n/zh';

const victimPortraitStyle = {
  width: 64,
  height: 64,
  clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
  boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.3)',
  background: 'rgba(11,15,20,0.9)',
} as const;

function VictimPortraitBlock({
  name,
  imageUrl,
  size = 'md',
}: {
  name: string;
  imageUrl?: string;
  size?: 'md' | 'lg';
}) {
  const boxStyle = size === 'lg'
    ? { ...victimPortraitStyle, width: 80, height: 80 }
    : victimPortraitStyle;

  return (
    <div className="relative shrink-0 overflow-hidden" style={boxStyle}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <CharacterPortrait name={name} size={size} />
        </div>
      )}
    </div>
  );
}

function SuspectGrid({ suspects, className }: { suspects: CasePageSuspects; className: string }) {
  return (
    <div className={className}>
      {suspects.map((s) => (
        <div
          key={s.id}
          className={`file-card p-3 text-center${suspects.length === 3 ? ' flex-1 min-w-0' : ''}`}
        >
          <div className="flex justify-center mb-2">
            <CharacterPortrait name={s.name} imageUrl={s.imageUrl} size="md" />
          </div>
          <p className="font-mono text-xs text-white truncate">{s.name}</p>
          <p className="font-mono text-[9px] text-spec-gray/45 mt-0.5 truncate">{s.occupation}</p>
        </div>
      ))}
    </div>
  );
}

type CasePageSuspects = Array<{
  id: string;
  name: string;
  occupation: string;
  imageUrl?: string;
}>;

export default function CasePage() {
  const { id = '' } = useParams();

  return (
    <CaseRoomShell caseId={id} step="open" loadingLabel={t.case.loading} nextLabel={t.flow.toEvidence}>
      {(caseData) => {
        const caseNum = caseData.id.slice(-6).toUpperCase();
        const victimImage = resolveAssetUrl(caseData.victim.imageUrl);
        const sceneImage = resolveAssetUrl(caseData.sceneImageUrl);

        const suspectGridClass =
          caseData.suspects.length === 3
            ? 'flex gap-3'
            : caseData.suspects.length === 4
              ? 'grid grid-cols-2 sm:grid-cols-4 gap-3'
              : 'grid grid-cols-2 sm:grid-cols-3 gap-3';

        return (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="hud-badge font-mono">
                <FileText className="w-3 h-3" /> #{caseNum}
              </div>
              <span className="hud-stamp">
                <Eye className="w-3 h-3" /> {t.hud.classified}
              </span>
            </div>

            <P5Title>{t.flow.open}</P5Title>
            <h2 className="text-lg text-white font-mono mt-3 mb-6">{caseData.title}</h2>

            {sceneImage && (
              <SceneFrame
                src={sceneImage}
                alt={t.case.sceneAlt}
                subtitle={t.hud.crimeScene}
                label={caseData.setting}
              />
            )}

            <HudPanel className="p-6 mb-6">
              <p className="hud-label mb-3">{t.case.overview}</p>
              <p className="font-mono text-[10px] text-spec-gray/40 tracking-widest mb-3">
                {t.case.folderLabel} / {caseNum}
              </p>
              <p className="text-sm text-spec-gray leading-relaxed">{caseData.sceneDescription}</p>
              <div className="hud-divider my-4 opacity-30" />
              <p className="font-mono text-xs text-spec-gray/60">
                {caseData.setting} · {caseData.deathMethod}
              </p>
            </HudPanel>

            {/* 移动端 */}
            <div className="sm:hidden">
              <p className="hud-label mb-3">
                <User className="w-3 h-3 inline" /> {t.case.victim}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="file-card col-span-2 p-3 flex items-center gap-4">
                  <VictimPortraitBlock name={caseData.victim.name} imageUrl={victimImage} />
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-white font-semibold truncate">{caseData.victim.name}</p>
                    <p className="font-mono text-[10px] text-spec-gray/50 mt-0.5">
                      {caseData.victim.age}
                      {t.case.ageUnit} · {caseData.victim.occupation}
                    </p>
                    <p className="font-mono text-[9px] text-spec-red/50 mt-1 tracking-wider">{t.case.deceased}</p>
                  </div>
                </div>
              </div>

              <p className="hud-label mb-3">
                <Users className="w-3 h-3 inline" /> {t.case.suspects}
              </p>
              <SuspectGrid suspects={caseData.suspects} className={suspectGridClass} />
            </div>

            {/* PC 端 */}
            <div className="hidden sm:block">
              <p className="hud-label mb-3">
                <User className="w-3 h-3 inline" /> {t.case.victim}
              </p>
              <div className="file-card p-5 mb-8 flex items-center gap-5">
                <VictimPortraitBlock name={caseData.victim.name} imageUrl={victimImage} size="lg" />
                <div className="min-w-0">
                  <p className="font-mono text-base text-white font-semibold">{caseData.victim.name}</p>
                  <p className="font-mono text-xs text-spec-gray/55 mt-1">
                    {caseData.victim.age}
                    {t.case.ageUnit} · {caseData.victim.occupation}
                  </p>
                  <p className="font-mono text-[9px] text-spec-red/50 mt-2 tracking-wider">{t.case.deceased}</p>
                </div>
              </div>

              <p className="hud-label mb-3">
                <Users className="w-3 h-3 inline" /> {t.case.suspects}
              </p>
              <SuspectGrid suspects={caseData.suspects} className={suspectGridClass} />
            </div>
          </>
        );
      }}
    </CaseRoomShell>
  );
}
