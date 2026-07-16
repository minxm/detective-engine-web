/**
 * 解析案件图片地址：
 * - /api/blobs/... 同源代理路径原样保留（生产由 EdgeOne 反代到 API）
 * - 开发环境下把绝对 /blobs 地址改成相对路径，便于 Vite 代理
 * - 若误拿到 cloud:// fileID，改走 /api/blobs 代理（正常应由服务端签发临时链）
 * - CloudBase 直连地址原样透传
 */
export function resolveAssetUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();

  if (trimmed.startsWith('/api/blobs/') || trimmed.startsWith('/blobs/')) {
    return trimmed;
  }

  if (trimmed.startsWith('cloud://')) {
    const match = trimmed.match(/cloud:\/\/[^/]+\/(?:case-images\/)?(cases\/[^?#]+)/i);
    if (!match) return undefined;
    return `/api/blobs/${match[1].split('/').map(encodeURIComponent).join('/')}`;
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
