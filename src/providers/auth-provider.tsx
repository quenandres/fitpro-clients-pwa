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
  getUser,
  login as gatewayLogin,
  logout as gatewayLogout,
  signup as gatewaySignup,
} from '@/lib/gateway/auth'
import { getAccessToken, clearTokens } from '@/lib/gateway/client'
import type { UsuarioGateway } from '@/lib/gateway/schemas'

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

const ROL_CLIENTE = 'client'

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
      setUser(u)
    } catch {
      clearTokens()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
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
      if (u.role && u.role !== ROL_CLIENTE) {
        await gatewayLogout()
        throw new Error('Esta app es solo para clientes. Usa la app de entrenador.')
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
