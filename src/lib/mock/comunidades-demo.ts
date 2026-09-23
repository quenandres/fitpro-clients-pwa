import type {
  ComunidadGateway,
  EventoComunidadGateway,
  MiembroComunidadGateway,
  PostComunidadGateway,
} from '@/lib/gateway/schemas'
import { DEMO_CLIENT_USER } from '@/lib/mock-mode'
import type { TabExplorar } from '@/lib/gateway/comunidades'
import type { RolComunidad, TipoPost } from '@/types/comunidad'

const DEMO_USER_ID = DEMO_CLIENT_USER.id

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" fill="%2316a34a"><rect width="400" height="200"/></svg>',
  )

function isoDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(18, 0, 0, 0)
  return d.toISOString()
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function cloneComunidades(): ComunidadGateway[] {
  return [
    {
      id: 'demo-com-fuerza',
      nombre: 'Fuerza CDMX',
      descripcion:
        'Comunidad de entrenamiento de fuerza en Ciudad de México. Técnica, progresión y apoyo entre miembros.',
      categoria: 'fuerza',
      visibilidad: 'publica',
      portadaUrl: PLACEHOLDER,
      avatarUrl: PLACEHOLDER,
      miembrosCount: 128,
      postsCount: 2,
      eventosCount: 1,
      reglas: ['Respeta la técnica', 'Sin spam', 'Apoya a quien empieza'],
      creadaEn: isoDaysAgo(90),
      liderIds: ['demo-leader-laura'],
      esMiembro: true,
      miRol: 'member',
      suspendido: false,
    },
    {
      id: 'demo-com-running',
      nombre: 'Running matutino',
      descripcion:
        'Salidas en grupo antes del trabajo. Ritmos moderados y café después.',
      categoria: 'running',
      visibilidad: 'publica',
      portadaUrl: PLACEHOLDER,
      avatarUrl: PLACEHOLDER,
      miembrosCount: 64,
      postsCount: 1,
      eventosCount: 1,
      reglas: ['Puntualidad', 'Hidratación'],
      creadaEn: isoDaysAgo(45),
      esMiembro: false,
      miRol: null,
      suspendido: false,
    },
  ]
}

type DemoState = {
  comunidades: ComunidadGateway[]
  posts: PostComunidadGateway[]
  eventos: EventoComunidadGateway[]
  miembros: MiembroComunidadGateway[]
}

let state: DemoState | null = null

