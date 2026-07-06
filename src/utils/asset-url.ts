/** 将 API 返回的绝对 blob 地址转为同源 /blobs 路径，便于 Vite 代理加载 */
export function resolveAssetUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('/blobs/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith('/blobs/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* 非标准 URL，原样返回 */
  }

  return trimmed;
}
