import type {
  Plan,
  Sesion,
  SesionDelDia,
  SesionHistorial,
} from '@/types/dominio'

export const SESION_HOY_ID = 'sesion-hoy-001'

const ejerciciosBase = [
  {
    ejercicio_id: 'ej-001',
    nombre: 'Sentadilla con barra',
    series: 4,
    repeticiones: 8,
    peso_objetivo_kg: 60,
  },
  {
    ejercicio_id: 'ej-002',
    nombre: 'Peso muerto rumano',
    series: 3,
    repeticiones: 10,
    peso_objetivo_kg: 50,
  },
  {
    ejercicio_id: 'ej-003',
    nombre: 'Prensa de piernas',
    series: 3,
    repeticiones: 12,
    peso_objetivo_kg: 100,
  },
  {
    ejercicio_id: 'ej-004',
    nombre: 'Curl de bíceps',
    series: 3,
    repeticiones: 12,
    peso_objetivo_kg: 12,
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
            },
          ],
        },
      ],
    },
  ],
}

export const sesionDelDiaMock: SesionDelDia = {
  sesion: sesionHoy,
  racha_dias: 3,
  es_descanso: false,
  sesion_completada_hoy: false,
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
