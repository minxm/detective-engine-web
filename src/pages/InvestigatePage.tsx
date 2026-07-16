import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Clock, MessageSquare, Send, Fingerprint, MapPin, Lock, Unlock } from 'lucide-react';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import PageLayout from '@/components/ui/PageLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import SceneFrame from '@/components/ui/SceneFrame';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import HudTabs from '@/components/hud/HudTabs';
import { HudTextarea } from '@/components/hud/HudInput';
import BackButton from '@/components/BackButton';
import { scoreCase } from '@/services/case';
import { getProgress, getSuspectId, saveProgress } from '@/utils/case-store';
import { resolveCaseData } from '@/utils/resolve-case-data';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useCaseStore } from '@/utils/case-store';
import { t } from '@/i18n/zh';
import type { CaseData } from '@/types';

export default function InvestigatePage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nickname = useAuthStore((s) => s.nickname);
  const setEvaluation = useCaseStore((s) => s.setEvaluation);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'suspects' | 'timeline'>(
    (searchParams.get('tab') as 'evidence' | 'suspects' | 'timeline') || 'evidence'
  );
  const [discoveredEvidence, setDiscoveredEvidence] = useState<string[]>([]);
  const [deduction, setDeduction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await resolveCaseData(id);
      if (cancelled || !data) return;
      setCaseData(data);
      const progress = getProgress(id);
      if (progress) setDiscoveredEvidence(progress.discoveredEvidence);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleDiscoverEvidence = (evidenceId: string) => {
    if (!caseData || discoveredEvidence.includes(evidenceId)) return;
    const next = [...discoveredEvidence, evidenceId];
    setDiscoveredEvidence(next);
    const progress = getProgress(caseData.id);
    saveProgress({ ...(progress ?? { caseId: caseData.id, interrogatedSuspects: [], notes: '', startTime: Date.now() }), discoveredEvidence: next });
  };

  const handleInterrogate = (suspectId: string) => {
    navigate(`/interrogate/${id}?suspect=${encodeURIComponent(suspectId)}`);
  };

  const handleSubmitDeduction = async () => {
    if (!caseData || !deduction.trim()) return;
    setIsSubmitting(true);
    try {
      const progress = getProgress(caseData.id);
      const res = await scoreCase({
        caseData,
        userDeduction: deduction,
        displayName: nickname,
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
      setEvaluation(res.evaluation);
      saveProgress({
        ...(progress ?? { caseId: caseData.id, discoveredEvidence, interrogatedSuspects: [], notes: '', startTime: Date.now() }),
        endTime: Date.now(),
        score: res.evaluation.score,
        discoveredEvidence,
      });
      navigate(`/result/${caseData.id}`);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!caseData) {
    return <PageLayout><LoadingScreen label={t.investigate.loading} /></PageLayout>;
  }

  const tabs = [
    { id: 'evidence' as const, label: t.investigate.tabs.evidence, icon: Fingerprint, count: `${discoveredEvidence.length}/${caseData.evidence.length}` },
    { id: 'suspects' as const, label: t.investigate.tabs.suspects, icon: Users, count: String(caseData.suspects.length) },
    { id: 'timeline' as const, label: t.investigate.tabs.timeline, icon: Clock, count: String(caseData.timeline.length) },
  ];

  return (
    <PageLayout>
      <BackButton to={`/case/${id}`} label={t.common.backCase} />

      <div className="mt-6 mb-6">
        <p className="hud-label mb-2">{t.hud.evidenceBoard}</p>
        <h1 className="text-2xl md:text-3xl font-black hud-title">{caseData.title}</h1>
      </div>

      {caseData.sceneImageUrl && (
        <SceneFrame src={caseData.sceneImageUrl} alt={t.investigate.sceneAlt} subtitle={t.hud.crimeScene} label={caseData.setting} maxHeight="max-h-48" />
      )}

      <div className="mb-8">
        <HudTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'evidence' && (
          <motion.div key="evidence" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-3">
            {caseData.evidence.map((evidence, i) => {
              const discovered = discoveredEvidence.includes(evidence.id);
              return (
                <motion.div key={evidence.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <HudPanel
                    scan={discovered}
                    className={`transition-all duration-300 ${discovered ? 'hud-evidence-found' : 'hud-evidence-locked'}`}
                  >
                    <div className="p-4 flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className={`neo-icon-box !w-9 !h-9 shrink-0 ${discovered ? '' : 'opacity-40'}`}>
                            {discovered ? <Unlock className="w-4 h-4 text-accent-gold" /> : <Lock className="w-4 h-4 text-slate-600" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-mono text-sm font-semibold text-white">{evidence.name}</h3>
                              {discovered && <span className="hud-badge !text-[9px] !py-0.5 text-accent-gold border-accent-gold/30">{t.investigate.discovered}</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                              <MapPin className="w-3 h-3" />{evidence.location}
                            </p>
                            {discovered && <p className="text-sm text-slate-400 mt-3 leading-relaxed">{evidence.description}</p>}
                          </div>
                        </div>
                        {!discovered && (
                          <HudButton variant="danger" onClick={() => handleDiscoverEvidence(evidence.id)} className="shrink-0 !text-xs">
                            <Search className="w-3.5 h-3.5" /> {t.investigate.investigateBtn}
                          </HudButton>
                        )}
                    </div>
                  </HudPanel>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'suspects' && (
          <motion.div key="suspects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-3">
            {caseData.suspects.map((suspect, index) => (
              <HudPanel key={suspect.id} hover className="p-4">
                <div className="flex gap-4 items-center">
                  <CharacterPortrait name={suspect.name} imageUrl={suspect.imageUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-white text-sm">{suspect.name}</p>
                    <p className="text-[11px] text-slate-500">{suspect.occupation}</p>
                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">{suspect.personality}</p>
                    <HudButton variant="ghost" onClick={() => handleInterrogate(getSuspectId(suspect, index))} className="!text-[11px] !py-1.5 !px-3 mt-3">
                      <MessageSquare className="w-3.5 h-3.5" /> {t.investigate.interrogateBtn}
                    </HudButton>
                  </div>
                </div>
              </HudPanel>
            ))}
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {caseData.timeline.map((event, i) => (
              <HudPanel key={i} className="p-4">
                <div className="flex gap-4 items-start">
                  <span className="font-mono text-xs text-cyan-400 font-bold shrink-0 w-16 pt-0.5">{event.time}</span>
                  <div className="border-l border-cyan-500/15 pl-4 flex-1">
                    <p className="text-sm text-white/90">{event.event}</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-mono">{event.location}</p>
                  </div>
                </div>
              </HudPanel>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <HudPanel solid scan className="p-6 md:p-8 mt-12">
        <p className="hud-label mb-2">{t.hud.deduction}</p>
        <h2 className="font-bold text-white flex items-center gap-2 mb-1">
          <Send className="w-4 h-4 text-cyan-400" /> {t.investigate.submitTitle}
        </h2>
        <p className="text-xs text-slate-500 mb-4 font-mono">{t.investigate.submitHint}</p>
        <HudTextarea value={deduction} onChange={(e) => setDeduction(e.target.value)} rows={5} placeholder={t.investigate.submitPlaceholder} />
        <HudButton onClick={handleSubmitDeduction} disabled={isSubmitting} className="mt-4">
          {isSubmitting ? t.investigate.submitting : t.investigate.submitBtn}
        </HudButton>
      </HudPanel>
    </PageLayout>
  );
}
