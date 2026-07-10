import cloudbase from '@cloudbase/js-sdk';
import { parseAuthError } from '@/utils/authError';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

let app: ReturnType<typeof cloudbase.init> | null = null;

export function getCloudBaseApp() {
  if (app) return app;
  const env = import.meta.env.VITE_TCB_ENV_ID;
  if (!env) return null;
  app = cloudbase.init({ env, region: import.meta.env.VITE_TCB_REGION ?? 'ap-shanghai' });
  return app;
}

export function isCloudBaseConfigured() {
  return Boolean(import.meta.env.VITE_TCB_ENV_ID);
}

export async function getAccessToken(): Promise<string | null> {
  const cloudApp = getCloudBaseApp();
  if (!cloudApp) return null;
  const auth = cloudApp.auth();
  const loginState = await auth.getLoginState();
  if (!loginState) return null;
  try {
    const { accessToken } = await auth.getAccessToken();
    return accessToken ?? null;
  } catch {
    try {
      await auth.refreshSession();
      const { accessToken } = await auth.getAccessToken();
      return accessToken ?? null;
    } catch {
      return null;
    }
  }
}

async function registerViaApi(account: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: account.trim(), password }),
  });
  const data = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string };
  if (!response.ok || !data.success) {
    throw new Error(parseAuthError(data.error, '注册失败，请稍后重试'));
  }
}

/** 通过后端 API 注册，然后调用本地登录接口获取 token */
export async function registerWithPassword(account: string, password: string) {
  await registerViaApi(account, password);
  return loginWithPassword(account, password);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientAuthError(message?: string): boolean {
  if (!message) return false;
  return /socket disconnected|secure tls|econnreset|etimedout|network|timeout|fetch failed/i.test(message);
}

/** 调用后端本地认证登录接口，不向 CloudBase 用户管理添加用户 */
export async function loginWithPassword(account: string, password: string) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: account.trim(), password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        token?: string;
        error?: string;
        user?: { name?: string };
      };

      if (!response.ok || !data.success || !data.token) {
        const message = parseAuthError(data.error, '用户名或密码不正确');
        if (attempt === 0 && isTransientAuthError(data.error ?? message)) {
          lastError = new Error(message);
          await sleep(400);
          continue;
        }
        throw new Error(message);
      }

      return { accessToken: data.token };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === 0 && isTransientAuthError(message)) {
        lastError = err instanceof Error ? err : new Error(message);
        await sleep(400);
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error('登录失败，请稍后重试');
}

export async function logoutCloudBase() {
  const cloudApp = getCloudBaseApp();
  if (!cloudApp) return;
  await cloudApp.auth().signOut();
}

export async function getCloudBaseLoginState() {
  const cloudApp = getCloudBaseApp();
  if (!cloudApp) return null;
  return cloudApp.auth().getLoginState();
}
