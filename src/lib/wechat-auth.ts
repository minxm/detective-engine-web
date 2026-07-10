import { getCloudBaseApp } from '@/lib/cloudbase';
import { parseAuthError } from '@/utils/authError';

export const WECHAT_PROVIDER_ID = 'wx_open';
const STATE_KEY = 'detective-wechat-oauth-state';

export function getWechatCallbackUri() {
  return `${window.location.origin}/auth/wechat-callback`;
}

function createState() {
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  return state;
}

export function validateWechatState(state: string | null) {
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return Boolean(expected && state && expected === state);
}

export async function startWechatLogin() {
  const app = getCloudBaseApp();
  if (!app) throw new Error('CloudBase 未配置');

  const auth = app.auth();
  const provider_redirect_uri = getWechatCallbackUri();
  const state = createState();
  const { uri } = await auth.genProviderRedirectUri({
    provider_id: WECHAT_PROVIDER_ID,
    provider_redirect_uri,
    state,
  });

  if (!uri) throw new Error('无法生成微信授权链接，请确认已在 CloudBase 控制台开启微信开放平台登录');
  window.location.assign(uri);
}

function getProviderErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const code = (err as { error?: string }).error;
  return typeof code === 'string' ? code : undefined;
}

async function signInWithProviderToken(
  auth: ReturnType<NonNullable<ReturnType<typeof getCloudBaseApp>>['auth']>,
  provider_token: string
) {
  try {
    await auth.signInWithProvider({ provider_token });
    return;
  } catch (err) {
    if (getProviderErrorCode(err) !== 'not_found') {
      throw err;
    }
  }

  const anon = await auth.signInAnonymously();
  if (anon && typeof anon === 'object' && 'error' in anon && anon.error) {
    throw new Error(parseAuthError(anon.error, '创建微信账号失败'));
  }

  await auth.bindWithProvider({ provider_token });
  await auth.signInWithProvider({ provider_token });
}

export async function completeWechatLogin(code: string) {
  const app = getCloudBaseApp();
  if (!app) throw new Error('CloudBase 未配置');

  const auth = app.auth();
  const provider_redirect_uri = getWechatCallbackUri();
  const { provider_token } = await auth.grantProviderToken({
    provider_id: WECHAT_PROVIDER_ID,
    provider_redirect_uri,
    provider_code: code,
  });

  if (!provider_token) throw new Error('微信授权失败，未获取到登录凭证');
  await signInWithProviderToken(auth, provider_token);
  return auth.getLoginState();
}
