import type { TrackingPeriod } from '@/lib/tracking/utils'

export type HistorialSearch = {
  period: TrackingPeriod
  fecha?: string
}

export const HISTORIAL_SEARCH_DEFAULT: HistorialSearch = {
  period: 'semana',
}
