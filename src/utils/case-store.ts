import { create } from 'zustand';
import type { CaseData, CaseEvaluation, GameProgress, Suspect } from '@/types';
import { resolveAssetUrl } from '@/utils/asset-url';

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
}

export function getProgress(caseId: string): GameProgress | null {
  const raw = localStorage.getItem(`${PROGRESS_PREFIX}${caseId}`);
  return raw ? (JSON.parse(raw) as GameProgress) : null;
}

export function saveInterrogation(caseId: string, suspectId: string, messages: import('@/types').InterrogationMessage[]) {
  localStorage.setItem(`${INTERROGATION_PREFIX}${caseId}:${suspectId}`, JSON.stringify(messages));
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
