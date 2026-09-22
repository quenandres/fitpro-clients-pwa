import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SesionTracking } from '@/types/tracking'
import {
  MONTH_FULL,
  TRACKING_MODALIDAD_LABELS,
  TRACKING_PERIOD_LABELS,
  YEAR_DAY_LETTERS,
  buildMonthCalendarGrid,
  buildWeekAlignedRangeGrid,
  buildWeekCells,
  countSesionesInMonth,
  formatSessionTooltip,
  getHeatmapDayLabels,
  getPeriodRange,
  parseFechaLocal,
  rangeColumnMeta,
  type TrackingPeriod,
} from '@/lib/tracking/utils'
import { heatmapCellClass } from '@/components/tracking/heatmapStyles'

type ActivityHeatmapProps = {
  sesiones: SesionTracking[]
  period: TrackingPeriod
  anchorDate: Date
}

function HeatmapLegend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-muted" />
        Sin actividad
      </li>
      {(['fuerza', 'isometrico', 'otro'] as const).map((mod) => (
        <li key={mod} className="flex items-center gap-1.5">
          <span
            className={cn(
              'size-3 rounded-sm',
              heatmapCellClass(mod),
            )}
          />
          {TRACKING_MODALIDAD_LABELS[mod]}
        </li>
      ))}
    </ul>
  )
}

