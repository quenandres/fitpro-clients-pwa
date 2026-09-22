import type {
  EjercicioPrescrito,
  Plan,
  Sesion,
  SesionDelDia,
  SesionHistorial,
} from '@/types/dominio'

export const SESION_HOY_ID = 'sesion-hoy-001'

const demo = {
  sentadilla: {
    descripcion:
      'Baja sentándote hacia atrás, con la barra firme sobre la espalda. Rodillas al mismo rumbo que los pies.',
    pasos: [
      'Pies al ancho de hombros y barra apoyada en la espalda alta.',
      'Inhala, baja controlado hasta muslos paralelos al suelo.',
      'Empuja el suelo y sube sin perder la espalda neutra.',
    ],
    imagen_url: '/ejercicios/sentadilla.svg',
  },
  rdl: {
    descripcion:
      'Bisagra de cadera: empuja el culo atrás y baja la barra pegada a las piernas. La espalda no se redondea.',
    pasos: [
      'Barra a la altura de los muslos, rodillas blandas.',
      'Lleva la cadera atrás hasta sentir el isquio.',
      'Vuelve apretando glúteos, sin hiperextender la lumbar.',
    ],
    imagen_url: '/ejercicios/rdl.svg',
  },
  prensa: {
    descripcion:
      'Pies a media plataforma, baja hasta 90° y empuja sin bloquear las rodillas de golpe.',
    pasos: [
      'Espalda y lumbar pegadas al respaldo.',
      'Baja lento; las rodillas no se cierran hacia adentro.',
      'Empuja por el talón y deja un leve flex al final.',
    ],
    imagen_url: '/ejercicios/prensa.svg',
  },
  curl: {
    descripcion:
      'Codos fijos al costado. Sube el peso sin balancear el torso y baja en tres tiempos.',
    pasos: [
      'Hombros abajo, codos pegados al cuerpo.',
      'Sube hasta contraer el bíceps arriba.',
      'Baja controlado; no sueltes el peso.',
    ],
    imagen_url: '/ejercicios/curl.svg',
  },
  banca: {
    descripcion:
      'Escápulas juntas, pies en el suelo. Baja la barra al pecho y empuja en línea recta.',
    pasos: [
      'Agarre un poco más ancho que los hombros.',
      'Baja tocando el pecho sin rebotar.',
      'Empuja y bloquea arriba con control.',
    ],
    imagen_url: '/ejercicios/banca.svg',
  },
  dominadas: {
    descripcion:
      'Cuelga activo: omóplatos abajo. Tira el pecho a la barra y baja hasta extensión casi completa.',
    pasos: [
      'Agarre prono al ancho de hombros.',
      'Tira de los codos hacia las costillas.',
      'Baja lento; no te sueltes de golpe.',
    ],
    imagen_url: '/ejercicios/dominadas.svg',
  },
  militar: {
    descripcion:
      'Barra a la altura de las clavículas. Empuja arriba sin arquear la lumbar; cabeza pasa cuando la barra sube.',
    pasos: [
      'Core firme y glúteos apretados.',
      'Empuja en vertical, no hacia adelante.',
      'Baja controlado hasta las clavículas.',
    ],
    imagen_url: '/ejercicios/militar.svg',
  },
}

const ejerciciosBase = [
  {
    ejercicio_id: 'ej-001',
    nombre: 'Sentadilla con barra',
    series: 4,
    repeticiones: 8,
    peso_objetivo_kg: 60,
    ...demo.sentadilla,
  },
  {
    ejercicio_id: 'ej-002',
    nombre: 'Peso muerto rumano',
    series: 3,
    repeticiones: 10,
    peso_objetivo_kg: 50,
    ...demo.rdl,
  },
  {
    ejercicio_id: 'ej-003',
    nombre: 'Prensa de piernas',
    series: 3,
    repeticiones: 12,
    peso_objetivo_kg: 100,
    ...demo.prensa,
  },
  {
    ejercicio_id: 'ej-004',
    nombre: 'Curl de bíceps',
    series: 3,
    repeticiones: 12,
    peso_objetivo_kg: 12,
    ...demo.curl,
  },
]

export const sesionHoy: Sesion = {
  id: SESION_HOY_ID,
  nombre: 'Piernas — fuerza',
  dia: 'Miércoles',
  estado: 'hoy',
  ejercicios: ejerciciosBase,
}

export const planMock: Plan = {
  id: 'plan-001',
  nombre: 'Hipertrofia 4 días',
  semana_actual: 2,
  semanas: [
    {
      numero: 1,
      sesiones: [
        {
          id: 'ses-101',
          nombre: 'Pecho y tríceps',
          dia: 'Lunes',
          estado: 'completada',
          ejercicios: [
            {
              ejercicio_id: 'ej-010',
              nombre: 'Press banca',
              series: 4,
              repeticiones: 8,
              peso_objetivo_kg: 70,
              ...demo.banca,
            },
          ],
        },
        {
          id: 'ses-102',
          nombre: 'Espalda y bíceps',
          dia: 'Martes',
          estado: 'completada',
          ejercicios: [
            {
              ejercicio_id: 'ej-011',
              nombre: 'Dominadas',
              series: 4,
              repeticiones: 6,
              ...demo.dominadas,
            },
          ],
        },
      ],
    },
    {
      numero: 2,
      sesiones: [
        {
          ...sesionHoy,
          estado: 'hoy',
        },
        {
          id: 'ses-201',
          nombre: 'Hombros y core',
          dia: 'Viernes',
          estado: 'pendiente',
          ejercicios: [
            {
              ejercicio_id: 'ej-020',
              nombre: 'Press militar',
              series: 4,
              repeticiones: 8,
              peso_objetivo_kg: 40,
              ...demo.militar,
            },
          ],
        },
      ],
    },
  ],
}

