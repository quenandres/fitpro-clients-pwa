import type {
  Comunidad,
  EventoComunidad,
  MiembroComunidad,
  PostComunidad,
} from '@/types/comunidad'

export const MIEMBRO_ACTUAL_ID = 'yo'

/** Marca temporal fija del prototipo (evita Date.now en render). */
export const REFERENCIA_AHORA_ISO = new Date().toISOString()

export const comunidadesMock: Comunidad[] = [
  {
    id: 'com-crossfit-box',
    nombre: 'CrossFit Box Norte',
    descripcion:
      'Comunidad de entrenamiento funcional. Compartimos WODs, PRs y quedadas de box.',
    categoria: 'crossfit',
    visibilidad: 'publica',
    colorPortada: 'oklch(0.35 0.08 150)',
    colorAvatar: 'oklch(0.505 0.132 150)',
    iniciales: 'CF',
    miembrosCount: 6,
    postsCount: 4,
    eventosCount: 2,
    reglas: [
      'Respeta a todos los miembros.',
      'No spam ni promoción externa.',
      'Solo contenido de entrenamiento.',
    ],
    creadaEn: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'com-running-club',
    nombre: 'Running Club Amanecer',
    descripcion:
      'Salidas al amanecer, planes para 10K y maratón, y apoyo mutuo.',
    categoria: 'running',
    visibilidad: 'publica',
    colorPortada: 'oklch(0.38 0.06 240)',
    colorAvatar: 'oklch(0.55 0.12 240)',
    iniciales: 'RC',
    miembrosCount: 5,
    postsCount: 3,
    eventosCount: 1,
    reglas: [
      'Puntualidad en las salidas.',
      'Equipo reflectante en salidas de madrugada.',
    ],
    creadaEn: '2026-03-10T07:30:00.000Z',
  },
  {
    id: 'com-yoga-mindful',
    nombre: 'Yoga Mindful',
    descripcion:
      'Práctica de yoga, respiración consciente y bienestar integral.',
    categoria: 'yoga',
    visibilidad: 'privada',
    colorPortada: 'oklch(0.32 0.05 300)',
    colorAvatar: 'oklch(0.5 0.1 300)',
    iniciales: 'YM',
    miembrosCount: 4,
    postsCount: 2,
    eventosCount: 1,
    reglas: ['Tono respetuoso y sin juicios.'],
    creadaEn: '2026-04-05T18:00:00.000Z',
  },
]

export const miembrosMock: MiembroComunidad[] = [
  {
    id: MIEMBRO_ACTUAL_ID,
    comunidadId: 'com-crossfit-box',
    nombre: 'Tú',
    iniciales: 'T',
    unidoEn: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'mem-ana',
    comunidadId: 'com-crossfit-box',
    nombre: 'Ana Torres',
    iniciales: 'AT',
    unidoEn: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'mem-diego',
    comunidadId: 'com-crossfit-box',
    nombre: 'Diego Ramírez',
    iniciales: 'DR',
    unidoEn: '2026-02-10T12:00:00.000Z',
  },
  {
    id: 'mem-carlos',
    comunidadId: 'com-running-club',
    nombre: 'Carlos Mendoza',
    iniciales: 'CM',
    unidoEn: '2026-03-10T07:30:00.000Z',
  },
]

export const postsMock: PostComunidad[] = [
  {
    id: 'post-1',
    comunidadId: 'com-crossfit-box',
    autorId: 'mem-ana',
    tipo: 'general',
    texto:
      '¡Bienvenidos al box! Este fin de semana WOD especial de aniversario.',
    likes: ['mem-diego'],
    fijado: true,
    creadoEn: '2026-08-19T09:00:00.000Z',
  },
  {
    id: 'post-2',
    comunidadId: 'com-crossfit-box',
    autorId: 'mem-diego',
    tipo: 'logro',
    texto: 'Nuevo PR en peso muerto: 140 kg. Gracias por el apoyo, equipo.',
    likes: ['mem-ana', 'yo'],
    creadoEn: '2026-08-21T16:40:00.000Z',
  },
  {
    id: 'post-3',
    comunidadId: 'com-crossfit-box',
    autorId: 'mem-ana',
    tipo: 'pregunta',
    texto: '¿Recomendaciones de cinturón de levantamiento para principiantes?',
    likes: [],
    creadoEn: '2026-08-22T08:50:00.000Z',
  },
  {
    id: 'post-4',
    comunidadId: 'com-running-club',
    autorId: 'mem-carlos',
    tipo: 'general',
    texto: 'Salida grupal de 10K confirmada para el sábado. ¿Quién se apunta?',
    likes: [],
    creadoEn: '2026-08-18T14:00:00.000Z',
  },
]

const futuro = new Date()
futuro.setDate(futuro.getDate() + 7)
const pasado = new Date()
pasado.setDate(pasado.getDate() - 14)

export const eventosMock: EventoComunidad[] = [
  {
    id: 'evt-1',
    comunidadId: 'com-crossfit-box',
    titulo: 'WOD de aniversario',
    descripcion:
      'Entrenamiento especial seguido de compartir entre miembros.',
    lugar: 'Box Norte, sala principal',
    inicioEn: futuro.toISOString(),
    finEn: new Date(futuro.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    cupoMax: 20,
    participantes: [
      { miembroId: 'mem-ana', estado: 'confirmado' },
      { miembroId: 'mem-diego', estado: 'confirmado' },
    ],
  },
  {
    id: 'evt-2',
    comunidadId: 'com-crossfit-box',
    titulo: 'Competencia interna por parejas',
    descripcion: 'Equipos de 2, tres WODs cronometrados.',
    lugar: 'Box Norte, patio exterior',
    inicioEn: new Date(futuro.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    finEn: new Date(futuro.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    cupoMax: null,
    participantes: [],
  },
  {
    id: 'evt-3',
    comunidadId: 'com-running-club',
    titulo: '10K por el malecón',
    descripcion: 'Ruta panorámica, ritmo moderado.',
    lugar: 'Glorieta del malecón',
    inicioEn: pasado.toISOString(),
    finEn: new Date(pasado.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    cupoMax: 15,
    participantes: [{ miembroId: 'mem-carlos', estado: 'confirmado' }],
  },
  {
    id: 'evt-4',
    comunidadId: 'com-yoga-mindful',
    titulo: 'Sesión de respiración guiada',
    descripcion: 'Pranayama y meditación de 45 minutos.',
    lugar: 'Estudio central',
    inicioEn: new Date(futuro.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    finEn: new Date(futuro.getTime() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    cupoMax: 12,
    participantes: [],
  },
]

export const ETIQUETAS_CATEGORIA: Record<
  Comunidad['categoria'],
  string
> = {
  crossfit: 'CrossFit',
  running: 'Running',
  fuerza: 'Fuerza',
  yoga: 'Yoga',
  nutricion: 'Nutrición',
  ciclismo: 'Ciclismo',
  calistenia: 'Calistenia',
}

export const ETIQUETAS_TIPO_POST: Record<PostComunidad['tipo'], string> = {
  general: 'General',
  logro: 'Logro',
  pregunta: 'Pregunta',
}
