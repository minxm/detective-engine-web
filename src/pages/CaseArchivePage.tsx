import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Archive,
  CheckCircle2,
  Crosshair,
  FileText,
  Fingerprint,
  MapPin,
  RotateCcw,
  Skull,
  Target,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import PageLayout from '@/components/ui/PageLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import RoomAtmosphere from '@/components/rooms/RoomAtmosphere';
import { fetchHistoryItem } from '@/services/history';
import {
  getProgress,
  loadEvaluation,
  resetCaseProgress,
  scrollWindowToTop,
} from '@/utils/case-store';
import { resolveCaseData } from '@/utils/resolve-case-data';
import { resolveAssetUrl } from '@/utils/asset-url';
import { t } from '@/i18n/zh';
import type { CaseData, CaseEvaluation, Evidence, HistoryEntry, Suspect } from '@/types';

const DIFF_STARS: Record<string, string> = {
  easy: '★★☆☆☆',
  medium: '★★★☆☆',
  hard: '★★★★☆',
  expert: '★★★★★',
};

function truncateSentences(text: string, max = 3): string {
  const parts = text.split(/[。！？\n]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return text.slice(0, 120);
  const joined = parts.slice(0, max).join('。');
  return joined.endsWith('。') ? joined : `${joined}。`;
}

function buildArchiveSummary(evaluation: CaseEvaluation | null, killerCorrect: boolean | null): string {
  if (evaluation?.feedback) {
    const text = evaluation.feedback.replace(/\s+/g, '');
    return text.length <= 100 ? text : `${text.slice(0, 97)}…`;
  }
  const ok = killerCorrect ?? evaluation?.killerCorrect;
  if (ok === true) {
    return '调查员，本案件已正式归档。你成功找出真正凶手。推理逻辑较为完整，请继续保持敏锐直觉。';
  }
  if (ok === false) {
    return '调查员，本案件已正式归档。真凶判断存在偏差。建议重新梳理关键证据与动机链条，继续努力。';
  }
  return '调查员，本案件已正式归档。卷宗已封存，可随时调取复盘本次调查记录。';
}

function extractPlayerKiller(notes: string, suspects: Suspect[]): string {
  const killerLine = notes.match(/(?:凶手|真凶|作案人)[是为：:]\s*([^\n。，,]+)/);
  if (killerLine) {
    const fragment = killerLine[1].trim();
    const match = suspects.find((s) => fragment.includes(s.name) || s.name.includes(fragment));
    return match?.name ?? fragment.slice(0, 24);
  }
  for (const s of suspects) {
    if (notes.includes(s.name)) return s.name;
  }
  return t.caseArchive.playerUnknown;
}

function extractPlayerMotive(notes: string): string {
  const motiveLine = notes.match(/动机[：:]\s*([^\n]+)/);
  if (motiveLine) return motiveLine[1].trim().slice(0, 120);
  const line = notes.split(/\n/).find((l) => l.includes('动机'));
  if (line) return line.replace(/.*动机[：:]?\s*/, '').trim().slice(0, 120);
  return t.caseArchive.playerMotiveFallback;
}

function isKeyClueEvidence(ev: Evidence, keyClues: string[]): boolean {
  return keyClues.some(
    (c) => c.includes(ev.name) || ev.name.includes(c) || ev.significance.includes(c) || ev.description.includes(c),
  );
}

function getKeyEvidence(caseData: CaseData): Evidence[] {
  const clues = caseData.truth.keyClues;
  const matched = caseData.evidence.filter((e) =>
    clues.some((c) => c.includes(e.name) || e.name.includes(c) || e.significance.includes(c)),
  );
  const pool = matched.length > 0 ? matched : caseData.evidence;
  return pool.slice(0, Math.min(6, pool.length));
}

function EvidenceDossierItem({
  ev,
  index,
  isKey,
  delay,
}: {
  ev: Evidence;
  index: number;
  isKey: boolean;
  delay: number;
}) {
  const imageUrl = resolveAssetUrl(ev.imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <HudPanel className="dossier-evidence-row">
        <div className="p-4 flex gap-4 items-start">
          <span className="dossier-evidence-index">{String(index + 1).padStart(2, '0')}</span>
          <div className="flex-1 min-w-0">
            <div className="dossier-evidence-head">
              <h3 className="dossier-evidence-name">{ev.name}</h3>
              {ev.location && (
                <span className="dossier-evidence-loc">
                  <MapPin className="w-3 h-3" />
                  {ev.location}
                </span>
              )}
              {isKey && <span className="dossier-evidence-key-badge">{t.caseArchive.evidenceKeyBadge}</span>}
            </div>
            {ev.significance && (
              <div className="dossier-evidence-significance">
                <span className="dossier-evidence-significance-label">{t.caseArchive.evidenceSignificance}</span>
                {ev.significance}
              </div>
            )}
            {ev.description && (
              <p className="dossier-evidence-desc">{ev.description}</p>
            )}
            {ev.relatedSuspects.length > 0 && (
              <div className="dossier-evidence-related">
                <Users className="w-3 h-3 text-spec-gray/40 shrink-0" />
                <span className="dossier-evidence-related-label">{t.caseArchive.evidenceRelated}</span>
                {ev.relatedSuspects.map((name) => (
                  <span key={name} className="dossier-evidence-related-tag">{name}</span>
                ))}
              </div>
            )}
          </div>
          {imageUrl && (
            <img src={imageUrl} alt={ev.name} className="dossier-evidence-inline-img" />
          )}
        </div>
      </HudPanel>
    </motion.div>
  );
}

function formatDate(ts: number | string | undefined): string {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text, started]);

  return (
    <p className="dossier-summary-text">
      {displayed}
      {displayed.length < text.length && <span className="boot-cursor ml-0.5" />}
    </p>
  );
}

