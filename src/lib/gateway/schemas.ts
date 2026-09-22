import { z } from 'zod'

export const authTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  token_type: z.string().optional(),
})

export type AuthTokens = z.infer<typeof authTokensSchema>

export const usuarioSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  aud: z.string().optional(),
  exp: z.number().optional(),
})

export type UsuarioGateway = z.infer<typeof usuarioSchema>

const ROLES_BLOQUEADOS = ['gym'] as const

export function rolPermitidoEnApp(
  role: string | null | undefined,
): boolean {
  if (!role) return true
  return !(ROLES_BLOQUEADOS as readonly string[]).includes(role)
}

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(1).optional(),
})

export const recoverRequestSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
  token: z.string().regex(/^[A-Za-z0-9]{6,20}$/),
  password: z.string().min(6).max(72),
})

export const recoverResponseSchema = z.object({
  ok: z.literal(true),
  email_mode: z.string().optional(),
  dev_otp: z.string().optional(),
})

export const ejercicioPrescritoSchema = z.object({
  ejercicio_id: z.string(),
  nombre: z.string(),
  series: z.number(),
  repeticiones: z.number(),
  peso_objetivo_kg: z.number().nullable().optional(),
  descripcion: z.string(),
  pasos: z.array(z.string()),
  imagen_url: z.string(),
  gif_url: z.string().optional(),
})

export const sesionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  dia: z.string().optional(),
  estado: z.enum(['pendiente', 'en_curso', 'completada', 'hoy']),
  ejercicios: z.array(ejercicioPrescritoSchema),
  fecha: z.string().optional(),
})

export const planSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  semana_actual: z.number(),
  semanas: z.array(
    z.object({
      numero: z.number(),
      sesiones: z.array(sesionSchema),
    }),
  ),
})

export const sesionDelDiaSchema = z.object({
  sesion: sesionSchema.nullable(),
  racha_dias: z.number().nullable(),
  es_descanso: z.boolean(),
  sesion_completada_hoy: z.boolean(),
})

export const serieRegistradaSchema = z.object({
  id: z.string().optional(),
  ejercicio_id: z.string(),
  numero_serie: z.number(),
  peso_kg: z.number(),
  repeticiones: z.number(),
  confirmada: z.boolean(),
})

export const sesionHistorialSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  fecha: z.string(),
  volumen_kg: z.number(),
  ejercicios_count: z.number(),
  series: z.array(serieRegistradaSchema),
})

export const fotoProgresoSchema = z.object({
  id: z.string(),
  creada_en: z.string(),
  url: z.string(),
})

const categoriaComunidadSchema = z.enum([
  'crossfit',
  'running',
  'fuerza',
  'yoga',
  'nutricion',
  'ciclismo',
  'calistenia',
])

export const comunidadSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  categoria: categoriaComunidadSchema,
  visibilidad: z.enum(['publica', 'privada']),
  portadaUrl: z.string(),
  avatarUrl: z.string(),
  miembrosCount: z.number(),
  postsCount: z.number(),
  eventosCount: z.number(),
  reglas: z.array(z.string()),
  creadaEn: z.string(),
  liderIds: z.array(z.string()).optional(),
  esMiembro: z.boolean(),
  miRol: z.enum(['member', 'moderator', 'leader']).nullable().optional(),
  suspendido: z.boolean().optional(),
})

export type ComunidadGateway = z.infer<typeof comunidadSchema>

export const comentarioComunidadSchema = z.object({
  id: z.string(),
  postId: z.string(),
  autorId: z.string(),
  texto: z.string(),
  creadoEn: z.string(),
  autorNombre: z.string().optional(),
})

export type ComentarioComunidadGateway = z.infer<typeof comentarioComunidadSchema>

export const postComunidadSchema = z.object({
  id: z.string(),
  comunidadId: z.string(),
  autorId: z.string(),
  tipo: z.enum(['general', 'logro', 'pregunta', 'anuncio']),
  texto: z.string(),
  likes: z.array(z.string()),
  fijado: z.boolean().optional(),
  creadoEn: z.string(),
  liked: z.boolean().optional(),
  autorNombre: z.string().optional(),
  autorIniciales: z.string().optional(),
  comentarios: z.array(comentarioComunidadSchema).optional(),
})

export type PostComunidadGateway = z.infer<typeof postComunidadSchema>

export const participanteEventoSchema = z.object({
  miembroId: z.string(),
  estado: z.enum(['confirmado', 'lista_espera']),
})

export const eventoComunidadSchema = z.object({
  id: z.string(),
  comunidadId: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  lugar: z.string(),
  inicioEn: z.string(),
  finEn: z.string(),
  cupoMax: z.number().nullable(),
  participantes: z.array(participanteEventoSchema),
  estadoParticipacion: z
    .enum(['confirmado', 'lista_espera', 'ninguno'])
    .optional(),
})

export type EventoComunidadGateway = z.infer<typeof eventoComunidadSchema>

export const miembroComunidadSchema = z.object({
  id: z.string(),
  comunidadId: z.string(),
  nombre: z.string(),
  iniciales: z.string(),
  rol: z.enum(['member', 'moderator', 'leader']).optional(),
  suspendido: z.boolean().optional(),
  unidoEn: z.string(),
})

export type MiembroComunidadGateway = z.infer<typeof miembroComunidadSchema>
