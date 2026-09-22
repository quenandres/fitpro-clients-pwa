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

const AUTH_HASH_ERROR_KEY = 'fitpro_auth_hash_error'

function clearLocationHash(): void {
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState(null, '', `${url.pathname}${url.search}`)
}

/** Guarda la sesión o el error que Supabase deja en el hash del correo. */
export function consumeSupabaseRedirect(): void {
  if (typeof window === 'undefined') return
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : ''
  if (!hash) return
  const params = new URLSearchParams(hash)
  const access = params.get('access_token')
  const refresh = params.get('refresh_token')
  if (access && refresh) {
    setTokens(access, refresh)
    clearLocationHash()
    return
  }
  const errorCode = params.get('error_code') ?? params.get('error')
  if (errorCode) {
    sessionStorage.setItem(AUTH_HASH_ERROR_KEY, errorCode)
    clearLocationHash()
  }
}

export function rememberAuthLinkError(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(AUTH_HASH_ERROR_KEY, 'otp_expired')
}

export function takeAuthHashError(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  const code = sessionStorage.getItem(AUTH_HASH_ERROR_KEY)
  if (!code) return null
  sessionStorage.removeItem(AUTH_HASH_ERROR_KEY)
  return code
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

consumeSupabaseRedirect()
