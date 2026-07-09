import { create } from 'zustand';
import type { CaseData, CaseEvaluation, GameProgress, InterrogationMessage, Suspect } from '@/types';
import { resolveAssetUrl } from '@/utils/asset-url';
import { useAuthStore } from '@/hooks/useAuthStore';
import { syncSession } from '@/services/case';

interface CaseState {
  currentCase: CaseData | null;
  evaluation: CaseEvaluation | null;
  setCurrentCase: (caseData: CaseData | null) => void;
  setEvaluation: (evaluation: CaseEvaluation | null) => void;
}

export const useCaseStore = create<CaseState>((set) => ({
  currentCase: null,
  evaluation: null,
  setCurrentCase: (currentCase) => set({ currentCase }),
  setEvaluation: (evaluation) => set({ evaluation }),
}));

const STORAGE_PREFIX = 'detective-case:';
const PROGRESS_PREFIX = 'detective-progress:';
const INTERROGATION_PREFIX = 'detective-interrogate:';
const EVALUATION_PREFIX = 'detective-evaluation:';

const sessionSyncTimers = new Map<string, ReturnType<typeof setTimeout>>();

function canSyncSessionToServer(): boolean {
  const { authMode, token } = useAuthStore.getState();
  return authMode === 'cloudbase' && !!token;
}

function collectSessionMessages(caseId: string) {
  const messages: Array<{
    suspectId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }> = [];
  const prefix = `${INTERROGATION_PREFIX}${caseId}:`;
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(prefix)) continue;
    const suspectId = key.slice(prefix.length);
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const turns = JSON.parse(raw) as InterrogationMessage[];
      for (const turn of turns) {
        if (!turn.content?.trim()) continue;
        messages.push({
          suspectId,
          role: turn.role,
          content: turn.content,
          timestamp: turn.timestamp ?? Date.now(),
        });
      }
    } catch {
      // ignore malformed cache
    }
  }
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

function scheduleSessionSync(caseId: string, delayMs = 800) {
  if (!canSyncSessionToServer()) return;
  const existing = sessionSyncTimers.get(caseId);
  if (existing) clearTimeout(existing);
  sessionSyncTimers.set(
    caseId,
    setTimeout(() => {
      sessionSyncTimers.delete(caseId);
      void flushSessionSync(caseId);
    }, delayMs),
  );
}

export async function flushSessionSync(caseId: string) {
  if (!canSyncSessionToServer()) return;
  const progress = getProgress(caseId);
  if (!progress) return;
  try {
    await syncSession({
      caseId,
      progress: {
        discoveredEvidence: progress.discoveredEvidence,
        interrogatedSuspects: progress.interrogatedSuspects,
        notes: progress.notes,
        startTime: progress.startTime,
        endTime: progress.endTime,
        score: progress.score,
        flowStep: progress.flowStep,
      },
      messages: collectSessionMessages(caseId),
    });
  } catch (error) {
    console.warn('[case-store] session sync failed:', (error as Error).message);
  }
}

function normalizeSuspectId(id: unknown, index: number): string {
  if (id === undefined || id === null || id === '') return `s${index + 1}`;
  const str = String(id).trim();
  if (/^s\d+$/i.test(str)) return str.toLowerCase();
  if (/^\d+$/.test(str)) return `s${str}`;
  return str;
}

export function normalizeCaseData(caseData: CaseData): CaseData {
  const suspects = caseData.suspects.map((s, i) => ({
    ...s,
    id: normalizeSuspectId(s.id, i),
    imageUrl: resolveAssetUrl(s.imageUrl),
  }));
  const evidence = caseData.evidence.map((e, i) => ({
    ...e,
    id: e.id !== undefined && e.id !== null && String(e.id) !== '' ? String(e.id) : `e${i + 1}`,
    imageUrl: resolveAssetUrl(e.imageUrl),
    relatedSuspects: Array.isArray(e.relatedSuspects)
      ? e.relatedSuspects.map((ref) => {
          const str = String(ref).trim();
          const idx = suspects.findIndex((s, si) => normalizeSuspectId(s.id, si) === str || String(s.id) === str);
          if (idx >= 0) return normalizeSuspectId(suspects[idx].id, idx);
          if (/^\d+$/.test(str)) return `s${str}`;
          return str;
        })
      : [],
  }));
  return {
    ...caseData,
    sceneImageUrl: resolveAssetUrl(caseData.sceneImageUrl),
    victim: {
      ...caseData.victim,
      imageUrl: resolveAssetUrl(caseData.victim.imageUrl),
    },
    suspects,
    evidence,
  };
}

export async function saveCaseData(caseData: CaseData) {
  const normalized = normalizeCaseData(caseData);
  localStorage.setItem(`${STORAGE_PREFIX}${normalized.id}`, JSON.stringify(normalized));
  useCaseStore.getState().setCurrentCase(normalized);
}

export async function loadCaseData(caseId: string): Promise<CaseData | null> {
  const cached = localStorage.getItem(`${STORAGE_PREFIX}${caseId}`);
  if (cached) {
    const parsed = normalizeCaseData(JSON.parse(cached) as CaseData);
    useCaseStore.getState().setCurrentCase(parsed);
    return parsed;
  }
  return null;
}

export function saveProgress(progress: GameProgress) {
  localStorage.setItem(`${PROGRESS_PREFIX}${progress.caseId}`, JSON.stringify(progress));
  scheduleSessionSync(progress.caseId);
}

export function getProgress(caseId: string): GameProgress | null {
  const raw = localStorage.getItem(`${PROGRESS_PREFIX}${caseId}`);
  return raw ? (JSON.parse(raw) as GameProgress) : null;
}

export function saveInterrogation(caseId: string, suspectId: string, messages: InterrogationMessage[]) {
  localStorage.setItem(`${INTERROGATION_PREFIX}${caseId}:${suspectId}`, JSON.stringify(messages));
  scheduleSessionSync(caseId);
}

export function getInterrogation(caseId: string, suspectId: string) {
  const raw = localStorage.getItem(`${INTERROGATION_PREFIX}${caseId}:${suspectId}`);
  return raw ? (JSON.parse(raw) as import('@/types').InterrogationMessage[]) : [];
}

export function getSuspectId(suspect: { id?: string | number; name: string }, index: number): string {
  return normalizeSuspectId(suspect.id, index);
}

export function findSuspectByParam(suspects: Suspect[], param: string): Suspect | null {
  const decoded = decodeURIComponent(param).trim();
  return (
    suspects.find((s, i) => {
      const sid = normalizeSuspectId(s.id, i);
      return sid === decoded || String(s.id) === decoded || s.name === decoded;
    }) ?? null
  );
}

export function scrollWindowToTop() {
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function saveEvaluation(caseId: string, evaluation: CaseEvaluation) {
  localStorage.setItem(`${EVALUATION_PREFIX}${caseId}`, JSON.stringify(evaluation));
  useCaseStore.getState().setEvaluation(evaluation);
}

export function loadEvaluation(caseId: string): CaseEvaluation | null {
  const raw = localStorage.getItem(`${EVALUATION_PREFIX}${caseId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CaseEvaluation;
    useCaseStore.getState().setEvaluation(parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function resetCaseProgress(caseId: string) {
  localStorage.removeItem(`${PROGRESS_PREFIX}${caseId}`);
  localStorage.removeItem(`${EVALUATION_PREFIX}${caseId}`);
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(`${INTERROGATION_PREFIX}${caseId}:`)) {
      localStorage.removeItem(key);
    }
  }
}
