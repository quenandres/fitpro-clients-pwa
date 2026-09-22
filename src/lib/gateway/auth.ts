import {
  authTokensSchema,
  loginRequestSchema,
  signupRequestSchema,
  usuarioSchema,
  type AuthTokens,
  type UsuarioGateway,
} from '@/lib/gateway/schemas'
import {
  clearTokens,
  gatewayFetch,
  getRefreshToken,
  setTokens,
} from '@/lib/gateway/client'

export async function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const body = loginRequestSchema.parse({ email, password })
  const data = await gatewayFetch<unknown>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  })
  const tokens = authTokensSchema.parse(data)
  setTokens(tokens.access_token, tokens.refresh_token)
  return tokens
}

export async function signup(
  email: string,
  password: string,
): Promise<{ tokens: AuthTokens | null; needsEmailConfirmation: boolean }> {
  const body = signupRequestSchema.parse({ email, password })
  const data = await gatewayFetch<Record<string, unknown>>('/api/auth/signup', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      app: 'client',
      full_name: body.nombre ?? '',
    }),
  })

  const hasTokens =
    typeof data.access_token === 'string' &&
    typeof data.refresh_token === 'string'

  if (hasTokens) {
    const tokens = authTokensSchema.parse(data)
    setTokens(tokens.access_token, tokens.refresh_token)
    return { tokens, needsEmailConfirmation: false }
  }

  return { tokens: null, needsEmailConfirmation: true }
}

export async function logout(): Promise<void> {
  try {
    await gatewayFetch<void>('/api/auth/logout', { method: 'POST' })
  } finally {
    clearTokens()
  }
}

export async function getUser(): Promise<UsuarioGateway> {
  const data = await gatewayFetch<unknown>('/api/auth/user')
  return usuarioSchema.parse(data)
}

export async function acceptInvite(
  tokenHash: string,
  type: string,
): Promise<AuthTokens> {
  const data = await gatewayFetch<unknown>('/api/auth/accept-invite', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ token_hash: tokenHash, type }),
  })
  const tokens = authTokensSchema.parse(data)
  setTokens(tokens.access_token, tokens.refresh_token)
  return tokens
}

export async function refreshSession(): Promise<AuthTokens | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  const data = await gatewayFetch<unknown>('/api/auth/refresh', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refresh_token: refresh }),
  })
  const tokens = authTokensSchema.parse(data)
  setTokens(tokens.access_token, tokens.refresh_token)
  return tokens
}
