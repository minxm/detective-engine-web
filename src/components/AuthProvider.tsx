import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { sendHeartbeat } from '@/services/user';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const token = useAuthStore((s) => s.token);
  const authMode = useAuthStore((s) => s.authMode);
  const initialized = useAuthStore((s) => s.initialized);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!initialized || authMode !== 'cloudbase' || !token) return;
    void sendHeartbeat().catch(() => undefined);
    const timer = setInterval(() => {
      void sendHeartbeat().catch(() => undefined);
    }, 60_000);
    return () => clearInterval(timer);
  }, [initialized, authMode, token]);

  return <>{children}</>;
}
