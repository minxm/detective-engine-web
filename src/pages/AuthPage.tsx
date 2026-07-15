import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import ParticleBackground from '@/components/ParticleBackground';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { HudInput } from '@/components/hud/HudInput';
import { HudPasswordInput } from '@/components/hud/HudPasswordInput';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';
import { parseAuthError } from '@/utils/authError';

const STATUS_MESSAGES: Record<string, string[]> = {
  idle: [t.auth.statusIdle, '请提交凭证以继续'],
  scanning: [...t.auth.statusLoading],
  verified: [t.auth.statusVerified, '访问已授权 — 欢迎，特工'],
  denied: ['登录失败', '凭证无效'],
};

const LEFT_TAGS = [
  { label: 'AUTH-GATE', active: true },
  { label: 'TOKEN-VERIFY', active: true },
  { label: 'SESSION-KEY', active: false },
  { label: 'ACCESS-CTL', active: false },
] as const;

function StatusDot({ phase }: { phase: 'idle' | 'scanning' | 'verified' }) {
  const color =
    phase === 'verified' ? '#00F5FF' : phase === 'scanning' ? '#E50914' : 'rgba(162,168,178,0.78)';
  const glow =
    phase === 'scanning'
      ? '0 0 8px rgba(229,9,20,0.8)'
      : phase === 'verified'
        ? '0 0 8px rgba(0,245,255,0.8)'
        : undefined;

  return (
    <div
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{
        background: color,
        boxShadow: glow,
        animation: phase === 'scanning' ? 'pulse-red 1s ease-in-out infinite' : undefined,
      }}
    />
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const {
    cloudBaseEnabled,
    initialized,
    nickname,
    authMode,
    loginCloudBasePassword,
  } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (scanPhase !== 'scanning') {
      setMsgIdx(0);
      return;
    }
    const msgs = STATUS_MESSAGES.scanning;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMsgIdx(i % msgs.length);
    }, 900);
    return () => clearInterval(id);
  }, [scanPhase]);

  const goLobby = () => navigate('/lobby');

  const handle = async (action: () => Promise<void> | void) => {
    setLoading(true);
    setScanPhase('scanning');
    setError('');
    try {
      await action();
      setScanPhase('verified');
      await new Promise((r) => setTimeout(r, 800));
      goLobby();
    } catch (err) {
      setScanPhase('idle');
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
    setScanPhase('idle');
  };

  const showPassword = true;

  if (!initialized) {
    return (
      <div className="flex-1 relative bg-spec-black">
        <CinematicBackdrop />
        <LoadingScreen label={t.common.loading} />
      </div>
    );
  }

  const currentMsg = STATUS_MESSAGES[scanPhase]?.[msgIdx] ?? STATUS_MESSAGES[scanPhase]?.[0] ?? '';
  const statusColor =
    scanPhase === 'verified'
      ? 'rgba(0,245,255,0.85)'
      : scanPhase === 'scanning'
        ? 'rgba(229,9,20,0.75)'
        : 'rgba(138,143,152,0.55)';

  return (
    <div className="flex-1 relative flex items-center justify-center px-4 py-12 bg-spec-black overflow-hidden">
      <CinematicBackdrop variant="auth" />
      <ParticleBackground />

      {/* 左侧系统标签 */}
      {LEFT_TAGS.map(({ label, active }, i) => (
        <motion.div
          key={label}
          className="absolute left-3 sm:left-5 hidden lg:flex flex-col items-center"
          style={{ top: `${22 + i * 14}%` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: active ? 0.5 : 0.28, x: 0 }}
          transition={{ delay: 0.25 + i * 0.08, duration: 0.5 }}
        >
          <span className={`auth-side-tag ${active ? 'auth-side-tag-active' : 'auth-side-tag-standby'}`}>
            {label} · {active ? 'ACTIVE' : 'STANDBY'}
          </span>
          <div
            className="mt-2 w-px h-8"
            style={{
              background: active
                ? 'linear-gradient(180deg, rgba(0,245,255,0.35), transparent)'
                : 'linear-gradient(180deg, rgba(138,143,152,0.15), transparent)',
            }}
          />
        </motion.div>
      ))}

      {/* 右侧装饰 */}
      {['SEC-LVL-5', 'ENC-4096', 'QUANTUM-LOCK'].map((label, i) => (
        <motion.div
          key={label}
          className="absolute right-3 sm:right-5 hidden lg:flex flex-col items-center"
          style={{ top: `${28 + i * 15}%` }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.32, x: 0 }}
          transition={{ delay: 0.35 + i * 0.08 }}
        >
          <span className="auth-side-tag auth-side-tag-standby">{label}</span>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* 顶部分类标签 */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          <div className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent to-spec-cyan/40" />
          <span className="font-mono text-[8px] text-spec-cyan/45 tracking-[0.28em] uppercase whitespace-nowrap">
            CLASSIFIED · SEC-LVL-5
          </span>
          <div className="h-px w-10 sm:w-14 bg-gradient-to-l from-transparent to-spec-cyan/40" />
        </motion.div>

        {/* 标题区 */}
        <div className="auth-header">
          <div className="auth-watermark" aria-hidden>
            AUTH
          </div>

          <div className="auth-header-row">
            <div className="auth-header-title">
              <div className="p5-title-wrap">
                <h1 className="p5-title text-[clamp(1.55rem,4.5vw,2.35rem)]">
                  身份
                  <span className="p5-title-red ml-2">认证</span>
                </h1>
              </div>
            </div>

            <motion.div
              className="auth-header-badge"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center shrink-0"
                style={{
                  clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                  background: 'rgba(0,245,255,0.1)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.28)',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-spec-cyan" />
              </div>
              <span className="font-mono text-[8px] tracking-[0.18em] text-spec-cyan/60 uppercase whitespace-nowrap">
                安全凭证认证
              </span>
            </motion.div>
          </div>

          <p className="auth-header-subtitle">{t.auth.subtitle}</p>
        </div>

        {/* 状态条 */}
        <div className="flex justify-center mb-5 min-h-[2rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${scanPhase}-${msgIdx}`}
              className="auth-status-pill"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <StatusDot phase={scanPhase} />
              <span style={{ color: statusColor }}>{currentMsg}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 认证面板 + 角标 */}
        <div className="auth-frame relative">
          <div className="auth-glow" aria-hidden />
          <span className="auth-corner auth-corner-tl" aria-hidden />
          <span className="auth-corner auth-corner-tr" aria-hidden />
          <span className="auth-corner auth-corner-bl" aria-hidden />
          <span className="auth-corner auth-corner-br" aria-hidden />

          <HudPanel solid scan className="p-6 sm:p-7 relative z-[1]">
            <AnimatePresence>
              {authMode !== 'none' && scanPhase !== 'verified' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="auth-session-card p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center"
                        style={{
                          clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0 100%)',
                          background: 'rgba(0,245,255,0.08)',
                          boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.2)',
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 text-spec-cyan/60" />
                      </div>
                      <div className="min-w-0 text-left">
                    <p className="font-mono text-[8px] text-spec-gray/45 tracking-wider mb-0.5">
                      {t.auth.sessionActive}
                    </p>
                        <p className="font-mono text-sm text-spec-cyan font-semibold truncate">{nickname}</p>
                      </div>
                    </div>
                    <HudButton
                      disabled={loading}
                      onClick={goLobby}
                      className="shrink-0 !py-2 !px-3 !text-[11px]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {t.flow.continue}
                    </HudButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {scanPhase === 'verified' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-4 text-center"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                    background: 'rgba(0,245,255,0.07)',
                    boxShadow: '0 0 0 1px rgba(0,245,255,0.32), 0 0 28px rgba(0,245,255,0.1)',
                  }}
                >
                  <p
                    className="font-mono text-[11px] tracking-[0.28em] font-bold"
                    style={{ color: '#00F5FF', textShadow: '0 0 14px rgba(0,245,255,0.55)' }}
                  >
                    ✓ 登录成功
                  </p>
                  <p className="font-mono text-[9px] text-spec-gray/45 mt-1 tracking-wider">
                    {t.auth.statusEntering}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {cloudBaseEnabled ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2 mb-1">
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

                <p className="hud-label text-[9px] mb-2">{t.auth.accountSection}</p>
                <HudInput
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.auth.username}
                  autoComplete="username"
                />
                <p className="font-mono text-[9px] text-spec-gray/35 tracking-wide -mt-1">
                  {authTab === 'register' ? t.auth.registerHint : t.auth.loginHint}
                </p>
                {showPassword && (
                  <>
                    <p className="font-mono text-[9px] text-spec-gray/30 tracking-wide -mt-1">
                      {t.auth.passwordHint}
                    </p>
                    <HudPasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.auth.password}
                      autoComplete={authTab === 'login' ? 'current-password' : 'new-password'}
                    />
                  </>
                )}
                <HudButton
                  disabled={loading || !username.trim() || !password}
                  onClick={() =>
                    handle(() =>
                      loginCloudBasePassword(username, password, authTab === 'register')
                    )
                  }
                  className="w-full mt-0.5"
                >
                  {authTab === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      {t.common.login}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {t.auth.register}
                    </>
                  )}
                </HudButton>
                <p className="font-mono text-[9px] text-spec-gray/35 text-center tracking-wide pt-1">
                  {t.auth.loginRequired}
                </p>
              </div>
            ) : (
              <p className="text-sm text-spec-gray/50 mb-2 font-mono text-center tracking-wider leading-relaxed">
                认证服务暂不可用，请稍后重试
              </p>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-3 py-2 text-center"
                style={{
                  clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                  background: 'rgba(229,9,20,0.06)',
                  boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.22)',
                }}
              >
                <p
                  className="text-sm text-spec-red font-mono tracking-wide"
                  style={{ textShadow: '0 0 8px rgba(229,9,20,0.35)' }}
                >
                  ✗ {error}
                </p>
              </motion.div>
            )}
          </HudPanel>
        </div>

        <motion.p
          className="text-center font-mono text-[8px] text-spec-gray/25 mt-5 tracking-[0.32em] uppercase flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-spec-cyan/40"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          情报局 · 安全访问通道 · 2047
        </motion.p>
      </motion.div>
    </div>
  );
}
