import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ChevronDown, Dumbbell } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  ContenidoColapsable,
  MetricaContador,
} from '@/components/motion/DashboardMotion'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useHistorial } from '@/lib/gateway/hooks'
import { HISTORIAL_SEARCH_DEFAULT } from '@/lib/routes/historialSearch'
import { adaptHistorialToTracking } from '@/lib/tracking/adaptHistorial'
import {
  TRACKING_MODALIDAD_LABELS,
  formatSessionDate,
} from '@/lib/tracking/utils'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/historial/$sesionId')({
  component: DetalleSesionTrackingPage,
})

function TablaSeriesEjercicio({
  series,
}: {
  series: { n: number; reps: number; peso_kg?: number | null }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Serie</th>
            <th className="pb-2 pr-4 font-medium">Reps</th>
            <th className="pb-2 font-medium">Peso</th>
          </tr>
        </thead>
        <tbody>
          {series.map((serie) => (
            <tr key={serie.n} className="border-t border-border">
              <td className="py-2 pr-4 tabular-nums">{serie.n}</td>
              <td className="py-2 pr-4 tabular-nums">{serie.reps}</td>
              <td className="py-2 tabular-nums">
                {serie.peso_kg != null && serie.peso_kg > 0
                  ? `${serie.peso_kg} kg`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EjercicioSesionCard({
  nombre,
  series,
}: {
  nombre: string
  series: { n: number; reps: number; peso_kg?: number | null }[]
}) {
  const [abierto, setAbierto] = useState(true)

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
        >
          <CardTitle className="text-base">{nombre}</CardTitle>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              abierto && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </CardHeader>
      <CardContent className="pt-0">
        <ContenidoColapsable abierto={abierto} deps={[series.length]}>
          <TablaSeriesEjercicio series={series} />
        </ContenidoColapsable>
      </CardContent>
    </Card>
  )
}

function DetalleSesionTrackingPage() {
  const { sesionId } = Route.useParams()
  const { data: historial = [], isLoading } = useHistorial()

  const sesion = useMemo(() => {
    const rows = adaptHistorialToTracking(historial)
    return rows.find((s) => s.id === sesionId)
  }, [historial, sesionId])

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando sesión…</p>
  }

  if (!sesion) {
    return (
      <div className="space-y-4">
        <Link
          to="/historial"
          search={HISTORIAL_SEARCH_DEFAULT}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'gap-1 px-0',
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al seguimiento
        </Link>
        <Card role="alert">
          <CardHeader>
            <CardTitle>Sesión no encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              to="/historial"
              search={HISTORIAL_SEARCH_DEFAULT}
              className={buttonVariants({ variant: 'secondary' })}
            >
              Ir al seguimiento
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/historial"
        search={HISTORIAL_SEARCH_DEFAULT}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'gap-1 px-0',
        )}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al seguimiento
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {TRACKING_MODALIDAD_LABELS[sesion.modalidad]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold">{sesion.nombre}</h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          {formatSessionDate(sesion.fecha)} ·{' '}
          <MetricaContador valor={sesion.series_completadas} /> series ·{' '}
          <MetricaContador valor={sesion.volumen_kg} /> kg de volumen · ~
          {sesion.duracion_min} min
        </p>
      </header>

      {sesion.ejercicios.length === 0 ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-6 text-muted-foreground">
            <Dumbbell className="size-5 shrink-0" aria-hidden />
            <p className="text-sm">No hay series registradas para esta sesión.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sesion.ejercicios.map((ej) => (
            <EjercicioSesionCard
              key={ej.ejercicio_id}
              nombre={ej.nombre}
              series={ej.series}
            />
          ))}
        </div>
      )}

      <Separator />

      <p className="text-xs text-muted-foreground">
        {sesion.ejercicios_count} ejercicios · ID {sesion.id}
      </p>
    </div>
  )
}
