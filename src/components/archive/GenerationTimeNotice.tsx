import { Clock } from 'lucide-react';
import { t } from '@/i18n/zh';

export default function GenerationTimeNotice() {
  return (
    <div className="archive-est-notice mt-4">
      <Clock className="w-4 h-4" aria-hidden />
      <div>
        <p className="archive-est-title">{t.home.estTimeNeutralTitle}</p>
        <p className="archive-est-desc">{t.home.estTimeNeutralDesc}</p>
      </div>
    </div>
  );
}
