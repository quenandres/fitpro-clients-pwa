import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  iniciarSesion,
  listarSeriesDeSesion,
} from '@/lib/gateway/series'

const iniciarPromises = new Map<string, Promise<{ id: string }>>()

export function iniciarSesionSingleFlight(planSessionId: string): Promise<{ id: string }> {
  let pending = iniciarPromises.get(planSessionId)
  if (!pending) {
    pending = iniciarSesion(planSessionId).finally(() => {
      iniciarPromises.delete(planSessionId)
    })
    iniciarPromises.set(planSessionId, pending)
  }
  return pending
}

export const sesionExecutionKey = (planSessionId: string) =>
  ['sesion', planSessionId, 'execution'] as const

export const sesionSeriesKey = (planSessionId: string, executionSessionId: string) =>
  ['sesion', planSessionId, 'series', executionSessionId] as const

export function useSesionExecution(planSessionId: string, enabled: boolean) {
  const executionQuery = useQuery({
    queryKey: sesionExecutionKey(planSessionId),
    queryFn: () => iniciarSesionSingleFlight(planSessionId),
    enabled: enabled && Boolean(planSessionId),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 1000 * 60 * 30,
    retry: false,
  })

  const executionSessionId = executionQuery.data?.id ?? null

  const seriesQuery = useQuery({
    queryKey: sesionSeriesKey(planSessionId, executionSessionId ?? ''),
    queryFn: () => listarSeriesDeSesion(executionSessionId!),
    enabled: enabled && Boolean(executionSessionId),
    staleTime: 0,
    retry: false,
  })

  return {
    executionSessionId,
    series: seriesQuery.data,
    isStarting: executionQuery.isPending,
    isLoadingSeries: seriesQuery.isPending && Boolean(executionSessionId),
    isError: executionQuery.isError || seriesQuery.isError,
    refetchSeries: seriesQuery.refetch,
  }
}

export function useInvalidateSesionSeries() {
  const queryClient = useQueryClient()
  return (planSessionId: string, executionSessionId: string) =>
    queryClient.invalidateQueries({
      queryKey: sesionSeriesKey(planSessionId, executionSessionId),
    })
}