function TruthCard({
  icon: Icon,
  label,
  content,
  accent,
  delay,
}: {
  icon: typeof Target;
  label: string;
  content: string;
  accent: 'red' | 'cyan' | 'gold' | 'gray';
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={`dossier-truth-card dossier-truth-${accent}`}
    >
      <div className="dossier-truth-icon">
        <Icon className="w-4 h-4" />
      </div>
      <p className="dossier-truth-label">{label}</p>
      <p className="dossier-truth-content">{content}</p>
    </motion.div>
  );
}

export default function CaseArchivePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [evaluation, setEvaluation] = useState<CaseEvaluation | null>(null);
  const [historyEntry, setHistoryEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrollWindowToTop();
    let cancelled = false;
    (async () => {
      const data = await resolveCaseData(id);
      const evalData = loadEvaluation(id);
      let entry: HistoryEntry | null = null;
      try {
        const history = await fetchHistoryItem(id);
        entry = history.entry;
      } catch {
        entry = null;
      }
      if (cancelled) return;
      setCaseData(data);
      setEvaluation(evalData);
      setHistoryEntry(entry);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <RoomAtmosphere room="archive">
        <PageLayout><LoadingScreen label={t.caseArchive.loading} /></PageLayout>
      </RoomAtmosphere>
    );
  }

  if (!caseData) {
    return (
      <RoomAtmosphere room="archive">
        <PageLayout maxWidth="max-w-md">
          <HudPanel solid className="p-10 text-center">
            <p className="font-mono text-spec-gray/60 text-sm mb-6">{t.case.notFound}</p>
            <HudButton onClick={() => navigate('/archive')}>{t.flow.backArchive}</HudButton>
          </HudPanel>
        </PageLayout>
      </RoomAtmosphere>
    );
  }

  const progress = getProgress(id);
  const playerNotes = evaluation?.userDeduction ?? progress?.notes ?? '';
  const killerCorrect = evaluation?.killerCorrect ?? historyEntry?.killerCorrect ?? null;
  const score = evaluation?.score ?? historyEntry?.score ?? progress?.score ?? null;
  const completedAt = progress?.endTime ?? historyEntry?.createdAt;
  const caseNum = caseData.id.slice(-6).toUpperCase();
  const diffName = t.home.difficulties.find((d) => d.id === caseData.difficulty)?.name ?? caseData.difficulty;
  const coverImage = resolveAssetUrl(caseData.sceneImageUrl);
  const playerKiller = extractPlayerKiller(playerNotes, caseData.suspects);
  const playerMotive = extractPlayerMotive(playerNotes);
  const killerWrong = killerCorrect === false || (
    killerCorrect !== true && playerKiller !== t.caseArchive.playerUnknown && playerKiller !== caseData.truth.killer
  );
  const summary = buildArchiveSummary(evaluation, killerCorrect);
  const keyEvidence = getKeyEvidence(caseData);

  const handleRetry = () => {
    resetCaseProgress(id);
    navigate(`/case/${id}`);
  };

  return (
    <RoomAtmosphere room="archive">
      <PageLayout maxWidth="max-w-4xl">
        <BackButton to="/archive" label={t.flow.backArchive} />

        {/* ① 顶部案件封面 */}
        <motion.section
          className="dossier-cover mt-8 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="dossier-cover-grid">
            <div className="dossier-cover-visual">
              {coverImage ? (
                <img src={coverImage} alt={caseData.title} className="dossier-cover-img" />
              ) : (
                <div className="dossier-cover-placeholder">
                  <Crosshair className="w-10 h-10 text-spec-cyan/30" />
                </div>
              )}
              <div className="dossier-cover-stamp">{t.caseArchive.archived}</div>
            </div>

            <div className="dossier-cover-meta">
              <p className="hud-label mb-2">{t.caseArchive.fileLabel}</p>
              <p className="dossier-case-num">#{caseNum}</p>
              <h1 className="dossier-case-title">{caseData.title}</h1>

              <div className="dossier-cover-tags">
                <span className="dossier-status-closed">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.history.statusCompleted}
                </span>
                {score != null && (
                  <span className="dossier-score-badge">
                    {score}
                    <span className="text-[10px] font-normal opacity-70">{t.history.scoreUnit}</span>
                  </span>
                )}
              </div>

              <div className="dossier-cover-stats">
                <div>
                  <p className="dossier-stat-label">{t.caseArchive.completedAt}</p>
                  <p className="dossier-stat-value">{formatDate(completedAt)}</p>
                </div>
                <div>
                  <p className="dossier-stat-label">{t.caseArchive.difficulty}</p>
                  <p className="dossier-stat-value">
                    {diffName}
                    <span className="text-spec-cyan/50 text-[10px] ml-1.5">{DIFF_STARS[caseData.difficulty]}</span>
                  </p>
                </div>
                {evaluation?.rating && (
                  <div>
                    <p className="dossier-stat-label">{t.caseArchive.rating}</p>
                    <p className="dossier-stat-value text-spec-cyan">{evaluation.rating}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ② AI 结案总结 */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <HudPanel scan className="p-6 dossier-summary-panel">
            <div className="flex items-center gap-2 mb-4">
              <Archive className="w-4 h-4 text-spec-cyan/60" />
              <p className="hud-label mb-0">{t.caseArchive.aiSummary}</p>
            </div>
            <TypewriterText text={summary} delay={400} />
          </HudPanel>
        </motion.section>

        {/* ③ 真相解析 */}
        <section className="mb-8">
          <p className="dossier-section-title">
            <Skull className="w-4 h-4" />
            {t.caseArchive.truthTitle}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <TruthCard
              icon={Target}
              label={t.caseArchive.trueKiller}
              content={truncateSentences(caseData.truth.killer, 2)}
              accent="red"
              delay={0.2}
            />
            <TruthCard
              icon={Zap}
              label={t.caseArchive.trueMotive}
              content={truncateSentences(caseData.truth.motive, 3)}
              accent="gold"
              delay={0.28}
            />
            <TruthCard
              icon={Fingerprint}
              label={t.caseArchive.trueMethod}
              content={truncateSentences(caseData.truth.method, 3)}
              accent="cyan"
              delay={0.36}
            />
            <TruthCard
              icon={FileText}
              label={t.caseArchive.keyClues}
              content={caseData.truth.keyClues.slice(0, 3).join('；')}
              accent="gray"
              delay={0.44}
            />
          </div>
        </section>

        {/* ④ 我的推理结果 */}
        <section className="mb-8">
          <p className="dossier-section-title">
            <Crosshair className="w-4 h-4" />
            {t.caseArchive.playerTitle}
          </p>
          <HudPanel className="p-6">
            <div className="space-y-4">
              <div className={`dossier-player-row ${killerWrong ? 'dossier-player-wrong' : ''}`}>
                <p className="dossier-player-label">{t.caseArchive.playerKiller}</p>
                <div className="flex items-center gap-2">
                  {killerWrong ? (
                    <XCircle className="w-4 h-4 text-spec-red shrink-0" />
                  ) : killerCorrect === true ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : null}
                  <p className="dossier-player-value">{playerKiller}</p>
                </div>
                {killerWrong && (
                  <p className="dossier-player-hint">
                    {t.caseArchive.correctAnswer}：{caseData.truth.killer}
                  </p>
                )}
              </div>

              <div className="dossier-player-row">
                <p className="dossier-player-label">{t.caseArchive.playerMotive}</p>
                <p className="dossier-player-value">{playerMotive}</p>
              </div>

              <div className="dossier-player-row">
                <p className="dossier-player-label">{t.caseArchive.playerDeduction}</p>
                <p className="dossier-player-deduction whitespace-pre-wrap">
                  {playerNotes.trim() || t.caseArchive.noDeduction}
                </p>
              </div>
            </div>
          </HudPanel>
        </section>

        {/* ⑤ 关键证据 */}
        {keyEvidence.length > 0 && (
          <section className="mb-10">
            <p className="dossier-section-title">
              <Fingerprint className="w-4 h-4" />
              {t.caseArchive.evidenceTitle}
            </p>
            <div className="dossier-evidence-list">
              {keyEvidence.map((ev, i) => (
                <EvidenceDossierItem
                  key={ev.id}
                  ev={ev}
                  index={i}
                  isKey={isKeyClueEvidence(ev, caseData.truth.keyClues)}
                  delay={0.1 + i * 0.06}
                />
              ))}
            </div>
          </section>
        )}

        {/* ⑥ 底部操作 */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <HudButton onClick={handleRetry}>
            <RotateCcw className="w-4 h-4" />
            {t.caseArchive.retry}
          </HudButton>
          <HudButton variant="ghost" onClick={() => navigate('/archive')}>
            {t.caseArchive.backArchive}
          </HudButton>
          <HudButton variant="ghost" onClick={() => navigate('/new-case')}>
            {t.caseArchive.newCase}
          </HudButton>
        </motion.div>
      </PageLayout>
    </RoomAtmosphere>
  );
}
