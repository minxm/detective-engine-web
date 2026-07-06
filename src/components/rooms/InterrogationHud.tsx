import { useEffect, useState } from 'react';
import InterrogationWaveform from '@/components/rooms/InterrogationWaveform';
import { t } from '@/i18n/zh';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function InterrogationHud({
  suspectName,
  messageCount,
  isStreaming,
}: {
  suspectName: string;
  messageCount: number;
  isStreaming: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);
  const stress = Math.min(100, 20 + messageCount * 12 + (isStreaming ? 15 : 0));

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-spec-cyan/10 bg-spec-black/60 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-3">
            <span className="text-spec-red animate-data-flicker">● REC</span>
            <span className="text-spec-gray">{formatTime(elapsed)}</span>
          </div>
          <span className="text-spec-cyan/60 truncate max-w-[120px]">{suspectName}</span>
        </div>

        <InterrogationWaveform active={isStreaming || messageCount > 2} variant={stress > 60 ? 'red' : 'cyan'} />

        <div className="flex items-center gap-3">
          <span className="text-[9px] text-spec-gray tracking-widest shrink-0">{t.interrogate.stress}</span>
          <div className="flex-1 h-1.5 bg-spec-navy overflow-hidden" style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${stress}%`,
                background: stress > 70 ? 'linear-gradient(90deg, #E50914, #ff4444)' : 'linear-gradient(90deg, #00F5FF, #0891b2)',
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-spec-cyan w-8 text-right">{stress}%</span>
        </div>
      </div>
    </div>
  );
}
