/** 从 API 返回的各类图片 URL 中提取 blob key */
function extractBlobKey(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (/^cases\//.test(trimmed)) {
    return trimmed.split('?')[0].split('#')[0];
  }

  const cloudMatch = trimmed.match(/cloud:\/\/[^/]+\/case-images\/(cases\/[^?#]+)/i);
  if (cloudMatch) return cloudMatch[1];

  for (const prefix of ['/api/blobs/', '/blobs/']) {
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length)).split('?')[0].split('#')[0];
    }
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = decodeURIComponent(parsed.pathname);
    for (const prefix of ['/api/blobs/', '/blobs/', '/case-images/']) {
      const idx = pathname.indexOf(prefix);
      if (idx >= 0) {
        const key = pathname.slice(idx + prefix.length).replace(/^\/+/, '');
        if (key.startsWith('cases/')) return key.split('?')[0];
      }
    }
    const match = pathname.match(/\/cases\/[^?#]+/);
    if (match) return match[0].replace(/^\//, '');
  } catch {
    const match = trimmed.match(/cases\/[^?#]+/);
    if (match) return match[0];
  }

  return null;
}

function toBlobProxyPath(key: string): string {
  return `/api/blobs/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** 将案件图片地址统一为同源 /api/blobs 代理路径（生产经 EdgeOne 反代到云托管） */
export function resolveAssetUrl(url?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('/api/blobs/')) return trimmed;

  const key = extractBlobKey(trimmed);
  if (key) return toBlobProxyPath(key);

  return trimmed;
}
