import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CASE_FLOW_ORDER, CASE_FLOW_PATHS, flowStepIndex, getMaxFlowStep } from '@/utils/case-flow';
import { t } from '@/i18n/zh';
import type { CaseFlowStep } from '@/types';

const STEP_LABELS: Record<CaseFlowStep, string> = {
  open: t.flow.open,
  evidence: t.flow.evidence,
  forensics: t.flow.forensics,
  interrogate: t.flow.interrogate,
  deduction: t.flow.deduction,
  reconstruction: t.flow.reconstruction,
  closed: t.flow.closed,
};

export default function CaseFlowBar({ current }: { current: CaseFlowStep }) {
  const { id = '' } = useParams();
  const maxStep = getMaxFlowStep(id);
  const maxIdx = flowStepIndex(maxStep);
  const currentIdx = flowStepIndex(current);
  const total = CASE_FLOW_ORDER.length;
  const nextStep = currentIdx < total - 1 ? CASE_FLOW_ORDER[currentIdx + 1] : null;
  const nextReachable = nextStep && flowStepIndex(nextStep) <= maxIdx;

  return (
    <div className="mb-6 md:mb-8">
      {/* 移动端：当前步骤 + 进度点 */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0" />

          <div className="flex-1 min-w-0 text-center">
            <p className="font-mono text-[10px] text-spec-cyan/60 tracking-widest">
              {String(currentIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <p className="font-mono text-xs text-white tracking-wide truncate">{STEP_LABELS[current]}</p>
          </div>

          {nextReachable && nextStep ? (
            <Link
              to={CASE_FLOW_PATHS[nextStep](id)}
              className="hud-btn-ghost !p-2 shrink-0"
              aria-label={t.flow.next}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="w-9 shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 px-2">
          {CASE_FLOW_ORDER.map((step, i) => {
            const reachable = i <= maxIdx;
            const isCurrent = step === current;
            const isDone = i < currentIdx;
            return reachable ? (
              <Link
                key={step}
                to={CASE_FLOW_PATHS[step](id)}
                className={`flow-dot ${isCurrent ? 'flow-dot-active' : isDone ? 'flow-dot-done' : 'flow-dot-pending'}`}
                aria-label={STEP_LABELS[step]}
              />
            ) : (
              <span key={step} className="flow-dot flow-dot-locked" />
            );
          })}
        </div>
      </div>

      {/* 桌面端：完整流程条 */}
      <div className="hidden md:block overflow-x-auto pb-1">
        <div className="flex items-stretch gap-1 min-w-max">
          {CASE_FLOW_ORDER.map((step, i) => {
            const reachable = i <= maxIdx;
            const isCurrent = step === current;
            const isDone = i < currentIdx;
            const path = CASE_FLOW_PATHS[step](id);

            return (
              <div key={step} className="flex items-center">
                {reachable ? (
                  <Link to={path} className="relative block group">
                    {isCurrent && (
                      <motion.div layoutId="flow-step" className="absolute inset-0 flow-step-active" />
                    )}
                    <span
                      className={`relative block px-3 py-2 font-mono text-[10px] tracking-widest whitespace-nowrap transition-all ${
                        isCurrent
                          ? 'text-white skew-x-[-3deg]'
                          : isDone
                            ? 'text-spec-gray group-hover:text-spec-cyan skew-x-[-3deg]'
                            : 'text-spec-gray/60 group-hover:text-white skew-x-[-3deg]'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                      <span className="mx-1 opacity-30">/</span>
                      {STEP_LABELS[step]}
                    </span>
                  </Link>
                ) : (
                  <span className="block px-3 py-2 font-mono text-[10px] tracking-widest text-spec-gray/25 whitespace-nowrap skew-x-[-3deg]">
                    {String(i + 1).padStart(2, '0')} / {STEP_LABELS[step]}
                  </span>
                )}
                {i < CASE_FLOW_ORDER.length - 1 && (
                  <div className={`w-3 h-px ${i < maxIdx ? 'bg-spec-red/40' : 'bg-spec-gray/15'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
