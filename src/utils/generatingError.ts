const GENERATING_ERROR_ZH: Array<[pattern: RegExp, message: string]> = [
  [/任务不存在|job.*not found/i, '生成任务不存在或已过期，请返回大厅重新生成'],
  [/查询生成状态失败/i, '无法查询生成进度，请稍后重试'],
  [/案件已生成但加载失败|load.*fail/i, '案件已生成但加载失败，请返回大厅重试'],
  [/HTTP 404|not found/i, '请求的资源不存在，请返回大厅重试'],
  [/HTTP 5\d\d|internal server error/i, '服务暂时不可用，请稍后重试'],
  [/HTTP 4\d\d|bad request|unauthorized|forbidden/i, '请求失败，请稍后重试'],
  [/network|timeout|ECONNREFUSED|ETIMEDOUT|fetch failed|socket/i, '网络异常，请检查连接后重试'],
  [/rate limit|too many requests|429/i, 'AI 服务请求过于频繁，请稍后再试'],
  [/invalid api key|incorrect api key|authentication|401/i, 'AI 服务密钥配置有误'],
  [/insufficient quota|billing|credit|exceeded/i, 'AI 服务额度不足'],
  [/model.*not found|does not exist|model_not_found/i, 'AI 模型不可用，请联系管理员'],
  [/context length|token limit|maximum context/i, 'AI 响应过长，请重试'],
  [/aborted|cancelled|canceled/i, '生成已中断，请重试'],
  [/json|parse|syntax|unexpected token/i, 'AI 返回数据解析失败，请重试'],
  [/案件 AI 生成失败|AI 返回空内容|AI 返回的案件缺少标题/i, 'AI 案件生成失败，请稍后重试'],
  [/SILICONFLOW|生图|image.*fail|download.*fail/i, '案件插画生成失败，请重试'],
  [/API key|OPENAI|AI_CONFIG/i, 'AI 服务未正确配置'],
];

function hasChinese(text: string) {
  return /[\u4e00-\u9fff]/.test(text);
}

function localizeMessage(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  if (hasChinese(trimmed)) return trimmed;
  for (const [pattern, zh] of GENERATING_ERROR_ZH) {
    if (pattern.test(trimmed)) return zh;
  }
  return fallback;
}

/** 将案件生成相关错误转为中文提示 */
export function parseGeneratingError(err: unknown, fallback = '案件生成失败，请稍后重试'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return localizeMessage(err, fallback);

  if (err instanceof Error) {
    const msg = err.message?.trim();
    return msg ? localizeMessage(msg, fallback) : fallback;
  }

  if (typeof err === 'object') {
    const o = err as Record<string, unknown>;
    for (const key of ['message', 'msg', 'error_description', 'error']) {
      const val = o[key];
      if (typeof val === 'string' && val.trim()) return localizeMessage(val.trim(), fallback);
    }
  }

  return fallback;
}
