import { MARKET_DATA_API_BASE } from './marketDataConfig.js';

export class OptionsApiError extends Error {
  constructor(message, code, status = 0) {
    super(message);
    this.name = 'OptionsApiError';
    this.code = code;
    this.status = status;
  }
}

export function createOptionsClient({ apiBaseUrl = MARKET_DATA_API_BASE, getSession, fetcher = globalThis.fetch, timeoutMs = 30000 } = {}) {
  return async function optionsRequest(path, { signal, body, authenticated = false } = {}) {
    const headers = { Accept: 'application/json' };
    if (authenticated) {
      const session = await getSession?.();
      if (!session?.access_token) throw new OptionsApiError('Your Options practice session is unavailable. Reload to sign in.', 'AUTH_REQUIRED', 401);
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const controller = new AbortController();
    const cancel = () => controller.abort(signal.reason);
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const response = await fetcher(`${apiBaseUrl}/options/${path}`, {
        method: body === undefined ? 'GET' : 'POST', headers,
        // The simulator uses Supabase bearer authentication, not site cookies.
        credentials: 'omit', body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const fallback = response.status === 404
          ? ['OPTIONS_ROUTE_MISSING', 'This backend does not provide the Options API. The Options backend release must be installed at the configured API URL.']
          : response.status === 401 || response.status === 403
            ? ['AUTH_REQUIRED', 'Your Options practice session expired or access was denied. Reload to sign in.']
            : response.status === 429
              ? ['RATE_LIMITED', 'Options request limit reached. Please retry shortly.']
              : ['SERVER_ERROR', `The Options server returned HTTP ${response.status}. Please retry.`];
        throw new OptionsApiError(typeof data?.error === 'string' ? data.error : fallback[1], data?.code || fallback[0], response.status);
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new OptionsApiError('The Options API returned an invalid response. Check the backend URL and route configuration.', 'INVALID_RESPONSE', response.status);
      return data;
    } catch (error) {
      if (error instanceof OptionsApiError || signal?.aborted) throw error;
      if (timedOut) throw new OptionsApiError('The Options backend request timed out. Please retry.', 'BACKEND_TIMEOUT');
      throw new OptionsApiError('Cannot reach the Options backend. Check your connection and the configured backend URL.', 'BACKEND_UNREACHABLE');
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  };
}
