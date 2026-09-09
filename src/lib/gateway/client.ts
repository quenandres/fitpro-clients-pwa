import { GatewayError } from '@/lib/gateway/errors'

const ACCESS_KEY = 'fitpro_access_token'
const REFRESH_KEY = 'fitpro_refresh_token'

export function getGatewayUrl(): string {
  const url = import.meta.env.VITE_GATEWAY_URL
  if (!url) {
    throw new GatewayError(
      'VITE_GATEWAY_URL no está configurada. Copia .env.example a .env.',
      0,
    )
  }
  return url.replace(/\/$/, '')
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

type FetchOptions = RequestInit & {
  auth?: boolean
  skipRefresh?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  const res = await fetch(`${getGatewayUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  })

  if (!res.ok) {
    clearTokens()
    return null
  }

  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
  }
  setTokens(data.access_token, data.refresh_token ?? refresh)
  return data.access_token
}

export async function gatewayFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, skipRefresh = false, headers, ...rest } = options
  const url = `${getGatewayUrl()}${path}`

  const buildHeaders = (token: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token && auth ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  })

  let token = auth ? getAccessToken() : null
  let res = await fetch(url, { ...rest, headers: buildHeaders(token) })

  if (res.status === 401 && auth && !skipRefresh) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }
    token = await refreshPromise
    if (token) {
      res = await fetch(url, { ...rest, headers: buildHeaders(token) })
    }
  }

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new GatewayError(
      `Error ${res.status} en ${path}`,
      res.status,
      body,
    )
  }

  return body as T
}
