/** 从 CloudBase / 网络层各类错误对象中提取可展示文案 */
const AUTH_ERROR_ZH: Array<[pattern: RegExp, message: string]> = [
  [/invalid.*verification|verification.*invalid|invalid.*code|code.*expired|otp/i, '验证码错误或已过期'],
  [/provider email not found/i, '邮箱服务未配置，请先在 CloudBase 控制台开启邮箱登录，或使用用户名注册'],
  [/you must provide either an email or phone number/i, '注册请使用用户名或邮箱'],
  [/email must be a string/i, '请输入有效的邮箱地址'],
  [/invalid email/i, '邮箱格式不正确'],
  [/user already (exists|registered)|username.*exist|name.*exist|duplicate|already exist/i, '该账号已被注册'],
  [/username or password/i, '用户名或密码不正确'],
  [/invalid username or password/i, '用户名或密码不正确'],
  [/invalid credentials/i, '用户名或密码不正确'],
  [/password.*at least|invalid.*password|password.*not.*meet/i, '密码需 8–32 位，且包含大小写字母、数字、特殊字符中的至少三项'],
  [/invalid.*name|invalid.*username|malformed.*name/i, '用户名格式不正确，需以字母或数字开头，仅可包含字母、数字、._-'],
  [/pure.*digit|纯数字/i, '用户名不能为纯数字'],
  [/network|timeout|fetch failed|socket disconnected|secure tls/i, '网络连接不稳定，正在重试…'],
  [/rate limit|too many/i, '请求过于频繁，请稍后再试'],
  [/not_found|provider/i, '微信账号尚未绑定，请重试登录'],
  [/access_denied|user denied/i, '你已取消微信授权'],
];

export function isEmailAccount(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function localizeAuthMessage(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  for (const [pattern, zh] of AUTH_ERROR_ZH) {
    if (pattern.test(trimmed)) return zh;
  }
  if (/[\u4e00-\u9fff]/.test(trimmed)) return trimmed;
  return fallback;
}

export function parseAuthError(err: unknown, fallback = '登录失败，请稍后重试'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return localizeAuthMessage(err, fallback);

  if (err instanceof Error) {
    const msg = err.message?.trim();
    return msg ? localizeAuthMessage(msg, fallback) : fallback;
  }

  if (typeof err === 'object') {
    const o = err as Record<string, unknown>;
    for (const key of ['message', 'msg', 'error_description', 'errorDescription', 'error']) {
      const val = o[key];
      if (typeof val === 'string' && val.trim()) return localizeAuthMessage(val.trim(), fallback);
    }
    if (o.data && typeof o.data === 'object') return parseAuthError(o.data, fallback);
  }

  return fallback;
}

type AuthResult = { error?: unknown; data?: { session?: unknown } | null };

export function assertCloudBaseAuthOk(
  res: AuthResult,
  fallback = '用户名或密码不正确'
): asserts res is AuthResult & { data: { session: unknown } } {
  if (res.error) throw new Error(parseAuthError(res.error, fallback));
  if (!res.data?.session) throw new Error(fallback);
}
