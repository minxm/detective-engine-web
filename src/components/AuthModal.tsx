import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Ghost, X } from 'lucide-react';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { HudInput } from '@/components/hud/HudInput';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cloudBaseEnabled, loginGuest, loginCloudBaseAnonymous, loginCloudBasePassword } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (action: () => Promise<void> | void) => {
    setLoading(true);
    setError('');
    try {
      await action();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
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
                <div className="space-y-3">
                  <HudButton variant="ghost" disabled={loading} onClick={() => handle(loginCloudBaseAnonymous)} className="w-full justify-center">
                    <Ghost className="w-4 h-4" /> {t.auth.anonymous}
                  </HudButton>
                  <div className="space-y-2 pt-2">
                    <HudInput value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.auth.username} />
                    <HudInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t.auth.password} />
                    <div className="flex gap-2 pt-1">
                      <HudButton disabled={loading} onClick={() => handle(() => loginCloudBasePassword(username, password))} className="flex-1 !text-xs !py-2.5">
                        <LogIn className="w-4 h-4" /> {t.common.login}
                      </HudButton>
                      <HudButton variant="ghost" disabled={loading} onClick={() => handle(() => loginCloudBasePassword(username, password, true))} className="flex-1 !text-xs !py-2.5">
                        <UserPlus className="w-4 h-4" /> {t.auth.register}
                      </HudButton>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-4 font-mono">{t.auth.guestHint}</p>
              )}

              <button type="button" disabled={loading} onClick={() => handle(loginGuest)} className="w-full mt-4 text-xs text-slate-500 hover:text-cyan-300 py-2 font-mono tracking-wider transition-colors">
                {t.auth.guest}
              </button>
              {error && <p className="mt-4 text-sm text-red-400 text-center font-mono">{error}</p>}
            </HudPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
