import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Clock, Trophy, Target, Flame, Skull, ChevronRight, Crosshair, Scan } from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { createCase } from '@/services/case';
import { saveCaseData, scrollWindowToTop } from '@/utils/case-store';
import { t } from '@/i18n/zh';

const DIFF_ICONS = [Target, Scan, Flame, Skull] as const;
const FEATURE_ICONS = [Brain, Clock, Trophy] as const;

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');

  const handleStartCase = async () => {
    setIsGenerating(true);
    setGeneratingStatus(t.home.matching);
    try {
      const data = await createCase(selectedDifficulty);
      if ('caseData' in data && data.source === 'inventory') {
        setGeneratingStatus(t.home.ready);
        await saveCaseData(data.caseData);
        scrollWindowToTop();
        navigate(`/case/${data.caseId}`);
        return;
      }
      if ('jobId' in data) {
        setGeneratingStatus(t.home.generating);
        scrollWindowToTop();
        navigate(`/generating/${data.jobId}?difficulty=${encodeURIComponent(selectedDifficulty)}`);
      }
    } catch (error) {
      alert(`${t.home.genFail}${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
    }
  };

  return (
    <PageLayout maxWidth="max-w-6xl" py="py-10 md:py-16">
      {/* Hero — FBI archive entry */}
      <section className="relative mb-14 md:mb-20 grid lg:grid-cols-[1fr_auto] gap-10 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="hud-badge mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-hud-pulse" />
            {t.home.tag}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black hud-title leading-[1.08] mb-5">
            {t.home.titleBefore}
            <span className="hud-title-red">{t.home.titleAccent}</span>
          </h1>

          <div className="hud-divider max-w-md mb-6" />
          <p className="text-base text-slate-400 leading-relaxed max-w-lg">{t.home.subtitle}</p>
          <p className="hud-meta mt-4">{t.home.estTime}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="hidden lg:flex justify-center"
        >
          <div className="relative w-44 h-44 animate-float-subtle">
            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl" />
            <HudPanel scan className="w-full h-full flex items-center justify-center">
              <Crosshair className="w-16 h-16 text-cyan-400/80" strokeWidth={1} />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-1 bg-red-600/80" />
            </HudPanel>
          </div>
        </motion.div>
      </section>

      {/* Modules */}
      <div className="grid md:grid-cols-3 gap-4 mb-14">
        {t.home.features.map((f, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <HudPanel hover scan className="p-5 h-full">
                <p className="hud-label mb-3">{t.hud.module} 0{i + 1}</p>
                <div className="neo-icon-box mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </HudPanel>
            </motion.div>
          );
        })}
      </div>

      {/* Difficulty + CTA */}
      <HudPanel solid scan className="p-6 md:p-8">
        <p className="hud-label mb-1">{t.hud.difficulty}</p>
        <h2 className="text-lg font-bold text-white mb-1">{t.home.selectDifficulty}</h2>
        <p className="text-sm text-slate-500 mb-8">{t.home.difficultyHint}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {t.home.difficulties.map((d, i) => {
            const selected = selectedDifficulty === d.id;
            const Icon = DIFF_ICONS[i];
            return (
              <motion.button
                key={d.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`hud-diff ${selected ? 'hud-diff-active' : ''}`}
              >
                {selected && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 animate-hud-pulse" />}
                <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-cyan-400' : 'text-slate-600'}`} />
                <div className="font-bold text-white font-mono text-sm">{d.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{d.desc}</div>
              </motion.button>
            );
          })}
        </div>

        <HudButton onClick={handleStartCase} disabled={isGenerating} className="w-full sm:w-auto min-w-[220px]">
          {isGenerating ? (
            <>
              <div className="hud-loader !w-4 !h-4" />
              <span className="font-mono text-xs">{generatingStatus}</span>
            </>
          ) : (
            <>
              <span>{t.home.start}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </HudButton>
      </HudPanel>
    </PageLayout>
  );
}
