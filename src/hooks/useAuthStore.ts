import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAccessToken,
  getCloudBaseLoginState,
  isCloudBaseConfigured,
  loginWithPassword,
  logoutCloudBase,
  registerWithPassword,
} from '@/lib/cloudbase';
import { fetchAuthConfig, fetchAdminStatus, sendHeartbeat } from '@/services/user';
import { inflight } from '@/utils/inflight';

interface AuthState {
  token: string | null;
  nickname: string;
  authMode: 'cloudbase' | 'none';
  cloudBaseEnabled: boolean;
  initialized: boolean;
  isAdmin: boolean;
  role: 'user' | 'admin';
  setToken: (token: string | null) => void;
  setNickname: (nickname: string) => void;
  initAuth: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
  loginCloudBasePassword: (
    username: string,
    password: string,
    register?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      nickname: '',
      authMode: 'none',
      cloudBaseEnabled: isCloudBaseConfigured(),
      initialized: false,
      isAdmin: false,
      role: 'user',

      setToken: (token) => set({ token }),
      setNickname: (nickname) => set({ nickname }),

      refreshAdminStatus: async () => {
        const { token, authMode } = get();
        if (!token || authMode !== 'cloudbase') {
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

            const { token, authMode } = get();

            // 恢复本地认证会话（token 以 local. 开头表示由后端本地认证系统签发）
            if (authMode === 'cloudbase' && token?.startsWith('local.')) {
              await get().refreshAdminStatus();
              return;
            }

            // 恢复 CloudBase 会话（兼容旧版 CloudBase token）
            if (enabled && authMode === 'cloudbase' && token && !token.startsWith('local.')) {
              const state = await getCloudBaseLoginState();
              if (state) {
                const freshToken = await getAccessToken();
                if (freshToken) {
                  const user = state.user as { nickName?: string; username?: string };
                  set({
                    token: freshToken,
                    authMode: 'cloudbase',
                    nickname: user?.nickName || user?.username || get().nickname,
                  });
                  await get().refreshAdminStatus();
                  return;
                }
              }
              // CloudBase 会话已过期
              set({ token: null, authMode: 'none', nickname: '', isAdmin: false, role: 'user' });
              return;
            }

            // 未认证
            set({
              token: null,
              authMode: 'none',
              nickname: '',
              isAdmin: false,
              role: 'user',
            });
          } finally {
            set({ initialized: true });
            bootstrapPromise = null;
          }
        })();

        return bootstrapPromise;
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
        set({ token: null, authMode: 'none', nickname: '', isAdmin: false, role: 'user' });
      },

      refreshToken: async () => {
        const { authMode, token } = get();
        if (authMode !== 'cloudbase') return token;
        // 本地 token 长期有效，无需刷新
        if (token?.startsWith('local.')) return token;
        const freshToken = await getAccessToken();
        if (freshToken) set({ token: freshToken });
        return freshToken;
      },
    }),
    {
      name: 'detective-auth',
      // 持久化 token（本地认证 token 需要跨页面保留）
      partialize: (state) => ({
        nickname: state.nickname,
        authMode: state.authMode,
        token: state.token,
      }),
    }
  )
);
