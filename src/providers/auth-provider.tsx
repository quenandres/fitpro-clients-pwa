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
  signup as gatewaySignup,
} from '@/lib/gateway/auth'
import { getAccessToken, clearTokens } from '@/lib/gateway/client'
import { rolPermitidoEnApp, type UsuarioGateway } from '@/lib/gateway/schemas'

export type AuthState = {
  user: UsuarioGateway | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<UsuarioGateway | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      return
    }
    try {
      const u = await getUser()
      if (!rolPermitidoEnApp(u.role)) {
        clearTokens()
        setUser(null)
        sessionStorage.setItem('fitpro_auth_motivo', 'rol')
        return
      }
      setUser(u)
    } catch {
      clearTokens()
      setUser(null)
    }
  }, [])

  useEffect(() => {
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
          // El enlace venció: la pantalla de login muestra el formulario.
        }
      }
      await refreshUser()
      if (!cancelled) setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      await gatewayLogin(email, password)
      const u = await getUser()
      if (!rolPermitidoEnApp(u.role)) {
        await gatewayLogout()
        throw new Error('Esta app no está disponible para este tipo de cuenta.')
      }
      setUser(u)
      queryClient.clear()
    },
    [queryClient],
  )

  const signup = useCallback(
    async (email: string, password: string) => {
      const { needsEmailConfirmation, tokens } = await gatewaySignup(
        email,
        password,
      )
      if (tokens) {
        const u = await getUser()
        setUser(u)
        queryClient.clear()
      }
      return { needsEmailConfirmation }
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await gatewayLogout()
    } catch {
      clearTokens()
    }
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
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
