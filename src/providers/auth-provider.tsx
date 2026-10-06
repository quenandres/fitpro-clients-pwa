import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  acceptInvite,
  getUser,
  login as gatewayLogin,
  logout as gatewayLogout,
  resetPassword as gatewayResetPassword,
  signup as gatewaySignup,
} from '@/lib/gateway/auth'
import {
  authUserQueryKey,
  fetchAuthUser,
  invalidateDomainQueries,
  removeDomainQueries,
  useAuthUserQuery,
} from '@/lib/gateway/hooks'
import {
  getAccessToken,
  clearTokens,
  rememberAuthLinkError,
} from '@/lib/gateway/client'
import { rolPermitidoEnApp, type UsuarioGateway } from '@/lib/gateway/schemas'
import {
  DEMO_CLIENT_USER,
  isMockMode,
} from '@/lib/mock-mode'

export type AuthState = {
  user: UsuarioGateway | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>
  resetPassword: (
    email: string,
    token: string,
    password: string,
  ) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const mock = isMockMode()
  const [mockUser, setMockUser] = useState<UsuarioGateway | null>(() =>
    mock ? DEMO_CLIENT_USER : null,
  )
  const [inviteHandled, setInviteHandled] = useState(mock)

  useEffect(() => {
    if (mock) return
    let cancelled = false
    void (async () => {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')
      if (tokenHash && type) {
        try {
          await acceptInvite(tokenHash, type)
          const url = new URL(window.location.href)
          url.searchParams.delete('token_hash')
          url.searchParams.delete('type')
          window.history.replaceState(null, '', `${url.pathname}${url.search}`)
        } catch {
          rememberAuthLinkError()
        }
      }
      if (!cancelled) setInviteHandled(true)
    })()
    return () => {
      cancelled = true
    }
  }, [mock])

  const authQuery = useAuthUserQuery(inviteHandled)

  const user = mock
    ? mockUser
    : authQuery.data ?? (authQuery.isError ? null : null)

  const isLoading = mock
    ? false
    : !inviteHandled ||
      (Boolean(getAccessToken()) && authQuery.isPending && !authQuery.isFetched)

  const refreshUser = useCallback(async () => {
    if (mock) {
      setMockUser(DEMO_CLIENT_USER)
      return
    }
    if (!getAccessToken()) {
      queryClient.setQueryData(authUserQueryKey, null)
      return
    }
    await queryClient.invalidateQueries({ queryKey: authUserQueryKey })
  }, [mock, queryClient])

  const login = useCallback(
    async (email: string, password: string) => {
      if (mock) {
        setMockUser(DEMO_CLIENT_USER)
        await invalidateDomainQueries(queryClient)
        return
      }
      await gatewayLogin(email, password)
      const u = await fetchAuthUser()
      queryClient.setQueryData(authUserQueryKey, u)
      await invalidateDomainQueries(queryClient)
    },
    [mock, queryClient],
  )

  const signup = useCallback(
    async (email: string, password: string) => {
      if (mock) {
        setMockUser(DEMO_CLIENT_USER)
        await invalidateDomainQueries(queryClient)
        return { needsEmailConfirmation: false }
      }
      const { needsEmailConfirmation, tokens } = await gatewaySignup(
        email,
        password,
      )
      if (tokens) {
        const u = await getUser()
        if (!rolPermitidoEnApp(u.role)) {
          await gatewayLogout()
          throw new Error('Esta app no está disponible para este tipo de cuenta.')
        }
        queryClient.setQueryData(authUserQueryKey, u)
        await invalidateDomainQueries(queryClient)
      }
      return { needsEmailConfirmation }
    },
    [mock, queryClient],
  )

  const resetPassword = useCallback(
    async (email: string, token: string, password: string) => {
      if (mock) {
        setMockUser(DEMO_CLIENT_USER)
        await invalidateDomainQueries(queryClient)
        return
      }
      await gatewayResetPassword(email, token, password)
      const u = await fetchAuthUser()
      queryClient.setQueryData(authUserQueryKey, u)
      await invalidateDomainQueries(queryClient)
    },
    [mock, queryClient],
  )

  const logout = useCallback(async () => {
    if (mock) {
      clearTokens()
      setMockUser(DEMO_CLIENT_USER)
      removeDomainQueries(queryClient)
      return
    }
    try {
      await gatewayLogout()
    } catch {
      clearTokens()
    }
    removeDomainQueries(queryClient)
  }, [mock, queryClient])

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    resetPassword,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook del provider
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
