import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchHistorial, fetchPlan, fetchSesionHoy } from '@/lib/gateway/plan'

export const planQueryKey = ['plan'] as const
export const sesionHoyQueryKey = ['sesion-hoy'] as const
export const historialQueryKey = ['historial'] as const

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