function ensureState(): DemoState {
  if (!state) {
    const comunidades = cloneComunidades()
    state = {
      comunidades,
      posts: [
        {
          id: 'post-1',
          comunidadId: 'demo-com-fuerza',
          autorId: 'demo-leader-laura',
          tipo: 'anuncio',
          texto: 'Este sábado técnica de sentadilla en el box central. Trae zapatilla plana.',
          likes: ['demo-m1', 'demo-m2'],
          fijado: true,
          creadoEn: isoDaysAgo(2),
          liked: false,
          autorNombre: 'Laura Méndez',
          autorIniciales: 'LM',
          comentarios: [
            {
              id: 'c-1',
              postId: 'post-1',
              autorId: DEMO_USER_ID,
              texto: '¡Ahí estaré!',
              creadoEn: isoDaysAgo(1),
              autorNombre: 'Valentina Ruiz',
            },
          ],
        },
        {
          id: 'post-2',
          comunidadId: 'demo-com-fuerza',
          autorId: DEMO_USER_ID,
          tipo: 'logro',
          texto: 'Nuevo PR en sentadilla: 70 kg × 5. Gracias por los tips de la semana pasada.',
          likes: ['demo-leader-laura'],
          creadoEn: isoDaysAgo(4),
          liked: true,
          autorNombre: 'Valentina Ruiz',
          autorIniciales: 'VR',
          comentarios: [],
        },
        {
          id: 'post-3',
          comunidadId: 'demo-com-running',
          autorId: 'demo-run-mod',
          tipo: 'general',
          texto: 'Ruta del domingo: 8 km por el parque. Salida 6:30.',
          likes: [],
          creadoEn: isoDaysAgo(3),
          liked: false,
          autorNombre: 'Marco Reyes',
          autorIniciales: 'MR',
          comentarios: [],
        },
      ],
      eventos: [
        {
          id: 'ev-1',
          comunidadId: 'demo-com-fuerza',
          titulo: 'Clínica de sentadilla',
          descripcion: 'Revisión de profundidad y bracing en grupos de 4.',
          lugar: 'Gimnasio Centro — plataformas',
          inicioEn: isoDaysFromNow(3),
          finEn: isoDaysFromNow(3),
          cupoMax: 16,
          participantes: [
            { miembroId: DEMO_USER_ID, estado: 'confirmado' },
            { miembroId: 'demo-m1', estado: 'confirmado' },
          ],
          estadoParticipacion: 'confirmado',
        },
        {
          id: 'ev-2',
          comunidadId: 'demo-com-running',
          titulo: 'Rodaje suave 8 km',
          descripcion: 'Ritmo conversacional, hidratación en km 4.',
          lugar: 'Parque México',
          inicioEn: isoDaysFromNow(5),
          finEn: isoDaysFromNow(5),
          cupoMax: 30,
          participantes: [],
          estadoParticipacion: 'ninguno',
        },
        {
          id: 'ev-past',
          comunidadId: 'demo-com-fuerza',
          titulo: 'Meetup de progresión',
          descripcion: 'Sesión cerrada del mes pasado.',
          lugar: 'Sala B',
          inicioEn: isoDaysAgo(14),
          finEn: isoDaysAgo(14),
          cupoMax: 20,
          participantes: [{ miembroId: DEMO_USER_ID, estado: 'confirmado' }],
          estadoParticipacion: 'confirmado',
        },
      ],
      miembros: [
        {
          id: 'demo-leader-laura',
          comunidadId: 'demo-com-fuerza',
          nombre: 'Laura Méndez',
          iniciales: 'LM',
          rol: 'leader',
          unidoEn: isoDaysAgo(120),
        },
        {
          id: DEMO_USER_ID,
          comunidadId: 'demo-com-fuerza',
          nombre: 'Valentina Ruiz',
          iniciales: 'VR',
          rol: 'member',
          unidoEn: isoDaysAgo(30),
        },
        {
          id: 'demo-m1',
          comunidadId: 'demo-com-fuerza',
          nombre: 'Andrea Solís',
          iniciales: 'AS',
          rol: 'member',
          unidoEn: isoDaysAgo(60),
        },
        {
          id: 'demo-run-mod',
          comunidadId: 'demo-com-running',
          nombre: 'Marco Reyes',
          iniciales: 'MR',
          rol: 'moderator',
          unidoEn: isoDaysAgo(40),
        },
      ],
    }
  }
  return state
}

export function resetComunidadesDemoState(): void {
  state = null
}

function findComunidad(id: string): ComunidadGateway {
  const c = ensureState().comunidades.find((x) => x.id === id)
  if (!c) throw new Error('Comunidad no encontrada')
  return c
}

export function demoFetchComunidades(params: {
  tab?: TabExplorar
  q?: string
}): ComunidadGateway[] {
  const s = ensureState()
  let list = [...s.comunidades]
  const tab = params.tab ?? 'para-ti'
  if (tab === 'mis') {
    list = list.filter((c) => c.esMiembro)
  } else if (tab === 'descubrir') {
    list = list.filter((c) => !c.esMiembro)
  }
  const q = params.q?.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q),
    )
  }
  return list
}

export function demoFetchComunidad(id: string): ComunidadGateway {
  return { ...findComunidad(id) }
}

export function demoJoinComunidad(id: string): ComunidadGateway {
  const c = findComunidad(id)
  if (!c.esMiembro) {
    c.esMiembro = true
    c.miRol = 'member'
    c.miembrosCount += 1
    ensureState().miembros.push({
      id: DEMO_USER_ID,
      comunidadId: id,
      nombre: DEMO_CLIENT_USER.full_name ?? 'Valentina Ruiz',
      iniciales: 'VR',
      rol: 'member',
      unidoEn: new Date().toISOString(),
    })
  }
  return { ...c }
}

