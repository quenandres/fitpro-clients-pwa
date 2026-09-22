import type { SesionModalidad, SesionTracking } from '@/types/tracking'

export const TRACKING_MODALIDAD_LABELS: Record<SesionModalidad, string> = {
  fuerza: 'Fuerza',
  isometrico: 'Isométrico',
  otro: 'Otro',
}

export interface HeatmapCell {
  date: string
  modalidad: SesionModalidad | null
  sesiones: SesionTracking[]
}

export interface RangeCalendarCell extends HeatmapCell {
  dayNum: number
  inRange: boolean
}

export interface RangeColumnMeta {
  weekNum: number
  month: number
  monthLabel: string
  isMonthStart: boolean
}

export interface MonthCalendarCell extends HeatmapCell {
  dayNum: number
  inMonth: boolean
}

export type TrackingPeriod = 'semana' | 'mes' | 'trimestre' | 'anio'

export interface TrackingPeriodRange {
  desde: string
  hasta: string
  label: string
  anchor: Date
}

export const TRACKING_PERIOD_LABELS: Record<TrackingPeriod, string> = {
  semana: 'Semana',
  mes: 'Mes',
  trimestre: 'Trimestre',
  anio: 'Año',
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export const MONTH_FULL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export const YEAR_DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const

const MONTH_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

export function fechaLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseFechaLocal(fecha: string): Date {
  return new Date(`${fecha}T12:00:00`)
}

export function groupByFecha(sesiones: SesionTracking[]): Map<string, SesionTracking[]> {
  const map = new Map<string, SesionTracking[]>()
  for (const s of sesiones) {
    const list = map.get(s.fecha) ?? []
    list.push(s)
    map.set(s.fecha, list)
  }
  return map
}

export function dominantModalidad(daySessions: SesionTracking[]): SesionModalidad {
  const totals: Record<SesionModalidad, number> = {
    fuerza: 0,
    isometrico: 0,
    otro: 0,
  }
  for (const s of daySessions) {
    totals[s.modalidad] += s.series_completadas
  }
  let best: SesionModalidad = daySessions[0]?.modalidad ?? 'otro'
  let bestVal = -1
  for (const mod of ['fuerza', 'isometrico', 'otro'] as const) {
    if (totals[mod] > bestVal) {
      bestVal = totals[mod]
      best = mod
    }
  }
  return best
}

export function calcStreak(sesiones: SesionTracking[], today = new Date()): number {
  const dates = new Set(sesiones.map((s) => s.fecha))
  if (dates.size === 0) return 0

  let streak = 0
  const cursor = new Date(today)
  cursor.setHours(12, 0, 0, 0)

  const hasSession = (d: Date) => dates.has(fechaLocalISO(d))

  if (!hasSession(cursor)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (hasSession(cursor)) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function sumVolumen(sesiones: SesionTracking[]): number {
  return sesiones.reduce((acc, s) => acc + s.volumen_kg, 0)
}

export function sumSeries(sesiones: SesionTracking[]): number {
  return sesiones.reduce((acc, s) => acc + s.series_completadas, 0)
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const jsDay = d.getDay()
  const diff = jsDay === 0 ? -6 : 1 - jsDay
  d.setDate(d.getDate() + diff)
  return d
}

function formatWeekLabel(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
}

export function getPeriodRange(period: TrackingPeriod, anchor = new Date()): TrackingPeriodRange {
  const a = new Date(anchor)
  a.setHours(12, 0, 0, 0)

  switch (period) {
    case 'semana': {
      const start = startOfWeek(a)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return {
        desde: fechaLocalISO(start),
        hasta: fechaLocalISO(end),
        label: formatWeekLabel(start, end),
        anchor: start,
      }
    }
    case 'mes': {
      const start = new Date(a.getFullYear(), a.getMonth(), 1, 12)
      const end = new Date(a.getFullYear(), a.getMonth() + 1, 0, 12)
      return {
        desde: fechaLocalISO(start),
        hasta: fechaLocalISO(end),
        label: formatMonthLabel(start),
        anchor: start,
      }
    }
    case 'trimestre': {
      const q = Math.floor(a.getMonth() / 3)
      const start = new Date(a.getFullYear(), q * 3, 1, 12)
      const end = new Date(a.getFullYear(), q * 3 + 3, 0, 12)
      return {
        desde: fechaLocalISO(start),
        hasta: fechaLocalISO(end),
        label: `T${q + 1} ${a.getFullYear()}`,
        anchor: start,
      }
    }
    case 'anio': {
      const start = new Date(a.getFullYear(), 0, 1, 12)
      const end = new Date(a.getFullYear(), 11, 31, 12)
      return {
        desde: fechaLocalISO(start),
        hasta: fechaLocalISO(end),
        label: String(a.getFullYear()),
        anchor: start,
      }
    }
  }
}

export function navigatePeriodAnchor(
  period: TrackingPeriod,
  anchor: Date,
  direction: -1 | 1,
): Date {
  const d = new Date(anchor)
  d.setHours(12, 0, 0, 0)
  switch (period) {
    case 'semana':
      d.setDate(d.getDate() + direction * 7)
      break
    case 'mes':
      d.setMonth(d.getMonth() + direction)
      break
    case 'trimestre':
      d.setMonth(d.getMonth() + direction * 3)
      break
    case 'anio':
      d.setFullYear(d.getFullYear() + direction)
      break
  }
  return d
}

export function parsePeriodParam(raw: string | null | undefined): TrackingPeriod | null {
  if (raw === 'semana' || raw === 'mes' || raw === 'trimestre' || raw === 'anio') {
    return raw
  }
  return null
}

export function countSesionesInMonth(
  sesiones: SesionTracking[],
  year: number,
  month: number,
): number {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
  return sesiones.filter((s) => s.fecha.startsWith(prefix)).length
}

export function isoWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay() || 7
  d.setDate(d.getDate() + 4 - day)
  const yearStart = new Date(d.getFullYear(), 0, 1, 12)
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function buildWeekAlignedRangeGrid(
  sesiones: SesionTracking[],
  desde: string,
  hasta: string,
): RangeCalendarCell[][] {
  const byDate = groupByFecha(sesiones)
  const grid: RangeCalendarCell[][] = Array.from({ length: 7 }, () => [])
  const start = startOfWeek(parseFechaLocal(desde))
  const endWeekStart = startOfWeek(parseFechaLocal(hasta))
  const end = new Date(endWeekStart)
  end.setDate(end.getDate() + 6)
  const cursor = new Date(start)

  while (cursor <= end) {
    const jsDay = cursor.getDay()
    const rowIndex = jsDay === 0 ? 6 : jsDay - 1
    const fecha = fechaLocalISO(cursor)
    const daySessions = byDate.get(fecha) ?? []
    const inRange = fecha >= desde && fecha <= hasta
    grid[rowIndex].push({
      date: fecha,
      dayNum: cursor.getDate(),
      inRange,
      modalidad: inRange && daySessions.length > 0 ? dominantModalidad(daySessions) : null,
      sesiones: inRange ? daySessions : [],
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return grid
}

export function rangeColumnMeta(grid: RangeCalendarCell[][]): RangeColumnMeta[] {
  const mondayRow = grid[0] ?? []
  return mondayRow.map((cell, i) => {
    const d = parseFechaLocal(cell.date)
    const month = d.getMonth()
    const prevMonth = i > 0 ? parseFechaLocal(mondayRow[i - 1].date).getMonth() : -1
    return {
      weekNum: isoWeekNumber(d),
      month,
      monthLabel: MONTH_SHORT[month],
      isMonthStart: month !== prevMonth,
    }
  })
}

export function buildWeekCells(sesiones: SesionTracking[], anchor: Date): HeatmapCell[] {
  const range = getPeriodRange('semana', anchor)
  const byDate = groupByFecha(sesiones)
  const cells: HeatmapCell[] = []
  const cursor = parseFechaLocal(range.desde)

  for (let i = 0; i < 7; i += 1) {
    const fecha = fechaLocalISO(cursor)
    const daySessions = byDate.get(fecha) ?? []
    cells.push({
      date: fecha,
      modalidad: daySessions.length > 0 ? dominantModalidad(daySessions) : null,
      sesiones: daySessions,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return cells
}

export function buildMonthCalendarGrid(
  sesiones: SesionTracking[],
  anchor: Date,
): MonthCalendarCell[][] {
  const byDate = groupByFecha(sesiones)
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1, 12)
  const lastDay = new Date(year, month + 1, 0, 12).getDate()
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1

  const emptyCell = (): MonthCalendarCell => ({
    date: '',
    modalidad: null,
    sesiones: [],
    dayNum: 0,
    inMonth: false,
  })

  const weeks: MonthCalendarCell[][] = []
  let week: MonthCalendarCell[] = []

  for (let i = 0; i < startPad; i += 1) {
    week.push(emptyCell())
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day, 12)
    const fecha = fechaLocalISO(date)
    const daySessions = byDate.get(fecha) ?? []
    week.push({
      date: fecha,
      modalidad: daySessions.length > 0 ? dominantModalidad(daySessions) : null,
      sesiones: daySessions,
      dayNum: day,
      inMonth: true,
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(emptyCell())
    }
    weeks.push(week)
  }

  return weeks
}

export function getHeatmapDayLabels(): readonly string[] {
  return DAY_LABELS
}

export function formatSessionTooltip(sesiones: SesionTracking[]): string {
  if (sesiones.length === 0) return ''
  const fecha = parseFechaLocal(sesiones[0].fecha)
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(fecha)

  return sesiones
    .map((s) => {
      const mod = TRACKING_MODALIDAD_LABELS[s.modalidad]
      return `${dateLabel} · ${s.nombre} · ${s.duracion_min} min · ${mod}`
    })
    .join('\n')
}

export function formatSessionDate(fecha: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseFechaLocal(fecha))
}
