import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { HISTORIAL_SEARCH_DEFAULT } from '@/lib/routes/historialSearch'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Sesion } from '@/types/dominio'

type SesionPreviewProps = {
  sesion: Sesion
  onCerrar?: () => void
}

const estadoLabel: Record<Sesion['estado'], string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  completada: 'Hecha',
  hoy: 'Hoy',
}

export function SesionPreview({ sesion, onCerrar }: SesionPreviewProps) {
  const soloLectura = sesion.estado === 'completada'

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{sesion.nombre}</h2>
          <Badge variant="secondary">{estadoLabel[sesion.estado]}</Badge>
        </div>
        {sesion.dia && (
          <p className="text-sm text-muted-foreground">{sesion.dia}</p>
        )}
      </div>
      <Separator className="mb-4" />
      <ul className="flex-1 space-y-3 overflow-y-auto">
        {sesion.ejercicios.map((ej) => (
          <li key={ej.ejercicio_id} className="text-sm">
            <p className="font-medium">{ej.nombre}</p>
            <p className="text-muted-foreground">
              {ej.series} series × {ej.repeticiones} reps
              {ej.peso_objetivo_kg ? ` · ${ej.peso_objetivo_kg} kg` : ''}
            </p>
            <p className="mt-1 text-muted-foreground">{ej.descripcion}</p>
          </li>
        ))}
      </ul>
      <div className="pt-4">
        {soloLectura ? (
          <Link
            to="/historial"
            search={HISTORIAL_SEARCH_DEFAULT}
            onClick={onCerrar}
            className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
          >
            Ver seguimiento
          </Link>
        ) : (
          <Link
            to="/sesion/$sesionId/detalle"
            params={{ sesionId: sesion.id }}
            onClick={onCerrar}
            className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
          >
            Ver ejercicios
          </Link>
        )}
      </div>
    </div>
  )
}
