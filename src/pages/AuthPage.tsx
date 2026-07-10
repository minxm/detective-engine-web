import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import ParticleBackground from '@/components/ParticleBackground';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import WechatLoginButton from '@/components/WechatLoginButton';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';
import { parseAuthError } from '@/utils/authError';

const STATUS_MESSAGES: Record<string, string[]> = {
  idle: [t.auth.statusIdle, t.auth.wechatHint],
  scanning: [...t.auth.statusLoading],
  verified: [t.auth.statusVerified, '访问已授权 — 欢迎，特工'],
};

const LEFT_TAGS = [
  { label: 'AUTH-GATE', active: true },
  { label: 'TOKEN-VERIFY', active: true },
  { label: 'SESSION-KEY', active: false },
  { label: 'ACCESS-CTL', active: false },
] as const;

function StatusDot({ phase }: { phase: 'idle' | 'scanning' | 'verified' }) {
  const color =
    phase === 'verified' ? '#00F5FF' : phase === 'scanning' ? '#E50914' : 'rgba(138,143,152,0.55)';
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
  const { cloudBaseEnabled, initialized, nickname, authMode, loginWithWechat } = useAuthStore();
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

  const handleWechatLogin = async () => {
    setLoading(true);
    setScanPhase('scanning');
    setError('');
    try {
      await loginWithWechat();
    } catch (err) {
      setScanPhase('idle');
      setError(parseAuthError(err, t.auth.wechatFailed));
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen relative bg-spec-black">
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-spec-black overflow-hidden">
      <CinematicBackdrop variant="auth" />
      <ParticleBackground />

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
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="auth-header">
          <div className="auth-header-row">
            <div className="auth-header-title">
              <div className="p5-title-wrap">
                <h1 className="p5-title text-[clamp(1.55rem,4.5vw,2.35rem)]">
                  身份
                  <span className="p5-title-red ml-2">认证</span>
                </h1>
              </div>
            </div>
            <motion.div className="auth-header-badge" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ShieldCheck className="w-3.5 h-3.5 text-spec-cyan" />
              <span className="font-mono text-[8px] tracking-[0.18em] text-spec-cyan/60 uppercase whitespace-nowrap">
                微信安全登录
              </span>
            </motion.div>
          </div>
          <p className="auth-header-subtitle">{t.auth.subtitle}</p>
        </div>

        <div className="flex justify-center mb-5 min-h-[2rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${scanPhase}-${msgIdx}`}
              className="auth-status-pill"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <StatusDot phase={scanPhase} />
              <span style={{ color: statusColor }}>{currentMsg}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="auth-frame relative">
          <HudPanel solid scan className="p-6 sm:p-7 relative z-[1]">
            <AnimatePresence>
              {authMode !== 'none' && scanPhase !== 'verified' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
                  <div className="auth-session-card p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Eye className="w-3.5 h-3.5 text-spec-cyan/60 shrink-0" />
                      <div className="min-w-0 text-left">
                        <p className="font-mono text-[8px] text-spec-gray/45 tracking-wider mb-0.5">
                          {t.auth.sessionActive}
                        </p>
                        <p className="font-mono text-sm text-spec-cyan font-semibold truncate">{nickname}</p>
                      </div>
                    </div>
                    <HudButton disabled={loading} onClick={goLobby} className="shrink-0 !py-2 !px-3 !text-[11px]">
                      <ArrowRight className="w-3.5 h-3.5" />
                      {t.flow.continue}
                    </HudButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {cloudBaseEnabled ? (
              <div className="space-y-3">
                <p className="hud-label text-[9px] mb-1">{t.auth.wechatSection}</p>
                <p className="font-mono text-[9px] text-spec-gray/35 tracking-wide">{t.auth.wechatHint}</p>
                <WechatLoginButton loading={loading} onClick={() => void handleWechatLogin()} />
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 px-3 py-2 text-center">
                <p className="text-sm text-spec-red font-mono tracking-wide">✗ {error}</p>
              </motion.div>
            )}
          </HudPanel>
        </div>
      </motion.div>
    </div>
  );
}
