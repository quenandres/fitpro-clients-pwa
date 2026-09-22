export type SesionModalidad = 'fuerza' | 'isometrico' | 'otro'

export interface SerieEjecutada {
  n: number
  reps: number
  peso_kg: number | null
}

export interface EjercicioEjecutado {
  ejercicio_id: number
  nombre: string
  series: SerieEjecutada[]
}

/** Sesión completada normalizada para heatmap, stats y detalle. */
export interface SesionTracking {
  id: string
  fecha: string
  nombre: string
  volumen_kg: number
  series_completadas: number
  ejercicios_count: number
  modalidad: SesionModalidad
  duracion_min: number
  ejercicios: EjercicioEjecutado[]
}
