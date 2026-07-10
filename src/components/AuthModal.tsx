import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import WechatLoginButton from '@/components/WechatLoginButton';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';
import { parseAuthError } from '@/utils/authError';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cloudBaseEnabled, loginWithWechat } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWechatLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithWechat();
    } catch (err) {
      setError(parseAuthError(err, t.auth.wechatFailed));
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <HudPanel solid scan className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="hud-label mb-1">{t.hud.status}</p>
                  <h2 className="text-lg font-bold text-white">{t.auth.title}</h2>
                </div>
                <HudButton variant="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </HudButton>
              </div>

              {cloudBaseEnabled ? (
                <div className="space-y-3 pt-1">
                  <p className="font-mono text-[10px] text-spec-gray/45 tracking-wide">{t.auth.wechatHint}</p>
                  <WechatLoginButton loading={loading} onClick={() => void handleWechatLogin()} />
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-4 font-mono">认证服务暂不可用，请稍后重试</p>
              )}
              {error && <p className="mt-4 text-sm text-red-400 text-center font-mono">{error}</p>}
            </HudPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
