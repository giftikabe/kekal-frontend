import { ApiError } from '@/shared/types'

const TOKEN_KEY   = 'kk_access_token'
const REFRESH_KEY = 'kk_refresh_token'

export const tokenStorage = {
  getAccess():  string | null { return localStorage.getItem(TOKEN_KEY) },
  getRefresh(): string | null { return localStorage.getItem(REFRESH_KEY) },
  setAccess(token: string)  { localStorage.setItem(TOKEN_KEY, token) },
  setRefresh(token: string) { localStorage.setItem(REFRESH_KEY, token) },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

/** Convenience wrapper used by AuthContext to check for an existing session. */
export function getAccessToken(): string | null {
  return tokenStorage.getAccess()
}

/** Store or clear both tokens in one call. Pass null/null to log out. */
export function setTokens(accessToken: string | null, refreshToken: string | null): void {
  if (accessToken && refreshToken) {
    tokenStorage.setAccess(accessToken)
    tokenStorage.setRefresh(refreshToken)
  } else {
    tokenStorage.clear()
  }
}

export { ApiError }

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    console.warn('[api] VITE_API_URL is not set — falling back to empty string')
  }
  return (url ?? '').replace(/\/$/, '')
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Omit the Authorization header entirely (e.g. /api/auth/login, which has no session yet). */
  skipAuth?: boolean
  /** Still attach the Authorization header if present, but never attempt a refresh-and-retry on 401 (e.g. /api/auth/logout). */
  skipAuthRetry?: boolean
  /** Internal flag — set to true on the retry to prevent infinite loops */
  _isRetry?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, skipAuthRetry, _isRetry, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined ?? {}),
  }

  if (!skipAuth) {
    const token = tokenStorage.getAccess()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && !_isRetry && !skipAuth && !skipAuthRetry) {
    const refreshToken = tokenStorage.getRefresh()
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshRes.ok) {
          // NOTE: assumes this endpoint returns the token bare, matching every
          // other endpoint in this app — flagged for confirmation, see chat.
          const refreshData = await refreshRes.json() as { accessToken: string }
          tokenStorage.setAccess(refreshData.accessToken)
          return request<T>(path, { ...options, _isRetry: true })
        }
      } catch {
        // Refresh failed — fall through to throw the original 401
      }
    }
    tokenStorage.clear()
    throw new ApiError('Session expired. Please log in again.', 'UNAUTHORIZED', 401)
  }

  let json: unknown
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    json = await response.json()
  }

  if (!response.ok) {
    const errJson = json as { error?: { message?: string; code?: string } } | undefined
    const message = errJson?.error?.message ?? response.statusText
    const code    = errJson?.error?.code    ?? 'API_ERROR'
    throw new ApiError(message, code, response.status)
  }

  return json as T
}

export function get<T>(path: string, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' })
}
export function post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'POST', body })
}
export function patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'PATCH', body })
}
export function del<T>(path: string, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' })
}
export function put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body' | 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'PUT', body })
}

export const apiClient = { get, post, patch, put, delete: del }