import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Ghost, Eye, Fingerprint } from 'lucide-react';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import ParticleBackground from '@/components/ParticleBackground';
import HudPanel from '@/components/hud/HudPanel';
import HudButton from '@/components/hud/HudButton';
import { HudInput } from '@/components/hud/HudInput';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/hooks/useAuthStore';
import { t } from '@/i18n/zh';

/* ─── Bio Status Message ─── */
const BIO_MESSAGES: Record<string, string[]> = {
  idle: ['等待生物识别输入', '请提交凭证以继续'],
  scanning: ['正在扫描生物特征…', '交叉比对数据库…', '验证身份中…'],
  verified: ['身份确认', '访问已授权 — 欢迎，特工'],
  denied: ['身份验证失败', '凭证无效'],
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { cloudBaseEnabled, initialized, nickname, authMode,
    loginGuest, loginCloudBaseAnonymous, loginCloudBasePassword } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanPhase, setScanPhase] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [msgIdx, setMsgIdx] = useState(0);

  /* Cycle status messages */
  useEffect(() => {
    if (scanPhase !== 'scanning') { setMsgIdx(0); return; }
    const msgs = BIO_MESSAGES.scanning;
    let i = 0;
    const id = setInterval(() => { i++; setMsgIdx(i % msgs.length); }, 900);
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
      setError((err as Error).message);
    } finally {
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

  const currentMsg = BIO_MESSAGES[scanPhase]?.[msgIdx] ?? BIO_MESSAGES[scanPhase]?.[0] ?? '';

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-spec-black overflow-hidden">
      <CinematicBackdrop variant="auth" />
      <ParticleBackground />

      {/* 侧边生物识别标签 */}
      {(['IRIS-SCAN', 'NEURO-ID', 'DNA-VERIFY', 'VOICE-PRINT'] as const).map((label, i) => (
        <motion.div
          key={label}
          className="absolute left-4 hidden xl:flex flex-col items-center"
          style={{ top: `${25 + i * 14}%` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.35, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
        >
          <span
            className="font-mono text-[7px] text-spec-cyan/40 tracking-[0.3em]"
            style={{ writingMode: 'vertical-rl' }}
          >
            {label} · {i < 2 ? 'ACTIVE' : 'STANDBY'}
          </span>
          <div
            className="mt-2 w-px h-6"
            style={{ background: 'linear-gradient(180deg, rgba(0,245,255,0.3), transparent)' }}
          />
        </motion.div>
      ))}

      {/* 右侧装饰 */}
      {['SEC-LVL-5', 'ENC-4096', 'QUANTUM-LOCK'].map((label, i) => (
        <motion.div
          key={label}
          className="absolute right-4 hidden xl:flex flex-col items-center"
          style={{ top: `${30 + i * 15}%` }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        >
          <span
            className="font-mono text-[7px] text-spec-gray/30 tracking-[0.3em]"
            style={{ writingMode: 'vertical-rl' }}
          >
            {label}
          </span>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >

        {/* 标题区 */}
        <div className="text-center mb-6">
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{
                clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                background: 'rgba(0,245,255,0.08)',
                boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.25)',
              }}
            >
              <Fingerprint className="w-4 h-4 text-spec-cyan" />
            </div>
            <div
              className="px-2 py-0.5 font-mono text-[8px] tracking-[0.3em] text-spec-cyan/50"
              style={{
                background: 'rgba(0,245,255,0.04)',
                boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.1)',
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
              }}
            >
              生物识别认证
            </div>
          </motion.div>

          <div className="p5-title-wrap mb-2">
            <h1 className="p5-title text-[clamp(1.5rem,4vw,2.2rem)]">
              身份
              <span className="p5-title-red ml-2">认证</span>
            </h1>
          </div>
          <p className="font-mono text-[10px] text-spec-gray/40 tracking-wider">{t.auth.subtitle}</p>
        </div>

        {/* 状态消息 */}
        <div className="text-center mb-5 h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${scanPhase}-${msgIdx}`}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: scanPhase === 'verified' ? '#00F5FF'
                    : scanPhase === 'scanning' ? '#E50914'
                    : 'rgba(138,143,152,0.5)',
                  boxShadow: scanPhase === 'scanning'
                    ? '0 0 8px rgba(229,9,20,0.8)'
                    : scanPhase === 'verified'
                    ? '0 0 8px rgba(0,245,255,0.8)'
                    : undefined,
                  animation: scanPhase === 'scanning' ? 'pulse-red 1s ease-in-out infinite' : undefined,
                }}
              />
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{
                  color: scanPhase === 'verified' ? 'rgba(0,245,255,0.8)'
                    : scanPhase === 'scanning' ? 'rgba(229,9,20,0.7)'
                    : 'rgba(138,143,152,0.5)',
                }}
              >
                {currentMsg}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 认证面板 */}
        <HudPanel solid scan className="p-6">

          {/* Session Active */}
          <AnimatePresence>
            {authMode !== 'none' && scanPhase !== 'verified' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3"
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  background: 'rgba(0,245,255,0.04)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.15)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-spec-cyan/50" />
                  <div>
                    <p className="font-mono text-[8px] text-spec-gray/40 tracking-wider">会话激活</p>
                    <p className="font-mono text-sm text-spec-cyan font-semibold">{nickname}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verified success */}
          <AnimatePresence>
            {scanPhase === 'verified' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-4 text-center"
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  background: 'rgba(0,245,255,0.06)',
                  boxShadow: '0 0 0 1px rgba(0,245,255,0.3), 0 0 20px rgba(0,245,255,0.08)',
                }}
              >
                <p
                  className="font-mono text-[11px] tracking-[0.3em] font-bold"
                  style={{ color: '#00F5FF', textShadow: '0 0 12px rgba(0,245,255,0.6)' }}
                >
                  ✓ 身份验证成功
                </p>
                <p className="font-mono text-[9px] text-spec-gray/40 mt-1 tracking-wider">正在进入指挥中心…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth forms */}
          {cloudBaseEnabled ? (
            <div className="space-y-3">
              <HudButton
                variant="ghost"
                disabled={loading}
                onClick={() => handle(loginCloudBaseAnonymous)}
                className="w-full justify-center"
              >
                <Ghost className="w-4 h-4" />
                {t.auth.anonymous}
              </HudButton>
              <div className="hud-divider my-1" />
              <HudInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.auth.username}
              />
              <HudInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={t.auth.password}
              />
              <div className="flex gap-2">
                <HudButton
                  disabled={loading}
                  onClick={() => handle(() => loginCloudBasePassword(username, password))}
                  className="flex-1"
                >
                  <LogIn className="w-4 h-4" />
                  {t.common.login}
                </HudButton>
                <HudButton
                  variant="ghost"
                  disabled={loading}
                  onClick={() => handle(() => loginCloudBasePassword(username, password, true))}
                  className="flex-1"
                >
                  <UserPlus className="w-4 h-4" />
                  {t.auth.register}
                </HudButton>
              </div>
            </div>
          ) : (
            <p className="text-sm text-spec-gray/50 mb-4 font-mono text-center tracking-wider">
              {t.auth.guestHint}
            </p>
          )}

          <HudButton
            disabled={loading}
            onClick={() => (authMode !== 'none' ? goLobby() : handle(loginGuest))}
            className="w-full mt-4"
          >
            {loading ? (
              <span className="font-mono text-xs tracking-widest" style={{ animation: 'data-flicker 1s step-end infinite' }}>
                验证中…
              </span>
            ) : authMode !== 'none' ? (
              t.flow.continue
            ) : (
              t.auth.guest
            )}
          </HudButton>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-spec-red text-center font-mono tracking-wider"
              style={{ textShadow: '0 0 8px rgba(229,9,20,0.4)' }}
            >
              ✗ {error}
            </motion.p>
          )}
        </HudPanel>

        {/* 底部说明 */}
        <p className="text-center font-mono text-[8px] text-spec-gray/20 mt-4 tracking-[0.3em]">
          情报局 · 安全访问通道 · 2047
        </p>
      </motion.div>
    </div>
  );
}
