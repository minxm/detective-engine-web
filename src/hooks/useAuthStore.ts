import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAccessToken,
  getCloudBaseLoginState,
  isCloudBaseConfigured,
  loginAnonymous,
  loginWithPassword,
  logoutCloudBase,
  registerWithPassword,
} from '@/lib/cloudbase';
import { fetchAuthConfig, fetchAdminStatus, sendHeartbeat } from '@/services/user';
import { inflight } from '@/utils/inflight';

interface AuthState {
  token: string | null;
  nickname: string;
  authMode: 'guest' | 'cloudbase' | 'none';
  cloudBaseEnabled: boolean;
  initialized: boolean;
  isAdmin: boolean;
  role: 'user' | 'admin';
  setToken: (token: string | null) => void;
  setNickname: (nickname: string) => void;
  initAuth: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
  loginGuest: () => Promise<void>;
  loginCloudBaseAnonymous: () => Promise<void>;
  loginCloudBasePassword: (username: string, password: string, register?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      nickname: '匿名侦探',
      authMode: 'none',
      cloudBaseEnabled: isCloudBaseConfigured(),
      initialized: false,
      isAdmin: false,
      role: 'user',

      setToken: (token) => set({ token }),
      setNickname: (nickname) => set({ nickname }),

      refreshAdminStatus: async () => {
        const { token, authMode } = get();
        if (!token || authMode === 'guest') {
          set({ isAdmin: false, role: 'user' });
          return;
        }
        try {
          const res = await inflight(`admin:status:${token}`, fetchAdminStatus);
          set({ isAdmin: res.isAdmin, role: res.role });
        } catch {
          set({ isAdmin: false, role: 'user' });
        }
      },

      initAuth: async () => {
        if (get().initialized) return;
        if (bootstrapPromise) return bootstrapPromise;

        bootstrapPromise = (async () => {
          try {
            const localCloudBase = isCloudBaseConfigured();
            let enabled = localCloudBase;

            if (localCloudBase) {
              const config = await inflight('auth:config', fetchAuthConfig).catch(() => null);
              enabled = config?.auth?.enabled ?? localCloudBase;
            }

            set({ cloudBaseEnabled: enabled });

            if (enabled) {
              const state = await getCloudBaseLoginState();
              if (state) {
                const token = await getAccessToken();
                if (token) {
                  const user = state.user as { nickName?: string; username?: string };
                  set({
                    token,
                    authMode: 'cloudbase',
                    nickname: user?.nickName || user?.username || get().nickname,
                  });
                  await get().refreshAdminStatus();
                  return;
                }
              }
            }

            if (!get().token) {
              const guestId = `guest_${Date.now().toString(36)}`;
              set({
                token: guestId,
                authMode: 'guest',
                nickname: `侦探${guestId.slice(-4)}`,
                isAdmin: false,
                role: 'user',
              });
            } else if (get().authMode === 'guest') {
              set({ isAdmin: false, role: 'user' });
            } else {
              await get().refreshAdminStatus();
            }
          } finally {
            set({ initialized: true });
            bootstrapPromise = null;
          }
        })();

        return bootstrapPromise;
      },

      loginGuest: async () => {
        const guestId = `guest_${Date.now().toString(36)}`;
        set({
          token: guestId,
          authMode: 'guest',
          nickname: `侦探${guestId.slice(-4)}`,
          isAdmin: false,
          role: 'user',
        });
      },

      loginCloudBaseAnonymous: async () => {
        const { accessToken } = await loginAnonymous();
        set({ token: accessToken, authMode: 'cloudbase', nickname: '匿名侦探' });
        await get().refreshAdminStatus();
        await sendHeartbeat().catch(() => undefined);
      },

      loginCloudBasePassword: async (username, password, register) => {
        const result = register
          ? await registerWithPassword(username, password)
          : await loginWithPassword(username, password);
        set({ token: result.accessToken, authMode: 'cloudbase', nickname: username });
        await get().refreshAdminStatus();
        await sendHeartbeat().catch(() => undefined);
      },

      logout: async () => {
        if (get().authMode === 'cloudbase') await logoutCloudBase().catch(() => undefined);
        set({ token: null, authMode: 'none', nickname: '匿名侦探', isAdmin: false, role: 'user' });
        await get().loginGuest();
      },

      refreshToken: async () => {
        if (get().authMode !== 'cloudbase') return get().token;
        const token = await getAccessToken();
        if (token) set({ token });
        return token;
      },
    }),
    {
      name: 'detective-auth',
      partialize: (state) => ({ nickname: state.nickname, authMode: state.authMode }),
    }
  )
);
