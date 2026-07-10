import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useCaseStore } from '@/utils/case-store';
import { sendHeartbeat } from '@/services/user';
import LoadingScreen from '@/components/ui/LoadingScreen';

const PUBLIC_PATHS = ['/', '/auth', '/auth/wechat-callback'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function isAuthenticated(token: string | null, authMode: string) {
  return authMode !== 'none' && !!token;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const token = useAuthStore((s) => s.token);
  const authMode = useAuthStore((s) => s.authMode);
  const initialized = useAuthStore((s) => s.initialized);
  const startedRef = useRef(false);
  const prevAuthRef = useRef<{ token: string | null; authMode: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!initialized || !token) return;
    void sendHeartbeat().catch(() => undefined);
    const timer = setInterval(() => {
      void sendHeartbeat().catch(() => undefined);
    }, 60_000);
    return () => clearInterval(timer);
  }, [initialized, token]);

  useEffect(() => {
    if (!initialized) return;

    const prev = prevAuthRef.current;
    prevAuthRef.current = { token, authMode };

    if (!prev) return;

    const wasSignedIn = isAuthenticated(prev.token, prev.authMode);
    const isSignedOut = !isAuthenticated(token, authMode);

    if (wasSignedIn && isSignedOut && !isPublicPath(location.pathname)) {
      useCaseStore.getState().setCurrentCase(null);
      useCaseStore.getState().setEvaluation(null);
      navigate('/auth', { replace: true });
    }
  }, [initialized, token, authMode, location.pathname, navigate]);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated(token, authMode) && !isPublicPath(location.pathname)) {
      navigate('/auth', { replace: true });
    }
  }, [initialized, token, authMode, location.pathname, navigate]);

  const needsAuth = !isPublicPath(location.pathname);

  if (!initialized && needsAuth) {
    return <LoadingScreen />;
  }

  if (initialized && needsAuth && !isAuthenticated(token, authMode)) {
    return null;
  }

  return <>{children}</>;
}
