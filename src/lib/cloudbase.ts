import cloudbase from '@cloudbase/js-sdk';

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
