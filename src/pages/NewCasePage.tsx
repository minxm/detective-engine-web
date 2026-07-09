import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  Scan,
  Flame,
  Skull,
  ChevronRight,
  Zap,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import PageLayout from '@/components/ui/PageLayout';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import P5Title from '@/components/hud/P5Title';
import BackButton from '@/components/BackButton';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import GenerationTimeNotice from '@/components/archive/GenerationTimeNotice';
import { createCase } from '@/services/case';
import { navigateToGenerating } from '@/utils/navigate-generating';
import { t } from '@/i18n/zh';

const DIFF_ICONS = [Target, Scan, Flame, Skull] as const;

const DIFFICULTY_THREAT: Record<string, string> = {
  easy: '低',
  medium: '中',
  hard: '高',
  expert: '极危',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'rgba(74,222,128,0.7)',
  medium: 'rgba(0,245,255,0.7)',
  hard: 'rgba(212,168,83,0.7)',
  expert: 'rgba(229,9,20,0.85)',
};

const AI_STEPS = [
  { step: '01', label: 'AI 编织案件', desc: '独家生成剧情、人物关系与动机链' },
  { step: '02', label: '生成人物画像', desc: '受害者及嫌疑人 AI 插画，提升沉浸感' },
  { step: '03', label: '布置证据线索', desc: '隐藏线索与误导项随机分布' },
];

export default function NewCasePage() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');

  const handleStartCase = async () => {
    setIsGenerating(true);
    setGeneratingStatus(t.home.matching);
    try {
      const data = await createCase(selectedDifficulty);
      navigateToGenerating(navigate, selectedDifficulty, data);
    } catch (error) {
      alert(`${t.home.genFail}${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
    }
  };

  const selected = t.home.difficulties.find((d) => d.id === selectedDifficulty);

  return (
    <RoomAtmosphere room="archive">
      <PageLayout maxWidth="max-w-5xl">
        <BackButton to="/lobby" label={t.flow.lobby} />

        {/* ── 两列布局：左侧信息 / 右侧操作（移动单列） ── */}
        <div className="mt-8 lg:grid lg:grid-cols-[1fr_420px] lg:gap-10 lg:items-start">

          {/* ══ 左列：标题 + 说明 + 系统流程 ══ */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <p className="hud-label mb-2">行动指令 · 任务分配</p>
              <P5Title>
                开始
                <span className="p5-title-red ml-2">任务</span>
              </P5Title>
              <p className="font-mono text-xs text-spec-gray/45 mt-3 tracking-wide leading-relaxed max-w-lg">
                AI 将根据所选难度生成全新独家案件，包含完整卷宗、人物画像与证据链。每一宗案件均为唯一生成，不会重复。
              </p>
            </motion.div>

            {/* 威胁等级指示 */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 mb-6 p-3"
              style={{
                background: 'rgba(11,15,20,0.7)',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.1)',
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-spec-cyan/50 shrink-0" />
              <span className="font-mono text-[9px] text-spec-gray/40 tracking-wider">当前任务威胁等级</span>
              <span
                className="font-mono text-sm font-bold ml-auto"
                style={{ color: DIFFICULTY_COLOR[selectedDifficulty] ?? '#00F5FF' }}
              >
                {DIFFICULTY_THREAT[selectedDifficulty] ?? '中'}
              </span>
            </motion.div>

            {/* AI 系统说明 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-3.5 h-3.5 text-spec-gray/30" />
                <p className="hud-label mb-0">AI 生成流程</p>
              </div>
              <div className="space-y-2">
                {AI_STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-center gap-4 p-3"
                    style={{
                      background: 'rgba(11,15,20,0.5)',
                      boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.06)',
                    }}
                  >
                    <span
                      className="font-mono text-[9px] font-bold shrink-0 tabular-nums"
                      style={{ color: 'rgba(0,245,255,0.4)' }}
                    >
                      {item.step}
                    </span>
                    <div>
                      <p className="font-mono text-xs text-white/70">{item.label}</p>
                      <p className="font-mono text-[9px] text-spec-gray/35 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ══ 右列：难度选择 + 启动 ══ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-8 lg:mt-0"
          >
            <HudPanel solid scan className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-spec-red/70" />
                <p className="hud-label !text-spec-red/70 mb-0">任务难度</p>
              </div>
              <p className="font-mono text-[10px] text-spec-gray/40 mb-5 tracking-wide">
                {t.home.difficultyHint}
              </p>

              {/* 难度按钮 — 移动端 2 列 / PC 端 2 列（面板更高而非更宽） */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {t.home.difficulties.map((d, i) => {
                  const isSelected = selectedDifficulty === d.id;
                  const Icon = DIFF_ICONS[i];
                  return (
                    <motion.button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={`hud-diff ${isSelected ? 'hud-diff-active' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-spec-cyan' : 'text-spec-gray/40'}`} />
                      <div className="font-mono font-bold text-white text-sm">{d.name}</div>
                      <div className="text-[10px] text-spec-gray/60 font-archive">{d.desc}</div>
                    </motion.button>
                  );
                })}
              </div>

              {/* 当前选择摘要 */}
              {selected && (
                <motion.div
                  key={selectedDifficulty}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 mb-5"
                  style={{
                    background: 'rgba(0,245,255,0.04)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.12)',
                    clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                  }}
                >
                  <div className="w-1 h-8 bg-spec-cyan/40 shrink-0" />
                  <div>
                    <p className="font-mono text-xs text-spec-cyan/70 font-bold">{selected.name} 难度</p>
                    <p className="font-mono text-[9px] text-spec-gray/45 mt-0.5">
                      {selected.desc} · AI 将生成对应复杂度案件
                    </p>
                  </div>
                </motion.div>
              )}

              <HudButton onClick={handleStartCase} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <div className="hud-loader !w-4 !h-4" />
                    <span className="font-mono text-xs">{generatingStatus}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {t.flow.newCase} <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </HudButton>

              <GenerationTimeNotice />
            </HudPanel>
          </motion.div>
        </div>
      </PageLayout>
    </RoomAtmosphere>
  );
}
