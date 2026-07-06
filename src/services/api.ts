import { useAuthStore } from '@/hooks/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  opts?: { skipTokenRefresh?: boolean }
): Promise<T> {
  if (!opts?.skipTokenRefresh) {
    await useAuthStore.getState().refreshToken();
  }
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError((data as { error?: string }).error || `HTTP ${response.status}`, response.status);
  }
  return data as T;
}

export async function apiStream(
  path: string,
  body: unknown,
  onDelta: (content: string) => void
): Promise<string> {
  await useAuthStore.getState().refreshToken();
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new ApiError('流式请求失败', response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const payload = JSON.parse(line.slice(6)) as { type: string; content?: string; error?: string };
        if (payload.type === 'delta' && payload.content) {
          finalContent += payload.content;
          onDelta(payload.content);
        }
        if (payload.type === 'done' && payload.content) {
          finalContent = payload.content;
        }
        if (payload.type === 'error') {
          throw new ApiError(payload.error ?? 'AI 回复失败', 500);
        }
      } catch (error) {
        if (error instanceof ApiError) throw error;
      }
    }
  }

  return finalContent;
}