export function demoLeaveComunidad(id: string): void {
  const c = findComunidad(id)
  if (c.esMiembro) {
    c.esMiembro = false
    c.miRol = null
    c.miembrosCount = Math.max(0, c.miembrosCount - 1)
    const s = ensureState()
    s.miembros = s.miembros.filter(
      (m) => !(m.comunidadId === id && m.id === DEMO_USER_ID),
    )
  }
}

export function demoFetchPublicaciones(
  comunidadId: string,
): PostComunidadGateway[] {
  return ensureState()
    .posts.filter((p) => p.comunidadId === comunidadId)
    .map((p) => ({
      ...p,
      likes: [...p.likes],
      comentarios: p.comentarios?.map((c) => ({ ...c })),
    }))
}

export function demoCreatePublicacion(
  comunidadId: string,
  body: { texto: string; tipo: TipoPost },
): PostComunidadGateway {
  const post: PostComunidadGateway = {
    id: `post-${Date.now()}`,
    comunidadId,
    autorId: DEMO_USER_ID,
    tipo: body.tipo,
    texto: body.texto,
    likes: [],
    creadoEn: new Date().toISOString(),
    liked: false,
    autorNombre: DEMO_CLIENT_USER.full_name ?? 'Valentina Ruiz',
    autorIniciales: 'VR',
    comentarios: [],
  }
  ensureState().posts.unshift(post)
  findComunidad(comunidadId).postsCount += 1
  return { ...post }
}

export function demoToggleReaccion(
  comunidadId: string,
  postId: string,
): PostComunidadGateway {
  const post = ensureState().posts.find(
    (p) => p.comunidadId === comunidadId && p.id === postId,
  )
  if (!post) throw new Error('Publicación no encontrada')
  const idx = post.likes.indexOf(DEMO_USER_ID)
  if (idx >= 0) {
    post.likes.splice(idx, 1)
    post.liked = false
  } else {
    post.likes.push(DEMO_USER_ID)
    post.liked = true
  }
  return {
    ...post,
    likes: [...post.likes],
    comentarios: post.comentarios?.map((c) => ({ ...c })),
  }
}

export function demoCreateComentario(
  comunidadId: string,
  postId: string,
  texto: string,
): PostComunidadGateway {
  const post = ensureState().posts.find(
    (p) => p.comunidadId === comunidadId && p.id === postId,
  )
  if (!post) throw new Error('Publicación no encontrada')
  const comentarios = post.comentarios ?? []
  comentarios.push({
    id: `c-${Date.now()}`,
    postId,
    autorId: DEMO_USER_ID,
    texto,
    creadoEn: new Date().toISOString(),
    autorNombre: DEMO_CLIENT_USER.full_name ?? 'Valentina Ruiz',
  })
  post.comentarios = comentarios
  return {
    ...post,
    likes: [...post.likes],
    comentarios: comentarios.map((c) => ({ ...c })),
  }
}

export function demoUpdatePublicacion(
  comunidadId: string,
  postId: string,
  body: { fijado?: boolean },
): PostComunidadGateway {
  const post = ensureState().posts.find(
    (p) => p.comunidadId === comunidadId && p.id === postId,
  )
  if (!post) throw new Error('Publicación no encontrada')
  if (body.fijado !== undefined) post.fijado = body.fijado
  return {
    ...post,
    likes: [...post.likes],
    comentarios: post.comentarios?.map((c) => ({ ...c })),
  }
}

export function demoDeletePublicacion(
  comunidadId: string,
  postId: string,
): void {
  const s = ensureState()
  s.posts = s.posts.filter(
    (p) => !(p.comunidadId === comunidadId && p.id === postId),
  )
  const c = findComunidad(comunidadId)
  c.postsCount = Math.max(0, c.postsCount - 1)
}

