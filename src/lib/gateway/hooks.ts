import { useQuery } from '@tanstack/react-query'
import { fetchHistorial, fetchPlan, fetchSesionHoy } from '@/lib/gateway/plan'

export function usePlan() {
  return useQuery({
    queryKey: ['plan'],
    queryFn: fetchPlan,
    retry: false,
  })
}

export function useSesionHoy() {
  return useQuery({
    queryKey: ['sesion-hoy'],
    queryFn: fetchSesionHoy,
    retry: false,
  })
}

export function useHistorial() {
  return useQuery({
    queryKey: ['historial'],
    queryFn: fetchHistorial,
    retry: false,
  })
}
