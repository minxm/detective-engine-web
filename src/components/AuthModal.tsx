import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X } from 'lucide-react';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { HudInput } from '@/components/hud/HudInput';
import { HudPasswordInput } from '@/components/hud/HudPasswordInput';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';
import { parseAuthError } from '@/utils/authError';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cloudBaseEnabled, loginCloudBasePassword } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showPassword = true;

  const handle = async (action: () => Promise<void> | void) => {
    setLoading(true);
    setError('');
    try {
      await action();
      onClose();
    } catch (err) {
      setError(parseAuthError(err, t.auth.loginFailed));
    } finally {
      setLoading(false);
    }
  };

  const switchAuthTab = (tab: 'login' | 'register') => {
    if (tab === authTab) return;
    setAuthTab(tab);
    setUsername('');
    setPassword('');
    setError('');
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
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => switchAuthTab('login')}
                      className={`font-mono text-[10px] py-2 tracking-wider transition-colors ${
                        authTab === 'login'
                          ? 'text-spec-cyan bg-spec-cyan/10'
                          : 'text-spec-gray/45 hover:text-spec-gray/70'
                      }`}
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                        boxShadow: authTab === 'login' ? 'inset 0 0 0 1px rgba(0,245,255,0.25)' : 'inset 0 0 0 1px rgba(0,245,255,0.06)',
                      }}
                    >
                      {t.common.login}
                    </button>
                    <button
                      type="button"
                      onClick={() => switchAuthTab('register')}
                      className={`font-mono text-[10px] py-2 tracking-wider transition-colors ${
                        authTab === 'register'
                          ? 'text-spec-cyan bg-spec-cyan/10'
                          : 'text-spec-gray/45 hover:text-spec-gray/70'
                      }`}
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                        boxShadow: authTab === 'register' ? 'inset 0 0 0 1px rgba(0,245,255,0.25)' : 'inset 0 0 0 1px rgba(0,245,255,0.06)',
                      }}
                    >
                      {t.auth.register}
                    </button>
                  </div>
                  <HudInput value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.auth.username} autoComplete="username" />
                  {showPassword && (
                    <HudPasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.password} autoComplete={authTab === 'login' ? 'current-password' : 'new-password'} />
                  )}
                  <HudButton
                    disabled={loading || !username.trim() || !password}
                    onClick={() =>
                      handle(() =>
                        loginCloudBasePassword(username, password, authTab === 'register')
                      )
                    }
                    className="w-full !text-xs !py-2.5"
                  >
                    {authTab === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" /> {t.common.login}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> {t.auth.register}
                      </>
                    )}
                  </HudButton>
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
