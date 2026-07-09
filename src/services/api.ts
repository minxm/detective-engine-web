import { useAuthStore } from '@/hooks/useAuthStore';
import { isTransientApiError } from '@/utils/apiError';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function buildAuthHeaders(
  options: RequestInit,
  opts?: { skipTokenRefresh?: boolean }
): Promise<Record<string, string>> {
  if (!opts?.skipTokenRefresh) {
    await useAuthStore.getState().refreshToken();
  }
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchWithAuthRetry(
  path: string,
  options: RequestInit,
  opts?: { skipTokenRefresh?: boolean }
): Promise<Response> {
  let headers = await buildAuthHeaders(options, opts);
  let response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401 && !opts?.skipTokenRefresh) {
    await useAuthStore.getState().refreshToken();
    headers = await buildAuthHeaders(options, { skipTokenRefresh: true });
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  opts?: { skipTokenRefresh?: boolean }
): Promise<T> {
  const response = await fetchWithAuthRetry(path, options, opts);

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError((data as { error?: string }).error || `HTTP ${response.status}`, response.status);
  }
  return data as T;
}

async function readApiError(response: Response, fallback: string): Promise<ApiError> {
  const data = await response.json().catch(() => ({}));
  const message = (data as { error?: string }).error || fallback;
  return new ApiError(message, response.status);
}

async function consumeSseStream(
  response: Response,
  onDelta: (content: string) => void,
): Promise<string> {
  if (!response.body) {
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

export async function apiStream(
  path: string,
  body: unknown,
  onDelta: (content: string) => void
): Promise<string> {
  const payload = JSON.stringify(body);
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    let receivedDelta = false;
    const onDeltaTracked = (content: string) => {
      receivedDelta = true;
      onDelta(content);
    };

    try {
      let headers = await buildAuthHeaders({ method: 'POST', body: payload });
      let response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers,
        body: payload,
      });

      if (response.status === 401) {
        await useAuthStore.getState().refreshToken();
        headers = await buildAuthHeaders({ method: 'POST', body: payload }, { skipTokenRefresh: true });
        response = await fetch(`${API_BASE}${path}`, {
          method: 'POST',
          headers,
          body: payload,
        });
      }

      if (!response.ok) {
        throw await readApiError(response, '流式请求失败');
      }

      return await consumeSseStream(response, onDeltaTracked);
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(error instanceof Error ? error.message : String(error), 0);
      lastError = apiError;

      const transient =
        receivedDelta === false &&
        (isTransientApiError(apiError.message) || apiError.status === 503 || apiError.status === 0);
      if (!transient || attempt >= 2) throw apiError;
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }

  throw lastError ?? new ApiError('审问失败，请稍后重试', 500);
}