export const sesionDelDiaMock: SesionDelDia = {
  sesion: sesionHoy,
  racha_dias: 12,
  es_descanso: false,
  sesion_completada_hoy: false,
}

export type PeriodoHoy = 'semana' | 'mes' | 'trimestre' | 'anio'

export type ProgresoHoy = {
  volumen_kg: number
  delta_volumen_pct: number
  barras: { etiqueta: string; valor: number }[]
  destacadoIndex: number
  carga_kg: number
  delta_carga_kg: number
  carga_puntos: number[]
  meta_semanal_pct: number
  mejor_dia: string
  mejor_volumen_kg: number
}

export const progresoHoyMock: Record<PeriodoHoy, ProgresoHoy> = {
  semana: {
    volumen_kg: 14200,
    delta_volumen_pct: -8,
    barras: [
      { etiqueta: 'L', valor: 1800 },
      { etiqueta: 'M', valor: 2100 },
      { etiqueta: 'X', valor: 1600 },
      { etiqueta: 'J', valor: 2400 },
      { etiqueta: 'V', valor: 2800 },
      { etiqueta: 'S', valor: 900 },
      { etiqueta: 'D', valor: 0 },
    ],
    destacadoIndex: 4,
    carga_kg: 72.4,
    delta_carga_kg: -1.2,
    carga_puntos: [73.6, 73.2, 72.9, 72.4],
    meta_semanal_pct: 68,
    mejor_dia: 'Viernes',
    mejor_volumen_kg: 1820,
  },
  mes: {
    volumen_kg: 54800,
    delta_volumen_pct: 6,
    barras: [
      { etiqueta: 'S1', valor: 12200 },
      { etiqueta: 'S2', valor: 14100 },
      { etiqueta: 'S3', valor: 13600 },
      { etiqueta: 'S4', valor: 14900 },
    ],
    destacadoIndex: 3,
    carga_kg: 74.0,
    delta_carga_kg: 1.6,
    carga_puntos: [72.4, 73.1, 73.6, 74.0],
    meta_semanal_pct: 75,
    mejor_dia: 'Semana 4',
    mejor_volumen_kg: 14900,
  },
  trimestre: {
    volumen_kg: 158400,
    delta_volumen_pct: 11,
    barras: [
      { etiqueta: 'Jul', valor: 48200 },
      { etiqueta: 'Ago', valor: 52100 },
      { etiqueta: 'Sep', valor: 58100 },
    ],
    destacadoIndex: 2,
    carga_kg: 76.0,
    delta_carga_kg: 3.6,
    carga_puntos: [72.4, 74.0, 75.2, 76.0],
    meta_semanal_pct: 71,
    mejor_dia: 'Septiembre',
    mejor_volumen_kg: 58100,
  },
  anio: {
    volumen_kg: 512000,
    delta_volumen_pct: 14,
    barras: [
      { etiqueta: 'E', valor: 38000 },
      { etiqueta: 'A', valor: 41000 },
      { etiqueta: 'J', valor: 45000 },
      { etiqueta: 'O', valor: 48000 },
    ],
    destacadoIndex: 3,
    carga_kg: 78.0,
    delta_carga_kg: 5.6,
    carga_puntos: [72.4, 74.0, 76.0, 78.0],
    meta_semanal_pct: 70,
    mejor_dia: 'Octubre',
    mejor_volumen_kg: 48000,
  },
}

export const historialMock: SesionHistorial[] = [
  {
    id: 'hist-001',
    nombre: 'Pecho y tríceps',
    fecha: '2026-09-07',
    volumen_kg: 4200,
    ejercicios_count: 5,
    series: [
      {
        ejercicio_id: 'ej-010',
        numero_serie: 1,
        peso_kg: 70,
        repeticiones: 8,
        confirmada: true,
      },
      {
        ejercicio_id: 'ej-010',
        numero_serie: 2,
        peso_kg: 70,
        repeticiones: 7,
        confirmada: true,
      },
    ],
  },
  {
    id: 'hist-002',
    nombre: 'Espalda y bíceps',
    fecha: '2026-09-05',
    volumen_kg: 3800,
    ejercicios_count: 4,
    series: [
      {
        ejercicio_id: 'ej-011',
        numero_serie: 1,
        peso_kg: 0,
        repeticiones: 6,
        confirmada: true,
      },
    ],
  },
]

export function getSesionById(id: string): Sesion | undefined {
  for (const semana of planMock.semanas) {
    const found = semana.sesiones.find((s) => s.id === id)
    if (found) return found
  }
  if (id === SESION_HOY_ID) return sesionHoy
  return undefined
}

export function catalogoEjercicios(): EjercicioPrescrito[] {
  const byId = new Map<string, EjercicioPrescrito>()
  for (const semana of planMock.semanas) {
    for (const sesion of semana.sesiones) {
      for (const ej of sesion.ejercicios) {
        byId.set(ej.ejercicio_id, {
          ...ej,
          pasos: [...ej.pasos],
        })
      }
    }
  }
  return [...byId.values()]
}
