import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Lock, Unlock, Clock, ChevronDown } from 'lucide-react';
import CaseRoomShell from '@/components/case/CaseRoomShell';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import P5Title from '@/components/hud/P5Title';
import EvidenceBoardDecor from '@/components/rooms/EvidenceBoardDecor';
import { getProgress, saveProgress } from '@/utils/case-store';
import { t } from '@/i18n/zh';

export default function EvidencePage() {
  const { id = '' } = useParams();
  const [discoveredEvidence, setDiscoveredEvidence] = useState<string[]>(() => getProgress(id)?.discoveredEvidence ?? []);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const handleDiscover = (caseId: string, evidenceId: string) => {
    if (discoveredEvidence.includes(evidenceId)) return;
    const next = [...discoveredEvidence, evidenceId];
    setDiscoveredEvidence(next);
    const progress = getProgress(caseId);
    saveProgress({
      ...(progress ?? { caseId, interrogatedSuspects: [], notes: '', startTime: Date.now(), flowStep: 'evidence' }),
      discoveredEvidence: next,
    });
  };

  return (
    <CaseRoomShell
      caseId={id}
      step="evidence"
      loadingLabel={t.investigate.loading}
      nextLabel={t.flow.toForensics}
    >
      {(caseData) => (
        <div className="relative">
          <EvidenceBoardDecor />
          <P5Title red className="mb-2">{t.flow.evidence}</P5Title>
          <p className="text-spec-gray font-mono text-xs mb-6">{caseData.title}</p>

          <div className="grid gap-3">
            {caseData.evidence.map((evidence, i) => {
              const discovered = discoveredEvidence.includes(evidence.id);
              return (
                <motion.div key={evidence.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <HudPanel scan={discovered} className={discovered ? 'hud-evidence-found' : 'hud-evidence-locked'}>
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className={`neo-icon-box !w-9 !h-9 shrink-0 ${discovered ? 'text-accent-gold shadow-neon-gold' : 'text-spec-gray'}`}>
                          {discovered ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="font-mono text-sm font-semibold text-white">{evidence.name}</h3>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                            <MapPin className="w-3 h-3" />{evidence.location}
                          </p>
                          {discovered && (
                            <>
                              <span className="inline-block mt-2 hud-badge !text-[9px] text-accent-gold">{t.investigate.discovered}</span>
                              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{evidence.description}</p>
                            </>
                          )}
                        </div>
                      </div>
                      {!discovered && (
                        <HudButton variant="danger" onClick={() => handleDiscover(caseData.id, evidence.id)} className="shrink-0 !text-xs">
                          <Search className="w-3.5 h-3.5" /> {t.investigate.investigateBtn}
                        </HudButton>
                      )}
                    </div>
                  </HudPanel>
                </motion.div>
              );
            })}
          </div>

          <p className="hud-meta mt-4 relative z-[1]">
            {discoveredEvidence.length}/{caseData.evidence.length} {t.investigate.tabs.evidence}
          </p>

          <div className="relative z-[1] mt-8">
            <button
              onClick={() => setTimelineOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hud-panel transition-all duration-200 hover:brightness-110"
            >
              <span className="flex items-center gap-2 hud-label !mb-0">
                <Clock className="w-3 h-3" /> {t.investigate.tabs.timeline}
                <span className="font-mono text-[10px] text-spec-gray/50 ml-1">({caseData.timeline.length})</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-spec-gray/50 transition-transform duration-200 ${timelineOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {timelineOpen && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2">
                    {caseData.timeline.map((event, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <HudPanel className="p-4">
                          <div className="flex gap-4 items-start">
                            <span className="font-mono text-xs text-spec-cyan font-bold shrink-0 w-16 pt-0.5">{event.time}</span>
                            <div className="border-l border-spec-cyan/15 pl-4 flex-1">
                              <p className="text-sm text-white/90">{event.event}</p>
                              <p className="text-[11px] text-slate-600 mt-1 font-mono">{event.location}</p>
                            </div>
                          </div>
                        </HudPanel>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </CaseRoomShell>
  );
}
