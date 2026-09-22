export type EstadoSesion = 'pendiente' | 'en_curso' | 'completada' | 'hoy'

export interface EjercicioPrescrito {
  ejercicio_id: string
  nombre: string
  series: number
  repeticiones: number
  peso_objetivo_kg?: number
  descripcion: string
  pasos: string[]
  imagen_url: string
  gif_url?: string
}

export interface Sesion {
  id: string
  nombre: string
  dia?: string
  estado: EstadoSesion
  ejercicios: EjercicioPrescrito[]
  fecha?: string
}

export interface SemanaPlan {
  numero: number
  sesiones: Sesion[]
}

export interface Plan {
  id: string
  nombre: string
  semana_actual: number
  semanas: SemanaPlan[]
}

export interface SerieRegistrada {
  id?: string
  ejercicio_id: string
  numero_serie: number
  peso_kg: number
  repeticiones: number
  confirmada: boolean
}

export interface SesionHistorial {
  id: string
  nombre: string
  fecha: string
  volumen_kg: number
  ejercicios_count: number
  series: SerieRegistrada[]
}

export interface FotoProgreso {
  id: string
  creada_en: string
  url: string
}

export interface SesionDelDia {
  sesion: Sesion | null
  racha_dias: number | null
  es_descanso: boolean
  sesion_completada_hoy: boolean
}
