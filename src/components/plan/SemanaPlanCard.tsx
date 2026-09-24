import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ContenidoColapsable } from '@/components/motion/DashboardMotion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Sesion } from '@/types/dominio'
import { cn } from '@/lib/utils'

type SemanaPlan = {
  numero: number
  sesiones: Sesion[]
}

type SemanaPlanCardProps = {
  semana: SemanaPlan
  esActual: boolean
  sesionSeleccionadaId: string | null
  onSeleccionarSesion: (sesion: Sesion) => void
}

export function SemanaPlanCard({
  semana,
  esActual,
  sesionSeleccionadaId,
  onSeleccionarSesion,
}: SemanaPlanCardProps) {
  const [abierta, setAbierta] = useState(esActual)

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left"
          aria-expanded={abierta}
          onClick={() => setAbierta((v) => !v)}
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            Semana {semana.numero}
            {esActual ? (
              <Badge variant="secondary">Actual</Badge>
            ) : null}
          </CardTitle>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform',
              abierta && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </CardHeader>
      <CardContent className="space-y-0 p-0 pb-0">
        <ContenidoColapsable abierto={abierta} deps={[semana.sesiones.length]}>
          <div className="space-y-0 pb-2">
            {semana.sesiones.map((sesion) => (
              <button
                key={sesion.id}
                type="button"
                onClick={() => onSeleccionarSesion(sesion)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent',
                  sesionSeleccionadaId === sesion.id && 'bg-primary/10',
                )}
              >
                <div>
                  <p className="font-medium">{sesion.nombre}</p>
                  <p className="text-sm text-muted-foreground">{sesion.dia}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {sesion.estado === 'completada'
                      ? 'Hecha'
                      : sesion.estado === 'hoy'
                        ? 'Hoy'
                        : 'Pendiente'}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground md:hidden" />
                </div>
              </button>
            ))}
          </div>
        </ContenidoColapsable>
      </CardContent>
    </Card>
  )
}
