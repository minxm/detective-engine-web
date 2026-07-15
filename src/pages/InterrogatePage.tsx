import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Radio } from 'lucide-react';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { HudInput } from '@/components/hud/HudInput';
import ParticleBackground from '@/components/ParticleBackground';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import InterrogationHud from '@/components/rooms/InterrogationHud';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { fetchCaseById, interrogateSuspect } from '@/services/case';
import {
  findSuspectByParam,
  getInterrogation,
  getProgress,
  getSuspectId,
  loadCaseData,
  normalizeCaseData,
  saveCaseData,
  saveInterrogation,
  saveProgress,
} from '@/utils/case-store';
import { canAccessFlowStep } from '@/utils/case-flow';
import { t } from '@/i18n/zh';
import type { CaseData, InterrogationMessage, Suspect } from '@/types';

export default function InterrogatePage() {
  const { id = '', suspectId = '' } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [suspect, setSuspect] = useState<Suspect | null>(null);
  const [messages, setMessages] = useState<InterrogationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!canAccessFlowStep(id, 'interrogate')) {
      navigate(`/case/${id}/interrogate`, { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      let data = await loadCaseData(id);
      if (!data) {
        try {
          const res = await fetchCaseById(id);
          data = normalizeCaseData(res.caseData);
          if (data) await saveCaseData(data);
        } catch {
          data = null;
        }
      }
      if (cancelled) return;
      if (!data) { setPageError(t.interrogate.noCase); return; }
      if (!suspectId) { navigate(`/case/${id}/interrogate`, { replace: true }); return; }
      const found = findSuspectByParam(data.suspects, suspectId);
      if (!found) { setPageError(t.interrogate.suspectNotFound); return; }
      const index = data.suspects.findIndex((s) => s.id === found.id);
      const normalized = { ...found, id: getSuspectId(found, index >= 0 ? index : 0) };
      setCaseData(data);
      setSuspect(normalized);
      const progress = getProgress(id);
      if (progress && !progress.interrogatedSuspects.includes(normalized.id)) {
        saveProgress({ ...progress, interrogatedSuspects: [...progress.interrogatedSuspects, normalized.id] });
      }
      const saved = getInterrogation(id, normalized.id);
      setMessages(saved.length > 0 ? saved : [{ role: 'assistant', content: t.interrogate.greeting(normalized.name), timestamp: Date.now() }]);
    })();
    return () => { cancelled = true; };
  }, [id, suspectId, navigate]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !suspect || !caseData) return;
    const userMessage: InterrogationMessage = { role: 'user', content: input, timestamp: Date.now() };
    const streamTs = Date.now() + 1;
    const apiMessages = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '', timestamp: streamTs }]);
    setInput('');
    setIsLoading(true);

    try {
      const progress = getProgress(caseData.id);
      const evidenceTexts = caseData.evidence
        .filter((e) => progress?.discoveredEvidence.includes(e.id))
        .map((e) => `${e.name}: ${e.description}`);

      let streaming = '';
      const finalContent = await interrogateSuspect(
        { suspect, messages: apiMessages, evidence: evidenceTexts, caseData },
        (delta) => {
          streaming += delta;
          setMessages((prev) => prev.map((m) => (m.timestamp === streamTs ? { ...m, content: streaming } : m)));
        }
      );

      const nextMessages = [...messages, userMessage, { role: 'assistant' as const, content: finalContent || streaming, timestamp: streamTs }];
      setMessages(nextMessages);
      saveInterrogation(caseData.id, suspect.id, nextMessages);
    } catch (error) {
      const { formatApiError } = await import('@/utils/apiError');
      alert(formatApiError(error, '审问失败，请稍后重试'));
      setMessages((prev) => prev.filter((m) => m.timestamp !== streamTs));
    } finally {
      setIsLoading(false);
    }
  };

  if (pageError) {
    return (
      <div className="flex-1 flex items-center justify-center page-shell">
        <CinematicBackdrop />
        <ParticleBackground />
        <div className="relative z-10 max-w-sm mx-4 w-full">
          <HudPanel solid className="p-10 text-center">
            <p className="mb-6 text-slate-400">{pageError}</p>
            <HudButton onClick={() => navigate(`/case/${id}/interrogate`)}>{t.interrogate.back}</HudButton>
          </HudPanel>
        </div>
      </div>
    );
  }

  if (!caseData || !suspect) {
    return (
      <div className="flex-1 page-shell relative">
        <CinematicBackdrop />
        <ParticleBackground />
        <LoadingScreen label={t.interrogate.loading} />
      </div>
    );
  }

  return (
    <div className="interrogate-chat-page relative page-shell flex flex-col bg-hud-void">
      <CinematicBackdrop />
      <ParticleBackground />

      <div className="interrogate-chat-top shrink-0 relative z-50">
        <header className="relative">
          <div className="absolute inset-0 bg-hud-void/90 backdrop-blur-xl border-b border-cyan-500/10" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="relative w-full px-4 md:px-6 py-3 flex items-center gap-3">
            <HudButton variant="icon" onClick={() => navigate(`/case/${id}/interrogate`)}>
              <ArrowLeft className="w-4 h-4" />
            </HudButton>
            <CharacterPortrait name={suspect.name} imageUrl={suspect.imageUrl} size="sm" glow />
            <div className="flex-1 min-w-0">
              <p className="hud-label !text-[9px] mb-0.5">{t.flow.interrogate}</p>
              <p className="font-mono font-bold text-white text-sm truncate">{suspect.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{suspect.occupation}</p>
            </div>
            <span className="hud-badge hud-badge-red !text-[9px]">
              <Radio className="w-3 h-3 animate-hud-pulse" />
              {t.interrogate.inProgress}
            </span>
          </div>
        </header>

        <InterrogationHud
          suspectName={suspect.name}
          messageCount={messages.filter((m) => m.role === 'user').length}
          isStreaming={isLoading}
        />
      </div>

      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-6 w-full space-y-3">
        {messages.map((msg) => {
          if (!msg.content && msg.role === 'assistant') return null;
          return (
          <motion.div
            key={msg.timestamp}
            initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[88%] ${msg.role === 'user' ? 'hud-chat-user' : 'hud-chat-suspect'}`}>
              {msg.content}
            </div>
          </motion.div>
          );
        })}
        {isLoading && (
          <div className="flex gap-1 px-2">
            {[0, 1, 2].map((d) => (
              <span key={d} className="w-1 h-1 bg-cyan-500/60 animate-bounce" style={{ animationDelay: `${d * 0.12}s` }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="interrogate-chat-footer shrink-0 relative z-50">
        <div className="absolute inset-0 bg-hud-void/95 backdrop-blur-xl border-t border-cyan-500/10" />
        <div className="relative w-full px-4 md:px-6 py-4 flex gap-2">
          <div className="flex-1 min-w-0">
            <HudInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.interrogate.inputPlaceholder}
            />
          </div>
          <HudButton onClick={handleSend} disabled={isLoading || !input.trim()} className="!px-4">
            <Send className="w-4 h-4" />
          </HudButton>
        </div>
      </footer>
    </div>
  );
}
