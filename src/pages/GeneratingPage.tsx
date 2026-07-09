import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Image, Search, Check, Cpu, Radio, AlertTriangle } from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import DataStreamBar from '@/components/hud/DataStreamBar';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { fetchCaseById, fetchCaseStatus } from '@/services/case';
import { loadCaseData, saveCaseData, scrollWindowToTop } from '@/utils/case-store';
import { parseGeneratingError } from '@/utils/generatingError';
import {
  GENERATING_ASSIGN_JOB_ID,
  type InstantGeneratingState,
} from '@/utils/navigate-generating';
import type { CaseData } from '@/types';
import { t } from '@/i18n/zh';

const STEP_ICONS = [Search, Brain, Image] as const;
const MAX_POLL_ERRORS = 5;

const AI_MESSAGES: Record<string, string[]> = {
  pending: ['QUERYING CASE DATABASE…', 'INITIALIZING AI ENGINE…', 'ALLOCATING RESOURCES…'],
  generating: ['AI CONSTRUCTING CASE NARRATIVE…', 'BUILDING SUSPECT PROFILES…', 'GENERATING EVIDENCE MATRIX…'],
  images: ['RENDERING CRIME SCENE…', 'GENERATING SUSPECT PORTRAITS…', 'PROCESSING VISUAL DATA…'],
};

/** 预置卷宗：快速过渡动效（约 1.2s） */
const INVENTORY_TIMELINE = [
  { stage: 'pending', progress: 20, at: 0 },
  { stage: 'generating', progress: 55, at: 350 },
  { stage: 'images', progress: 85, at: 750 },
  { stage: 'ready', progress: 100, at: 1200 },
] as const;

function stageToStep(stage: string): number {
  if (stage === 'images' || stage === 'ready') return 2;
  if (stage === 'generating') return 1;
  return 0;
}

function readInstantState(state: unknown): InstantGeneratingState | null {
  if (!state || typeof state !== 'object') return null;
  const s = state as Partial<InstantGeneratingState>;
  if (s.instant && s.caseId) {
    return { instant: true, caseId: s.caseId, caseData: s.caseData };
  }
  return null;
}

