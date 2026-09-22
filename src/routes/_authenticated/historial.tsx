import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Activity } from 'lucide-react'
import { useMemo } from 'react'
import { ActivityHeatmap } from '@/components/tracking/ActivityHeatmap'
import { RecentSessionsList } from '@/components/tracking/RecentSessionsList'
import { TrackingPeriodNav } from '@/components/tracking/TrackingPeriodNav'
import { TrackingStats } from '@/components/tracking/TrackingStats'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useHistorial } from '@/lib/gateway/hooks'
import { adaptHistorialToTracking } from '@/lib/tracking/adaptHistorial'
import type { HistorialSearch } from '@/lib/routes/historialSearch'
import {
  TRACKING_PERIOD_LABELS,
  fechaLocalISO,
  getPeriodRange,
  navigatePeriodAnchor,
  parseFechaLocal,
  parsePeriodParam,
} from '@/lib/tracking/utils'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/historial')({
  validateSearch: (raw: Record<string, unknown>): HistorialSearch => {
    const period = parsePeriodParam(String(raw.period ?? '')) ?? 'semana'
    const fecha =
      typeof raw.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.fecha)
        ? raw.fecha
        : undefined
    return { period, fecha }
  },
  component: SeguimientoPage,
})

function SeguimientoPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { period, fecha } = Route.useSearch()
  const { data: historial = [], isLoading, isError } = useHistorial()

  const sesiones = useMemo(
    () => adaptHistorialToTracking(historial),
    [historial],
  )

  const anchorDate = useMemo(() => {
    if (fecha) return parseFechaLocal(fecha)
    return new Date()
  }, [fecha])

  const periodRange = useMemo(
    () => getPeriodRange(period, anchorDate),
    [period, anchorDate],
  )

  const sesionesPeriodo = useMemo(
    () =>
      sesiones
        .filter(
          (s) => s.fecha >= periodRange.desde && s.fecha <= periodRange.hasta,
        )
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [sesiones, periodRange.desde, periodRange.hasta],
  )

  const statsPeriodLabel = TRACKING_PERIOD_LABELS[period].toLowerCase()

  const updateSearch = (next: Partial<HistorialSearch>) => {
    void navigate({
      search: (prev) => ({
        period: next.period ?? prev.period,
        fecha: next.fecha ?? prev.fecha,
      }),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Seguimiento</h1>
          <p className="text-muted-foreground">Cargando…</p>
        </header>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Seguimiento</h1>
        </header>
        <Card role="alert">
          <CardHeader>
            <CardTitle>No pudimos cargar tu historial</CardTitle>
            <CardDescription>Revisa la conexión e inténtalo de nuevo.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (sesiones.length === 0) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="size-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Seguimiento
            </span>
          </div>
          <h1 className="text-2xl font-bold">Seguimiento de entrenamientos</h1>
          <p className="text-muted-foreground">
            Tu actividad aparecerá aquí cuando completes sesiones.
          </p>
        </header>
        <Card role="status">
          <CardHeader>
            <CardTitle>Todavía no registraste ninguna sesión</CardTitle>
            <CardDescription>
              Completa un entrenamiento desde Hoy para empezar a ver stats y
              calendario de actividad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/"
              className={cn(buttonVariants({ size: 'lg' }), 'min-h-11 w-full md:w-auto')}
            >
              Ir a Hoy
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="size-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Seguimiento
          </span>
        </div>
        <h1 className="text-2xl font-bold">Seguimiento de entrenamientos</h1>
        <p className="text-muted-foreground">
          Stats, calendario de actividad y sesiones recientes.
        </p>
      </header>

      <TrackingStats sesiones={sesionesPeriodo} periodLabel={statsPeriodLabel} />

      <Card>
        <CardHeader>
          <CardTitle>Actividad</CardTitle>
          <CardDescription>Explora por semana, mes, trimestre o año</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrackingPeriodNav
            period={period}
            periodLabel={periodRange.label}
            onPeriodChange={(next) =>
              updateSearch({ period: next, fecha: fechaLocalISO(periodRange.anchor) })
            }
            onPrev={() =>
              updateSearch({
                fecha: fechaLocalISO(
                  navigatePeriodAnchor(period, periodRange.anchor, -1),
                ),
              })
            }
            onNext={() =>
              updateSearch({
                fecha: fechaLocalISO(
                  navigatePeriodAnchor(period, periodRange.anchor, 1),
                ),
              })
            }
          />
          <ActivityHeatmap
            sesiones={sesiones}
            period={period}
            anchorDate={periodRange.anchor}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones recientes</CardTitle>
          <CardDescription>
            {sesionesPeriodo.length === 0
              ? 'Sin sesiones en este periodo'
              : `${sesionesPeriodo.length} en el periodo seleccionado`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentSessionsList sesiones={sesionesPeriodo} />
        </CardContent>
      </Card>
    </div>
  )
}
