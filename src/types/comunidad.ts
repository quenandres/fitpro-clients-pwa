export type CategoriaComunidad =
  | 'crossfit'
  | 'running'
  | 'fuerza'
  | 'yoga'
  | 'nutricion'
  | 'ciclismo'
  | 'calistenia'

export type VisibilidadComunidad = 'publica' | 'privada'

export type TipoPost = 'general' | 'logro' | 'pregunta'

export type EstadoParticipacion = 'confirmado' | 'lista_espera' | 'ninguno'

export type RolComunidad = 'member' | 'moderator' | 'leader'

export interface Comunidad {
  id: string
  nombre: string
  descripcion: string
  categoria: CategoriaComunidad
  visibilidad: VisibilidadComunidad
  colorPortada: string
  colorAvatar: string
  iniciales: string
  portadaUrl?: string
  avatarUrl?: string
  miembrosCount: number
  postsCount: number
  eventosCount: number
  reglas: string[]
  creadaEn: string
  esMiembro?: boolean
  miRol?: RolComunidad | null
  suspendido?: boolean
}

export interface MiembroComunidad {
  id: string
  comunidadId: string
  nombre: string
  iniciales: string
  unidoEn: string
}

export interface PostComunidad {
  id: string
  comunidadId: string
  autorId: string
  tipo: TipoPost
  texto: string
  likes: string[]
  fijado?: boolean
  creadoEn: string
  liked?: boolean
  autorNombre?: string
  autorIniciales?: string
}

export interface ParticipanteEvento {
  miembroId: string
  estado: 'confirmado' | 'lista_espera'
}

export interface EventoComunidad {
  id: string
  comunidadId: string
  titulo: string
  descripcion: string
  lugar: string
  inicioEn: string
  finEn: string
  cupoMax: number | null
  participantes: ParticipanteEvento[]
  estadoParticipacion?: EstadoParticipacion
}