function WeekHeatmap({
  sesiones,
  anchorDate,
}: {
  sesiones: SesionTracking[]
  anchorDate: Date
}) {
  const cells = useMemo(() => buildWeekCells(sesiones, anchorDate), [sesiones, anchorDate])
  const dayLabels = getHeatmapDayLabels()

  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((cell, i) => {
        const dayNum = parseFechaLocal(cell.date).getDate()
        const hasSessions = cell.sesiones.length > 0
        return (
          <div key={cell.date} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              {dayLabels[i]}
            </span>
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-lg text-xs sm:size-12',
                heatmapCellClass(cell.modalidad),
              )}
              title={formatSessionTooltip(cell.sesiones)}
              aria-label={
                hasSessions
                  ? formatSessionTooltip(cell.sesiones).replace(/\n/g, ', ')
                  : `Sin actividad ${cell.date}`
              }
            >
              {dayNum}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthHeatmap({
  sesiones,
  anchorDate,
}: {
  sesiones: SesionTracking[]
  anchorDate: Date
}) {
  const grid = useMemo(
    () => buildMonthCalendarGrid(sesiones, anchorDate),
    [sesiones, anchorDate],
  )
  const dayLabels = getHeatmapDayLabels()

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((label) => (
          <span
            key={label}
            className="text-center text-[10px] font-medium text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      {grid.map((week, wi) => (
        <div key={`w-${wi}`} className="grid grid-cols-7 gap-1">
          {week.map((cell, di) => (
            <div
              key={`${wi}-${di}`}
              className={cn(
                'flex aspect-square min-h-8 items-center justify-center rounded-md text-[11px] sm:min-h-9',
                cell.inMonth
                  ? heatmapCellClass(cell.modalidad)
                  : heatmapCellClass(null, { pad: true }),
              )}
              title={cell.inMonth ? formatSessionTooltip(cell.sesiones) : undefined}
              aria-hidden={!cell.inMonth}
            >
              {cell.inMonth ? cell.dayNum : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function RangeHeatmap({
  sesiones,
  period,
  anchorDate,
}: {
  sesiones: SesionTracking[]
  period: TrackingPeriod
  anchorDate: Date
}) {
  const range = useMemo(() => getPeriodRange(period, anchorDate), [period, anchorDate])
  const grid = useMemo(
    () => buildWeekAlignedRangeGrid(sesiones, range.desde, range.hasta),
    [sesiones, range.desde, range.hasta],
  )
  const columns = useMemo(() => rangeColumnMeta(grid), [grid])
  const dayLabels = getHeatmapDayLabels()
  const weekCount = columns.length
  const showDayNums = period === 'trimestre'
  const showWeekNums = period === 'trimestre'
  const showMonths = period === 'trimestre'

  return (
    <div className={cn('overflow-x-auto', weekCount > 12 && 'pb-2')}>
      <div className="inline-block min-w-full space-y-1">
        {showMonths ? (
          <div className="flex gap-1">
            <span className="w-8 shrink-0" aria-hidden />
            {columns.map((col, i) => (
              <span
                key={`m-${i}`}
                className="min-w-4 flex-1 truncate text-center text-[10px] font-medium text-muted-foreground"
              >
                {col.isMonthStart ? col.monthLabel : ''}
              </span>
            ))}
          </div>
        ) : null}

        {showWeekNums ? (
          <div className="flex gap-1">
            <span className="w-8 shrink-0" aria-hidden />
            {columns.map((col, i) => (
              <span
                key={`w-${i}`}
                className="min-w-4 flex-1 text-center text-[10px] text-muted-foreground"
              >
                S{col.weekNum}
              </span>
            ))}
          </div>
        ) : null}

        {grid.map((row, rowIndex) => (
          <div key={dayLabels[rowIndex]} className="flex gap-1">
            <span className="w-8 shrink-0 text-[10px] font-medium text-muted-foreground">
              {dayLabels[rowIndex]}
            </span>
            {row.map((cell, colIndex) => {
              const monthStart = columns[colIndex]?.isMonthStart
              return (
                <div
                  key={cell.date}
                  className={cn(
                    'min-h-4 min-w-4 flex-1 rounded-sm',
                    cell.inRange
                      ? heatmapCellClass(cell.modalidad)
                      : heatmapCellClass(null, { outOfRange: true }),
                    monthStart && cell.inRange && 'ring-1 ring-border/60',
                  )}
                  title={cell.inRange ? formatSessionTooltip(cell.sesiones) : undefined}
                  aria-hidden={!cell.inRange}
                >
                  {cell.inRange && showDayNums ? (
                    <span className="flex size-full items-center justify-center text-[9px]">
                      {cell.dayNum}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

const YEAR_QUARTERS = [
  { id: 'T1', months: [0, 1, 2] as const },
  { id: 'T2', months: [3, 4, 5] as const },
  { id: 'T3', months: [6, 7, 8] as const },
  { id: 'T4', months: [9, 10, 11] as const },
]

function YearMonthTile({
  year,
  month,
  sesiones,
  isCurrent,
}: {
  year: number
  month: number
  sesiones: SesionTracking[]
  isCurrent: boolean
}) {
  const grid = useMemo(
    () => buildMonthCalendarGrid(sesiones, new Date(year, month, 1, 12)),
    [sesiones, year, month],
  )
  const count = useMemo(
    () => countSesionesInMonth(sesiones, year, month),
    [sesiones, year, month],
  )

  return (
    <article
      className={cn(
        'rounded-xl border border-border p-3',
        isCurrent && 'border-primary/40 bg-primary/5',
      )}
    >
      <header className="mb-2">
        <h4 className="text-sm font-semibold">{MONTH_FULL[month]}</h4>
        <p className="text-xs text-muted-foreground">
          {count === 0 ? 'Sin sesiones' : `${count} sesión${count === 1 ? '' : 'es'}`}
        </p>
      </header>
      <div className="space-y-0.5">
        <div className="grid grid-cols-7 gap-0.5">
          {YEAR_DAY_LETTERS.map((letter) => (
            <span
              key={letter}
              className="text-center text-[9px] text-muted-foreground"
            >
              {letter}
            </span>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, di) => {
              const hasSessions = cell.inMonth && cell.sesiones.length > 0
              return (
                <div
                  key={`${wi}-${di}`}
                  className={cn(
                    'flex aspect-square min-h-4 items-center justify-center rounded-[3px] text-[9px]',
                    !cell.inMonth && 'invisible',
                    cell.inMonth && !hasSessions && 'bg-muted/60 text-muted-foreground',
                    hasSessions && heatmapCellClass(cell.modalidad),
                  )}
                  title={cell.inMonth ? formatSessionTooltip(cell.sesiones) : undefined}
                  aria-hidden={!cell.inMonth}
                >
                  {cell.inMonth ? cell.dayNum : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </article>
  )
}

function YearHeatmap({
  sesiones,
  anchorDate,
}: {
  sesiones: SesionTracking[]
  anchorDate: Date
}) {
  const year = anchorDate.getFullYear()
  const now = new Date()
  const currentMonth = now.getFullYear() === year ? now.getMonth() : -1
  const defaultOpen =
    currentMonth >= 0 ? YEAR_QUARTERS[Math.floor(currentMonth / 3)].id : null
  const [openId, setOpenId] = useState<string | null>(defaultOpen)

  return (
    <div className="space-y-2">
      {YEAR_QUARTERS.map((q) => {
        const open = openId === q.id
        const sessionsInQ = q.months.reduce<number>(
          (sum, month) => sum + countSesionesInMonth(sesiones, year, month),
          0,
        )
        const rangeLabel = `${MONTH_FULL[q.months[0]]} – ${MONTH_FULL[q.months[2]]}`

        return (
          <section
            key={q.id}
            className="overflow-hidden rounded-xl border border-border"
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : q.id)}
            >
              <span className="text-sm font-bold">{q.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{rangeLabel}</span>
                <span className="text-xs text-muted-foreground">
                  {sessionsInQ === 0
                    ? 'Sin sesiones'
                    : `${sessionsInQ} sesión${sessionsInQ === 1 ? '' : 'es'}`}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-muted-foreground transition-transform',
                  open && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            {open ? (
              <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
                {q.months.map((month) => (
                  <YearMonthTile
                    key={month}
                    year={year}
                    month={month}
                    sesiones={sesiones}
                    isCurrent={month === currentMonth}
                  />
                ))}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

export function ActivityHeatmap({
  sesiones,
  period,
  anchorDate,
}: ActivityHeatmapProps) {
  const periodHint = TRACKING_PERIOD_LABELS[period]

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Vista {periodHint.toLowerCase()} · color por actividad del día
      </p>

      {period === 'semana' ? (
        <WeekHeatmap sesiones={sesiones} anchorDate={anchorDate} />
      ) : period === 'mes' ? (
        <MonthHeatmap sesiones={sesiones} anchorDate={anchorDate} />
      ) : period === 'anio' ? (
        <YearHeatmap sesiones={sesiones} anchorDate={anchorDate} />
      ) : (
        <RangeHeatmap sesiones={sesiones} period={period} anchorDate={anchorDate} />
      )}

      <HeatmapLegend />
    </div>
  )
}