export function demoFetchEventos(
  comunidadId: string,
  estado: 'proximos' | 'pasados',
): EventoComunidadGateway[] {
  const now = Date.now()
  return ensureState()
    .eventos.filter((e) => e.comunidadId === comunidadId)
    .filter((e) => {
      const t = new Date(e.inicioEn).getTime()
      return estado === 'proximos' ? t >= now : t < now
    })
    .map((e) => ({
      ...e,
      participantes: [...e.participantes],
    }))
}

export function demoFetchEvento(
  comunidadId: string,
  eventoId: string,
): EventoComunidadGateway {
  const ev = ensureState().eventos.find(
    (e) => e.comunidadId === comunidadId && e.id === eventoId,
  )
  if (!ev) throw new Error('Evento no encontrado')
  return { ...ev, participantes: [...ev.participantes] }
}

export function demoCreateEvento(
  comunidadId: string,
  body: {
    titulo: string
    descripcion?: string
    lugar?: string
    inicioEn: string
    finEn: string
    cupoMax?: number | null
  },
): EventoComunidadGateway {
  const ev: EventoComunidadGateway = {
    id: `ev-${Date.now()}`,
    comunidadId,
    titulo: body.titulo,
    descripcion: body.descripcion ?? '',
    lugar: body.lugar ?? '',
    inicioEn: body.inicioEn,
    finEn: body.finEn,
    cupoMax: body.cupoMax ?? null,
    participantes: [],
    estadoParticipacion: 'ninguno',
  }
  ensureState().eventos.push(ev)
  findComunidad(comunidadId).eventosCount += 1
  return { ...ev }
}

export function demoDeleteEvento(comunidadId: string, eventoId: string): void {
  const s = ensureState()
  s.eventos = s.eventos.filter(
    (e) => !(e.comunidadId === comunidadId && e.id === eventoId),
  )
  const c = findComunidad(comunidadId)
  c.eventosCount = Math.max(0, c.eventosCount - 1)
}

export function demoConfirmarEvento(
  comunidadId: string,
  eventoId: string,
): EventoComunidadGateway {
  const ev = demoFetchEvento(comunidadId, eventoId)
  if (!ev.participantes.some((p) => p.miembroId === DEMO_USER_ID)) {
    ev.participantes.push({ miembroId: DEMO_USER_ID, estado: 'confirmado' })
  }
  const stored = ensureState().eventos.find((e) => e.id === eventoId)!
  stored.participantes = [...ev.participantes]
  stored.estadoParticipacion = 'confirmado'
  return demoFetchEvento(comunidadId, eventoId)
}

export function demoCancelarEvento(
  comunidadId: string,
  eventoId: string,
): EventoComunidadGateway {
  const stored = ensureState().eventos.find(
    (e) => e.comunidadId === comunidadId && e.id === eventoId,
  )
  if (!stored) throw new Error('Evento no encontrado')
  stored.participantes = stored.participantes.filter(
    (p) => p.miembroId !== DEMO_USER_ID,
  )
  stored.estadoParticipacion = 'ninguno'
  return demoFetchEvento(comunidadId, eventoId)
}

export function demoFetchMiembros(
  comunidadId: string,
): MiembroComunidadGateway[] {
  return ensureState()
    .miembros.filter((m) => m.comunidadId === comunidadId)
    .map((m) => ({ ...m }))
}

export function demoUpdateMiembro(
  comunidadId: string,
  userId: string,
  body: { rol?: RolComunidad; suspendido?: boolean },
): MiembroComunidadGateway {
  const m = ensureState().miembros.find(
    (x) => x.comunidadId === comunidadId && x.id === userId,
  )
  if (!m) throw new Error('Miembro no encontrado')
  if (body.rol !== undefined) m.rol = body.rol
  if (body.suspendido !== undefined) m.suspendido = body.suspendido
  return { ...m }
}

export function demoRemoveMiembro(comunidadId: string, userId: string): void {
  const s = ensureState()
  s.miembros = s.miembros.filter(
    (m) => !(m.comunidadId === comunidadId && m.id === userId),
  )
  const c = findComunidad(comunidadId)
  c.miembrosCount = Math.max(0, c.miembrosCount - 1)
}
