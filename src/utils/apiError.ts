/** 将 API / 网络 / 数据库错误转为中文提示 */
const API_ERROR_ZH: Array<[pattern: RegExp, message: string]> = [
  [
    /socket disconnected before secure tls|secure tls connection was established/i,
    '连接数据库时网络中断（TLS 安全连接未建立）',
  ],
  [/socket disconnected|secure tls|econnreset|etimedout/i, '网络连接中断，请稍后重试'],
  [/econnrefused|fetch failed|network/i, '无法连接服务器，请确认 API 服务已启动'],
  [/timeout|timed out|aborted/i, '请求超时，请稍后重试'],
  [/rate limit|too many|429/i, '请求过于频繁，请稍后再试'],
  [/401|403|无权限|forbidden/i, '无访问权限，请重新登录'],
  [/404|not found|不存在/i, '请求的资源不存在或已过期'],
];

function localizeApiMessage(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  for (const [pattern, zh] of API_ERROR_ZH) {
    if (pattern.test(trimmed)) return zh;
  }
  if (/[\u4e00-\u9fff]/.test(trimmed)) return trimmed;
  return fallback;
}

export function formatApiError(err: unknown, fallback = '操作失败，请稍后重试'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return localizeApiMessage(err, fallback);

  if (err instanceof Error) {
    const msg = err.message?.trim();
    return msg ? localizeApiMessage(msg, fallback) : fallback;
  }

  if (typeof err === 'object' && err && 'message' in err) {
    const msg = String((err as { message?: unknown }).message ?? '').trim();
    if (msg) return localizeApiMessage(msg, fallback);
  }

  return fallback;
}

export function isTransientApiError(message: string): boolean {
  return /socket disconnected|secure tls|econnreset|etimedout|timeout|fetch failed|network/i.test(message);
}