export default function GeneratingPage() {
  const { jobId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState('pending');
  const [progress, setProgress] = useState(5);
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState('');
  const pollErrors = useRef(0);
  const difficulty = searchParams.get('difficulty') ?? 'medium';
  const instantPayload = useMemo(() => readInstantState(location.state), [location.state]);
  const instantCaseId = instantPayload?.caseId ?? null;
  const isInstantFlow = jobId === GENERATING_ASSIGN_JOB_ID && instantCaseId !== null;

  useEffect(() => {
    if (jobId === GENERATING_ASSIGN_JOB_ID && !instantCaseId) {
      navigate('/archive?action=new', { replace: true });
    }
  }, [jobId, instantCaseId, navigate]);

  useEffect(() => {
    if (!isInstantFlow || !instantCaseId) return;

    let cancelled = false;
    const timers: number[] = [];
    setError('');
    setStage('pending');
    setProgress(5);

    const finish = async (caseId: string, caseData: CaseData) => {
      await saveCaseData(caseData);
      scrollWindowToTop();
      navigate(`/case/${caseId}`, { replace: true });
    };

    void (async () => {
      try {
        let caseData = instantPayload?.caseData ?? null;
        if (!caseData) {
          caseData = await loadCaseData(instantCaseId);
        }
        if (!caseData) {
          const res = await fetchCaseById(instantCaseId);
          caseData = res.caseData;
        }
        if (!caseData) {
          setError(t.generating.loadFail);
          return;
        }

        for (const { stage: nextStage, progress: nextProgress, at } of INVENTORY_TIMELINE) {
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              setStage(nextStage);
              setProgress(nextProgress);
              if (nextStage === 'ready') {
                void finish(instantCaseId, caseData!);
              }
            }, at),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(parseGeneratingError(err, t.generating.loadFail));
        }
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isInstantFlow, instantCaseId, instantPayload?.caseData, navigate]);

  useEffect(() => {
    if (isInstantFlow || !jobId || jobId === GENERATING_ASSIGN_JOB_ID) return;

    let cancelled = false;
    pollErrors.current = 0;
    setError('');

    const handleReady = async (caseId?: string, caseData?: CaseData | null) => {
      let data = caseData;
      if (!data && caseId) {
        try {
          const res = await fetchCaseById(caseId);
          data = res.caseData;
        } catch {
          /* fallback below */
        }
      }
      if (!data) {
        setError(t.generating.loadFail);
        return;
      }
      await saveCaseData(data);
      scrollWindowToTop();
      navigate(`/case/${caseId ?? data.id}`);
    };

    const poll = async () => {
      try {
        const data = await fetchCaseStatus(jobId);
        if (cancelled) return;
        pollErrors.current = 0;
        setError('');

        setStage(data.stage);
        if (typeof data.progress === 'number') {
          setProgress((prev) => Math.max(prev, data.progress!));
        }

        if (data.status === 'ready') {
          setProgress(100);
          await handleReady(data.caseId, data.caseData);
        } else if (data.status === 'failed') {
          setError(parseGeneratingError(data.error, t.generating.fail));
        }
      } catch (err) {
        if (cancelled) return;
        pollErrors.current += 1;
        if (pollErrors.current >= MAX_POLL_ERRORS) {
          setError(parseGeneratingError(err, t.generating.statusError));
        }
      }
    };

    poll();
    const timer = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [jobId, isInstantFlow, navigate]);

  /* Cycle AI messages */
  useEffect(() => {
    const msgs = AI_MESSAGES[stage] ?? AI_MESSAGES['pending']!;
    setMsgIdx(0);
    const id = setInterval(() => setMsgIdx((n) => (n + 1) % msgs.length), 1200);
    return () => clearInterval(id);
  }, [stage]);

  /* Smooth progress creep while waiting */
  useEffect(() => {
    if (error) return;
    const id = setInterval(() => {
      setProgress((prev) => {
        const cap = stage === 'pending' ? 12 : stage === 'generating' ? 45 : stage === 'images' ? 88 : 95;
        if (prev >= cap) return prev;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [stage, error]);

  const activeStep = stageToStep(stage);
  const currentMsgs = AI_MESSAGES[stage] ?? AI_MESSAGES['pending']!;
  const currentMsg = currentMsgs[msgIdx % currentMsgs.length] ?? '';

  if (error) {
    return (
      <RoomAtmosphere room="lobby">
        <CinematicBackdrop variant="lobby" />
        <PageLayout maxWidth="max-w-lg" py="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <HudPanel solid className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-400/80" />
              </div>
              <p className="font-mono text-xs text-spec-gray/40 tracking-wider mb-2">{t.generating.failTitle}</p>
              <p className="font-mono text-sm text-red-400/90 mb-6 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hud-btn-primary px-6 py-2.5 font-mono text-xs tracking-wider"
              >
                {t.generating.statusRetry}
              </button>
            </HudPanel>
          </motion.div>
        </PageLayout>
      </RoomAtmosphere>
    );
  }

  return (
    <RoomAtmosphere room="lobby">
      <CinematicBackdrop variant="lobby" />
      <PageLayout maxWidth="max-w-lg" py="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* 顶部标签 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Radio className="w-3.5 h-3.5 text-spec-cyan/50 animate-pulse" />
              <span className="hud-label text-[9px]">AI CASE GENERATION · IN PROGRESS</span>
            </div>
            <div className="p5-title-wrap">
              <h1 className="p5-title text-[clamp(1.5rem,4vw,2.2rem)]">
                CASE
                <span className="p5-title-red ml-2">BUILD</span>
              </h1>
            </div>
            <p className="font-mono text-[10px] text-spec-gray/40 mt-2 tracking-wider">
              难度 · <span className="text-spec-cyan/60">{difficulty.toUpperCase()}</span>
            </p>
          </div>

          <HudPanel solid scan className="p-6 md:p-8">

            {/* AI 核心状态 */}
            <div className="flex items-center gap-4 mb-6 p-4"
              style={{
                background: 'rgba(0,245,255,0.03)',
                boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.08)',
                clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
              }}
            >
              {/* 动态脑波图标 */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 blur-lg bg-spec-cyan/20 animate-pulse-cyan" />
                <div
                  className="relative w-10 h-10 flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                    background: 'rgba(0,245,255,0.08)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.3)',
                  }}
                >
                  <Cpu className="w-5 h-5 text-spec-cyan" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[8px] text-spec-gray/30 tracking-wider mb-1">AI ENGINE STATUS</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${stage}-${msgIdx}`}
                    className="font-mono text-[10px] text-spec-cyan/70 tracking-wider truncate"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentMsg}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0 bg-spec-cyan"
                style={{ animation: 'ping-slow 1.5s ease-in-out infinite', boxShadow: '0 0 6px rgba(0,245,255,0.8)' }}
              />
            </div>

            {/* 进度条 */}
            <DataStreamBar value={progress} label="GENERATION PROGRESS" className="mb-6" />

            {/* 步骤列表 */}
            <div className="space-y-2">
              {t.generating.steps.map((label, i) => {
                const Icon = STEP_ICONS[i];
                const active = i === activeStep;
                const done = i < activeStep;
                return (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3 transition-all duration-300"
                    style={{
                      background: active
                        ? 'rgba(0,245,255,0.05)'
                        : done
                        ? 'rgba(74,222,128,0.03)'
                        : 'rgba(0,0,0,0.2)',
                      clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                      boxShadow: active
                        ? 'inset 0 0 0 1px rgba(0,245,255,0.2)'
                        : done
                        ? 'inset 0 0 0 1px rgba(74,222,128,0.15)'
                        : 'inset 0 0 0 1px rgba(0,245,255,0.04)',
                      opacity: active ? 1 : done ? 0.75 : 0.35,
                    }}
                  >
                    <div
                      className="shrink-0 w-8 h-8 flex items-center justify-center"
                      style={{
                        clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                        background: done
                          ? 'rgba(74,222,128,0.1)'
                          : active
                          ? 'rgba(0,245,255,0.1)'
                          : 'rgba(0,0,0,0.3)',
                        boxShadow: done
                          ? 'inset 0 0 0 1px rgba(74,222,128,0.3)'
                          : active
                          ? 'inset 0 0 0 1px rgba(0,245,255,0.35)'
                          : 'none',
                      }}
                    >
                      {done ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-spec-cyan' : 'text-spec-gray/40'}`} />
                      )}
                    </div>
                    <span
                      className="flex-1 text-xs font-mono tracking-wider"
                      style={{ color: active ? 'rgba(0,245,255,0.8)' : done ? 'rgba(74,222,128,0.6)' : 'rgba(138,143,152,0.5)' }}
                    >
                      {label}
                    </span>
                    {active && (
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((dot) => (
                          <div
                            key={dot}
                            className="w-1 h-1 bg-spec-cyan/60 rounded-full"
                            style={{ animation: `hud-pulse 1s ease-in-out infinite ${dot * 0.2}s` }}
                          />
                        ))}
                      </div>
                    )}
                    {done && (
                      <span className="font-mono text-[8px] text-green-400/60 tracking-wider">DONE</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* 底部提示 */}
            <p className="text-center font-mono text-[8px] text-spec-gray/25 mt-5 tracking-[0.2em]">
              PLEASE WAIT · DO NOT CLOSE THIS PAGE
            </p>
          </HudPanel>
        </motion.div>
      </PageLayout>
    </RoomAtmosphere>
  );
}
