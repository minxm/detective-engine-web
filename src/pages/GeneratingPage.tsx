import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Image, Search, Check, Cpu, Radio } from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import DataStreamBar from '@/components/hud/DataStreamBar';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { fetchCaseStatus } from '@/services/case';
import { saveCaseData, scrollWindowToTop } from '@/utils/case-store';
import { t } from '@/i18n/zh';

const STEP_ICONS = [Search, Brain, Image] as const;
const STEP_PROGRESS = [15, 55, 90];

const AI_MESSAGES: Record<string, string[]> = {
  pending: ['QUERYING CASE DATABASE…', 'INITIALIZING AI ENGINE…', 'ALLOCATING RESOURCES…'],
  generating: ['AI CONSTRUCTING CASE NARRATIVE…', 'BUILDING SUSPECT PROFILES…', 'GENERATING EVIDENCE MATRIX…'],
  images: ['RENDERING CRIME SCENE…', 'GENERATING SUSPECT PORTRAITS…', 'PROCESSING VISUAL DATA…'],
};

export default function GeneratingPage() {
  const { jobId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState('pending');
  const [msgIdx, setMsgIdx] = useState(0);
  const difficulty = searchParams.get('difficulty') ?? 'medium';

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await fetchCaseStatus(jobId);
        if (cancelled) return;
        setStage(data.stage);
        if (data.status === 'ready' && data.caseData) {
          await saveCaseData(data.caseData);
          scrollWindowToTop();
          navigate(`/case/${data.caseId ?? data.caseData.id}`);
        } else if (data.status === 'failed') {
          alert(data.error || t.generating.fail);
          navigate('/');
        }
      } catch {
        if (!cancelled) setTimeout(poll, 2000);
      }
    };
    poll();
    const timer = setInterval(poll, 2500);
    return () => { cancelled = true; clearInterval(timer); };
  }, [jobId, navigate]);

  /* Cycle AI messages */
  useEffect(() => {
    const msgs = AI_MESSAGES[stage] ?? AI_MESSAGES['pending']!;
    setMsgIdx(0);
    const id = setInterval(() => setMsgIdx((n) => (n + 1) % msgs.length), 1200);
    return () => clearInterval(id);
  }, [stage]);

  const activeStep = stage === 'generating' ? 1 : stage === 'images' ? 2 : 0;
  const progress = STEP_PROGRESS[activeStep] ?? 5;
  const currentMsgs = AI_MESSAGES[stage] ?? AI_MESSAGES['pending']!;
  const currentMsg = currentMsgs[msgIdx % currentMsgs.length] ?? '';

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
