/**
 * 解析案件图片地址：
 * - /api/blobs/... 同源代理路径原样保留（生产由 EdgeOne 反代到 API）
 * - 开发环境下把绝对 /blobs 地址改成相对路径，便于 Vite 代理
 * - CloudBase 直连地址原样透传
 */
export function resolveAssetUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();

  if (trimmed.startsWith('/api/blobs/') || trimmed.startsWith('/blobs/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/api/blobs/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
    if (parsed.pathname.startsWith('/blobs/')) {
      // 生产没有 /blobs 路由；仅本地开发改写为相对路径
      if (import.meta.env.DEV) {
        return `${parsed.pathname}${parsed.search}`;
      }
      // 生产若仍拿到旧 /blobs 绝对地址，改走 API 代理
      return `/api${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* 非标准 URL，原样返回 */
  }

  return trimmed;
}
