import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getUser } from '@/lib/gateway/auth'
import { getAccessToken, clearTokens } from '@/lib/gateway/client'
import { listarFotos } from '@/lib/gateway/fotos'
import { fetchHistorial, fetchPlan, fetchSesionHoy } from '@/lib/gateway/plan'
import { rolPermitidoEnApp } from '@/lib/gateway/schemas'
import { isMockMode } from '@/lib/mock-mode'
import { comunidadesKeys } from '@/lib/gateway/comunidades-hooks'

export const authUserQueryKey = ['auth', 'user'] as const
export const planQueryKey = ['plan'] as const
export const sesionHoyQueryKey = ['sesion-hoy'] as const
export const historialQueryKey = ['historial'] as const
export const progresoFotosQueryKey = ['progreso-fotos'] as const

export async function fetchAuthUser() {
  const u = await getUser()
  if (!rolPermitidoEnApp(u.role)) {
    clearTokens()
    sessionStorage.setItem('fitpro_auth_motivo', 'rol')
    throw new Error('rol_no_permitido')
  }
  return u
}

export function useAuthUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: authUserQueryKey,
    queryFn: fetchAuthUser,
    enabled: enabled && !isMockMode() && Boolean(getAccessToken()),
    retry: false,
  })
}

export function useProgresoFotos() {
  return useQuery({
    queryKey: progresoFotosQueryKey,
    queryFn: listarFotos,
  })
}

export function invalidateDomainQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: planQueryKey }),
    queryClient.invalidateQueries({ queryKey: sesionHoyQueryKey }),
    queryClient.invalidateQueries({ queryKey: historialQueryKey }),
    queryClient.invalidateQueries({ queryKey: comunidadesKeys.all }),
    queryClient.invalidateQueries({ queryKey: progresoFotosQueryKey }),
  ])
}

export function removeDomainQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: planQueryKey })
  queryClient.removeQueries({ queryKey: sesionHoyQueryKey })
  queryClient.removeQueries({ queryKey: historialQueryKey })
  queryClient.removeQueries({ queryKey: comunidadesKeys.all })
  queryClient.removeQueries({ queryKey: progresoFotosQueryKey })
  queryClient.removeQueries({ queryKey: authUserQueryKey })
}

export function usePlan() {
  return useQuery({
    queryKey: planQueryKey,
    queryFn: fetchPlan,
    retry: false,
  })
}

export function useSesionHoy() {
  return useQuery({
    queryKey: sesionHoyQueryKey,
    queryFn: fetchSesionHoy,
    retry: false,
  })
}

export function useHistorial() {
  return useQuery({
    queryKey: historialQueryKey,
    queryFn: fetchHistorial,
    retry: false,
  })
}

export function useInvalidateSesionQueries() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: planQueryKey }),
      queryClient.invalidateQueries({ queryKey: sesionHoyQueryKey }),
      queryClient.invalidateQueries({ queryKey: historialQueryKey }),
    ])
}
