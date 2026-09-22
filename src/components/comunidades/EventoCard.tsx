import { Link } from '@tanstack/react-router'
import { CalendarDays, MapPin, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { EventoComunidad, EstadoParticipacion } from '@/types/comunidad'

type EventoCardProps = {
  evento: EventoComunidad
  comunidadId: string
  estadoParticipacion: EstadoParticipacion
  esMiembro: boolean
  suspendido?: boolean
  puedeModerar?: boolean
  confirmarPending?: boolean
  onConfirmar?: () => void
  onCancelar?: () => void
  onEliminar?: () => void
  pasado?: boolean
}

function formatRango(inicioEn: string, finEn: string) {
  const inicio = new Date(inicioEn)
  const fin = new Date(finEn)
  const fecha = inicio.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const horaInicio = inicio.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const horaFin = fin.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${fecha} · ${horaInicio}–${horaFin}`
}

export function EventoCard({
  evento,
  comunidadId,
  estadoParticipacion,
  esMiembro,
  suspendido = false,
  puedeModerar = false,
  confirmarPending = false,
  onConfirmar,
  onCancelar,
  onEliminar,
  pasado = false,
}: EventoCardProps) {
  const confirmados = evento.participantes.filter(
    (p) => p.estado === 'confirmado',
  ).length
  const puedeParticipar = esMiembro && !suspendido

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg">{evento.titulo}</CardTitle>
          <div className="flex flex-wrap gap-1">
            {pasado && <Badge variant="secondary">Finalizado</Badge>}
            {!pasado && estadoParticipacion === 'confirmado' && (
              <Badge>Confirmado</Badge>
            )}
            {!pasado && estadoParticipacion === 'lista_espera' && (
              <Badge variant="outline">Lista de espera</Badge>
            )}
          </div>
        </div>
        <CardDescription>{evento.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {formatRango(evento.inicioEn, evento.finEn)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {evento.lugar}
          </p>
          <p className="flex items-center gap-2">
            <Users className="size-4 shrink-0" aria-hidden />
            {confirmados}
            {evento.cupoMax !== null ? ` / ${evento.cupoMax}` : ''} participantes
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/comunidades/$comunidadId/eventos/$eventoId"
            params={{ comunidadId, eventoId: evento.id }}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'min-h-11',
            )}
          >
            Ver detalle
          </Link>
          {puedeParticipar &&
            !pasado &&
            estadoParticipacion === 'ninguno' &&
            onConfirmar && (
              <Button
                size="sm"
                className="min-h-11"
                disabled={confirmarPending}
                onClick={onConfirmar}
              >
                {confirmarPending ? 'Confirmando…' : 'Confirmar participación'}
              </Button>
            )}
          {puedeParticipar &&
            !pasado &&
            estadoParticipacion !== 'ninguno' &&
            onCancelar && (
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                disabled={confirmarPending}
                onClick={onCancelar}
              >
                Cancelar
              </Button>
            )}
          {puedeModerar && onEliminar && (
            <Button
              variant="destructive"
              size="sm"
              className="min-h-11 gap-1"
              onClick={onEliminar}
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
