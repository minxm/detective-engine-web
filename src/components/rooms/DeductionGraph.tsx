import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Lock } from 'lucide-react';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import type { CaseData } from '@/types';
import { resolveAssetUrl } from '@/utils/asset-url';
import { t } from '@/i18n/zh';

const VIEW_W = 400;
const VIEW_H = 320;

interface GraphNode {
  id: string;
  label: string;
  type: 'center' | 'evidence' | 'suspect' | 'victim';
  x: number;
  y: number;
  active?: boolean;
  imageUrl?: string;
}

type PeripheralSlot =
  | { kind: 'victim'; id: string; label: string; imageUrl?: string }
  | { kind: 'evidence'; id: string; label: string; imageUrl?: string; active: boolean }
  | { kind: 'suspect'; id: string; label: string; imageUrl?: string };

const RADIUS = {
  evidence: 76,
  victim: 102,
  suspect: 126,
} as const;

/** 受害人置顶，证据与嫌疑人交错排列，再均匀分布到整圈 */
function buildPeripheralSlots(caseData: CaseData, discoveredIds: string[]): PeripheralSlot[] {
  const slots: PeripheralSlot[] = [
    {
      kind: 'victim',
      id: 'victim',
      label: caseData.victim.name,
      imageUrl: resolveAssetUrl(caseData.victim.imageUrl),
    },
  ];

  const evidence = caseData.evidence.map((e) => ({
    kind: 'evidence' as const,
    id: e.id,
    label: e.name,
    imageUrl: resolveAssetUrl(e.imageUrl),
    active: discoveredIds.includes(e.id),
  }));
  const suspects = caseData.suspects.map((s) => ({
    kind: 'suspect' as const,
    id: s.id,
    label: s.name,
    imageUrl: resolveAssetUrl(s.imageUrl),
  }));

  let ei = 0;
  let si = 0;
  while (ei < evidence.length || si < suspects.length) {
    if (ei < evidence.length) slots.push(evidence[ei++]);
    if (si < suspects.length) slots.push(suspects[si++]);
  }

  return slots;
}

function slotToNode(cx: number, cy: number, slot: PeripheralSlot, index: number, total: number): GraphNode {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const r = RADIUS[slot.kind];
  return {
    id: slot.id,
    label: slot.label,
    type: slot.kind,
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
    active: slot.kind === 'evidence' ? slot.active : true,
    imageUrl: slot.imageUrl,
  };
}

export default function DeductionGraph({
  caseData,
  discoveredIds,
}: {
  caseData: CaseData;
  discoveredIds: string[];
}) {
  const { nodes, edges } = useMemo(() => {
    const cx = VIEW_W / 2;
    const cy = VIEW_H / 2;
    const peripheralSlots = buildPeripheralSlots(caseData, discoveredIds);

    const ns: GraphNode[] = [
      { id: 'truth', label: t.deduction.graphCenter, type: 'center', x: cx, y: cy, active: true },
      ...peripheralSlots.map((slot, i) => slotToNode(cx, cy, slot, i, peripheralSlots.length)),
    ];

    const es: { from: string; to: string; active: boolean }[] = [];
    for (const n of ns) {
      if (n.type !== 'center') {
        es.push({ from: n.id, to: 'truth', active: n.active ?? false });
      }
    }
    return { nodes: ns, edges: es };
  }, [caseData, discoveredIds]);

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div
      className="deduction-graph relative w-full overflow-hidden mb-6 rounded-sm border border-spec-cyan/10 bg-spec-black/40"
      style={{ height: VIEW_H }}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="edge-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00F5FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E50914" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {edges.map((e, i) => {
          const a = nodeMap[e.from];
          const b = nodeMap[e.to];
          if (!a || !b) return null;
          return (
            <motion.line
              key={`${e.from}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={e.active ? 'url(#edge-glow)' : 'rgba(138,143,152,0.15)'}
              strokeWidth={e.active ? 1.5 : 0.8}
              strokeDasharray={e.active ? undefined : '4 4'}
              initial={{ opacity: 0 }}
              animate={{ opacity: e.active ? 0.85 : 0.25 }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
            />
          );
        })}

        <motion.circle
          cx={VIEW_W / 2}
          cy={VIEW_H / 2}
          r={52}
          fill="none"
          stroke="rgba(0,245,255,0.12)"
          strokeWidth={0.5}
          animate={{ r: [52, 88, 52], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>

      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-[1]"
          style={{ left: `${(n.x / VIEW_W) * 100}%`, top: `${(n.y / VIEW_H) * 100}%` }}
        >
          {n.type === 'center' && (
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border border-spec-red/60 bg-spec-red/15 shadow-[0_0_24px_rgba(229,9,20,0.25)]">
              <span className="font-mono text-[10px] text-spec-red font-bold tracking-widest">{n.label}</span>
            </div>
          )}

          {n.type === 'victim' && (
            <div className="flex flex-col items-center">
              <div
                className="relative rounded-sm ring-1 ring-spec-red/55 ring-offset-2 ring-offset-spec-black/80"
                style={{ boxShadow: '0 0 18px rgba(229,9,20,0.2)' }}
              >
                <CharacterPortrait name={n.label} imageUrl={n.imageUrl} size="sm" />
                <span className="absolute -bottom-1 inset-x-0 text-center font-mono text-[6px] tracking-widest text-white/90 bg-spec-red/70 py-px">
                  {t.case.deceased}
                </span>
              </div>
              <span className="mt-2 font-mono text-[7px] text-spec-red/70 tracking-wider">{t.case.victim}</span>
              <span className="mt-1 max-w-[72px] truncate text-center font-mono text-[8px] text-spec-red/80 font-semibold">
                {n.label}
              </span>
            </div>
          )}

          {n.type === 'suspect' && (
            <div className="rounded-sm ring-1 ring-spec-red/40 ring-offset-2 ring-offset-spec-black/80">
              <CharacterPortrait name={n.label} imageUrl={n.imageUrl} size="sm" glow />
            </div>
          )}

          {n.type === 'evidence' && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border ${
                n.active
                  ? 'border-spec-cyan/60 bg-spec-cyan/10 shadow-[0_0_16px_rgba(0,245,255,0.15)]'
                  : 'border-spec-gray/30 bg-spec-gray/5 opacity-60'
              }`}
            >
              {n.active && n.imageUrl ? (
                <img src={n.imageUrl} alt={n.label} className="w-full h-full object-cover" />
              ) : n.active ? (
                <FileSearch className="w-4 h-4 text-spec-cyan" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-spec-gray/50" />
              )}
            </div>
          )}

          {n.type !== 'center' && n.type !== 'victim' && (
            <span
              className={`mt-1.5 max-w-[72px] truncate text-center font-mono text-[8px] ${
                n.active ? 'text-spec-gray' : 'text-spec-gray/40'
              }`}
            >
              {n.label}
            </span>
          )}
        </div>
      ))}

      <p className="absolute bottom-2 left-3 text-[9px] font-mono text-spec-gray z-[2]">{t.deduction.graphHint}</p>
    </div>
  );
}
