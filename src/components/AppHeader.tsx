import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, Radio, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import AuthModal from './AuthModal';
import { t } from '@/i18n/zh';

/* ─── 路由 → 房间名映射 ─── */
const ROOM_MAP: Record<string, { label: string; code: string; color: 'cyan' | 'red' | 'gold' }> = {
  '/lobby':            { label: '指挥中心', code: 'CMD-CENTER', color: 'cyan' },
  '/archive':          { label: '案件档案库', code: 'ARCHIVE-VAULT', color: 'cyan' },
  '/leaderboard':      { label: '排行榜', code: 'RANK-BOARD', color: 'gold' },
  '/admin':            { label: '管理后台', code: 'ADMIN-PANEL', color: 'red' },
};
const CASE_ROOMS: Record<string, { label: string; code: string; color: 'cyan' | 'red' | 'gold' }> = {
  '/evidence':     { label: '证据分析室', code: 'EVIDENCE-LAB', color: 'red' },
  '/forensics':    { label: '法医鉴定室', code: 'FORENSICS-LAB', color: 'cyan' },
  '/interrogate':  { label: '审讯室', code: 'INTERROGATION', color: 'red' },
  '/deduction':    { label: '推理室', code: 'DEDUCTION-ROOM', color: 'cyan' },
  '/reconstruction': { label: '案件重建', code: 'RECONSTRUCTION', color: 'cyan' },
  '/archive':      { label: '归档卷宗', code: 'CASE-ARCHIVE', color: 'gold' },
  '/result':       { label: '案件评级', code: 'CASE-RESULT', color: 'gold' },
};

function getRoom(pathname: string) {
  if (ROOM_MAP[pathname]) return ROOM_MAP[pathname];
  for (const [suffix, info] of Object.entries(CASE_ROOMS)) {
    if (pathname.endsWith(suffix)) return info;
  }
  if (/\/case\//.test(pathname)) return { label: '案件卷宗', code: 'CASE-FILE', color: 'gold' as const };
  return { label: '情报局', code: 'IB-SYSTEM', color: 'cyan' as const };
}

/* ─── Breadcrumb ─── */
function Breadcrumb({ pathname }: { pathname: string }) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  return (
    <div className="hidden md:flex items-center gap-1 font-mono text-[9px] text-spec-gray/30 tracking-wider">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 opacity-40" />}
          <span className={i === parts.length - 1 ? 'text-spec-cyan/40' : ''}>
            {p.toUpperCase().slice(0, 8)}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AppHeader() {
  const { token, nickname, authMode, logout } = useAuthStore();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [time, setTime] = useState('');
  const location = useLocation();
  const room = getRoom(location.pathname);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const handleAuthClick = async () => {
    if (token && authMode !== 'none') {
      await logout();
      navigate('/auth', { replace: true });
      return;
    }
    setAuthOpen(true);
  };

  const colorMap = {
    cyan: { dot: 'bg-spec-cyan', text: 'text-spec-cyan', shadow: '0 0 8px rgba(0,245,255,0.7)' },
    red:  { dot: 'bg-spec-red',  text: 'text-spec-red',  shadow: '0 0 8px rgba(229,9,20,0.7)' },
    gold: { dot: 'bg-yellow-400', text: 'text-yellow-400', shadow: '0 0 8px rgba(212,168,83,0.7)' },
  }[room.color];

  return (
    <>
      <header className="game-header px-4 md:px-6">

        {/* 左侧 — Logo + 当前房间 */}
        <div className="flex items-center gap-4 flex-1">
          {/* IB Logo */}
          <Link
            to="/lobby"
            className="shrink-0 group"
            aria-label="返回指挥中心"
          >
            <div
              className="flex items-center justify-center w-8 h-6 transition-all duration-200 group-hover:shadow-[0_0_16px_rgba(229,9,20,0.4)]"
              style={{
                clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                background: 'rgba(229,9,20,0.1)',
                boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.3)',
              }}
            >
              <span
                className="font-display font-black text-[10px] text-spec-red"
                style={{ textShadow: '0 0 8px rgba(229,9,20,0.8)' }}
              >
                IB
              </span>
            </div>
          </Link>

          {/* 分割 */}
          <div className="w-px h-4 bg-spec-cyan/10" />

          {/* 当前位置 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`w-1 h-1 rounded-full ${colorMap.dot} animate-pulse`}
                style={{ boxShadow: colorMap.shadow }} />
              <div>
                <p
                  className={`font-mono text-[9px] font-semibold tracking-[0.15em] leading-none ${colorMap.text}`}
                  style={{ textShadow: colorMap.shadow }}
                >
                  {room.code}
                </p>
                <p className="font-sans text-[10px] text-spec-gray/40 leading-none mt-0.5">{room.label}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <Breadcrumb pathname={location.pathname} />
        </div>

        {/* 中间 — 系统时间与信号 */}
        <div className="hidden lg:flex items-center gap-4 text-center">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-spec-cyan/30 animate-pulse" />
            <span className="font-mono text-[9px] text-spec-cyan/30 tabular-nums tracking-wider">{time}</span>
          </div>
          <div
            className="px-2 py-0.5 font-mono text-[8px] tracking-widest"
            style={{
              background: 'rgba(0,245,255,0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(0,245,255,0.08)',
              clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
              color: 'rgba(0,245,255,0.3)',
            }}
          >
            SECURE · ENC-4096
          </div>
        </div>

        {/* 右侧 — Agent 身份 */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {token && authMode !== 'none' && nickname && (
            <div className="hidden sm:flex flex-col items-end">
              <p className="font-mono text-[8px] text-spec-gray/25 tracking-wider">探员</p>
              <p
                className="font-mono text-[10px] font-semibold text-spec-cyan/60 tracking-wider max-w-[120px] truncate"
                style={{ textShadow: '0 0 8px rgba(0,245,255,0.3)' }}
              >
                {nickname}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleAuthClick()}
            className="group flex items-center gap-2 transition-all duration-200"
            style={{
              padding: '6px 12px',
              clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              background: token && authMode !== 'none'
                ? 'rgba(229,9,20,0.07)'
                : 'rgba(0,245,255,0.06)',
              boxShadow: `inset 0 0 0 1px ${token && authMode !== 'none' ? 'rgba(229,9,20,0.2)' : 'rgba(0,245,255,0.15)'}`,
            }}
          >
            {token && authMode !== 'none' ? (
              <>
                <LogOut className="w-3 h-3 text-spec-red/60 group-hover:text-spec-red transition-colors" />
                <span className="font-mono text-[9px] text-spec-red/50 group-hover:text-spec-red transition-colors tracking-wider">
                  {t.common.logout}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3 text-spec-cyan/60 group-hover:text-spec-cyan transition-colors" />
                <span className="font-mono text-[9px] text-spec-cyan/50 group-hover:text-spec-cyan transition-colors tracking-wider">
                  {t.common.login}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
