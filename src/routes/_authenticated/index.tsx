import { Link, createFileRoute } from '@tanstack/react-router'
import { Flame } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { sesionDelDiaMock } from '@/lib/mock/datos'

export const Route = createFileRoute('/_authenticated/')({
  component: HoyPage,
})

function HoyPage() {
  const { sesion, racha_dias, es_descanso, sesion_completada_hoy } =
    sesionDelDiaMock
  const hoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  if (es_descanso) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold capitalize">{hoy}</h1>
          <p className="text-muted-foreground">Tu día de entrenamiento</p>
        </header>
        <PrototypeBanner mensaje="Datos de ejemplo hasta que existan endpoints de plan en el gateway." />
        <Card role="status">
          <CardHeader>
            <CardTitle>Hoy toca descanso</CardTitle>
            <CardDescription>
              Recupera bien. Mañana seguimos con fuerza.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/plan"
              className={cn(
                buttonVariants({ variant: 'secondary' }),
                'w-full md:w-auto',
              )}
            >
              Ver plan completo
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sesion) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold capitalize">{hoy}</h1>
        </header>
        <PrototypeBanner mensaje="Datos de ejemplo hasta que existan endpoints de plan en el gateway." />
        <Card role="status">
          <CardHeader>
            <CardTitle>Sin plan asignado</CardTitle>
            <CardDescription>
              Tu entrenador aún no te asignó un plan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold capitalize">{hoy}</h1>
        <p className="text-muted-foreground">Tu sesión de hoy</p>
      </header>

      <PrototypeBanner mensaje="Datos de ejemplo hasta que existan endpoints de plan en el gateway." />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{sesion.nombre}</CardTitle>
                  <CardDescription>
                    {sesion.ejercicios.length} ejercicios
                  </CardDescription>
                </div>
                <Badge variant="secondary">Hoy</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                {sesion.ejercicios.slice(0, 4).map((ej) => (
                  <li key={ej.ejercicio_id} className="text-muted-foreground">
                    {ej.nombre} — {ej.series}×{ej.repeticiones}
                  </li>
                ))}
              </ul>
              {sesion_completada_hoy ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ya completaste la sesión de hoy.
                  </p>
                  <Link
                    to="/historial"
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'w-full',
                    )}
                  >
                    Ver en historial
                  </Link>
                </div>
              ) : (
                <Link
                  to="/sesion/$sesionId"
                  params={{ sesionId: sesion.id }}
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                >
                  Empezar sesión
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {racha_dias !== null && racha_dias > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="size-5 text-primary" aria-hidden />
                  Racha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {racha_dias}{' '}
                  <span className="text-base font-normal text-muted-foreground">
                    días seguidos
                  </span>
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tu plan</CardTitle>
              <CardDescription>Consulta las próximas sesiones</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/plan"
                className={cn(
                  buttonVariants({ variant: 'secondary' }),
                  'w-full',
                )}
              >
                Ver plan
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
