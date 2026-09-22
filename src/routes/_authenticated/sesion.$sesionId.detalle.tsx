import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { usePlan } from '@/lib/gateway/hooks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/sesion/$sesionId/detalle')({
  component: DetalleSesionPage,
})

function DetalleSesionPage() {
  const { sesionId } = Route.useParams()
  const { data: plan, isLoading } = usePlan()
  const sesion = plan?.semanas
    .flatMap((s) => s.sesiones)
    .find((s) => s.id === sesionId)

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando sesión…</p>
  }

  if (!sesion) {
    return (
      <div className="space-y-4">
        <p role="alert">No encontramos esta sesión.</p>
        <Link to="/" className={cn(buttonVariants({ variant: 'secondary' }))}>
          Volver a Hoy
        </Link>
      </div>
    )
  }

  const ejercicios = sesion.ejercicios
  const totalSeries = ejercicios.reduce((n, ej) => n + ej.series, 0)

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'size-11 shrink-0',
          )}
          aria-label="Volver a Hoy"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{sesion.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {ejercicios.length} ejercicios · {totalSeries} series
          </p>
        </div>
      </header>

      {ejercicios.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          Esta sesión no tiene ejercicios asignados.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {ejercicios.map((ej, i) => (
            <li key={`${ej.ejercicio_id}-${i}`}>
              <article className="flex h-full flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <Link
                  to="/sesion/$sesionId"
                  params={{ sesionId: sesion.id }}
                  search={{ ejercicio: i }}
                  className="flex min-h-20 flex-1 items-center gap-4 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <img
                    src={ej.gif_url ?? ej.imagen_url}
                    alt={`Cómo hacer ${ej.nombre}`}
                    className="size-20 shrink-0 rounded-full bg-background object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold">{ej.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {ej.series} series · {ej.repeticiones} reps
                      {ej.peso_objetivo_kg
                        ? ` · ${ej.peso_objetivo_kg} kg`
                        : ''}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm">{ej.descripcion}</p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}

      {ejercicios.length > 0 && (
        <Link
          to="/sesion/$sesionId"
          params={{ sesionId: sesion.id }}
          search={{ ejercicio: 0 }}
          className={cn(buttonVariants({ size: 'lg' }), 'min-h-14 w-full')}
        >
          Empezar sesión
        </Link>
      )}
    </div>
  )
}
