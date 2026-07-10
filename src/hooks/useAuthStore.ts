import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAccessToken,
  getCloudBaseLoginState,
  isCloudBaseConfigured,
  logoutCloudBase,
} from '@/lib/cloudbase';
import { startWechatLogin, completeWechatLogin as finishWechatLogin } from '@/lib/wechat-auth';
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
  loginWithWechat: () => Promise<void>;
  completeWechatLogin: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

let bootstrapPromise: Promise<void> | null = null;

function readNickname(loginState: Awaited<ReturnType<typeof getCloudBaseLoginState>>) {
  const user = loginState?.user as { nickName?: string; username?: string; name?: string } | undefined;
  return user?.nickName || user?.username || user?.name || '微信用户';
}

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

            if (enabled) {
              const state = await getCloudBaseLoginState();
              if (state) {
                const freshToken = await getAccessToken();
                if (freshToken) {
                  set({
                    token: freshToken,
                    authMode: 'cloudbase',
                    nickname: readNickname(state) || get().nickname,
                  });
                  await get().refreshAdminStatus();
                  return;
                }
              }
            }

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

      loginWithWechat: async () => {
        await startWechatLogin();
      },

      completeWechatLogin: async (code) => {
        const state = await finishWechatLogin(code);
        const freshToken = await getAccessToken();
        if (!freshToken) throw new Error('登录失败，未获取到访问令牌');
        set({
          token: freshToken,
          authMode: 'cloudbase',
          nickname: readNickname(state),
        });
        await get().refreshAdminStatus();
        await sendHeartbeat().catch(() => undefined);
      },

      logout: async () => {
        if (get().authMode === 'cloudbase') await logoutCloudBase().catch(() => undefined);
        set({ token: null, authMode: 'none', nickname: '', isAdmin: false, role: 'user' });
      },

      refreshToken: async () => {
        const { authMode } = get();
        if (authMode !== 'cloudbase') return get().token;
        const freshToken = await getAccessToken();
        if (freshToken) set({ token: freshToken });
        return freshToken;
      },
    }),
    {
      name: 'detective-auth',
      partialize: (state) => ({
        nickname: state.nickname,
        authMode: state.authMode,
        token: state.token,
      }),
    }
  )
);
