import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { CalendarDays, ChevronLeft, MapPin, Users } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  useComunidad,
  useComunidadEvento,
  useConfirmarEvento,
  useCancelarEvento,
} from '@/lib/gateway/comunidades-hooks'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/_authenticated/comunidades/$comunidadId/eventos/$eventoId',
)({
  component: EventoDetallePage,
})

function EventoDetallePage() {
  const { comunidadId, eventoId } = Route.useParams()
  const { data: comunidad } = useComunidad(comunidadId)
  const { data: evento, isLoading, isError } = useComunidadEvento(
    comunidadId,
    eventoId,
  )
  const confirmar = useConfirmarEvento(comunidadId)
  const cancelar = useCancelarEvento(comunidadId)

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />
  }

  if (isError || !evento || !comunidad) {
    throw notFound()
  }

  const pasado = new Date(evento.inicioEn).getTime() < Date.now()
  const estado = evento.estadoParticipacion ?? 'ninguno'
  const confirmados = evento.participantes.filter(
    (p) => p.estado === 'confirmado',
  ).length
  const esMiembro = comunidad.esMiembro ?? false
  const suspendido = comunidad.suspendido ?? false
  const puedeParticipar = esMiembro && !suspendido

  const inicio = new Date(evento.inicioEn)
  const fin = new Date(evento.finEn)

  return (
    <div className="space-y-6">
      <Link
        to="/comunidades/$comunidadId/eventos"
        params={{ comunidadId }}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'min-h-11 -ml-2 inline-flex items-center gap-1',
        )}
      >
        <ChevronLeft className="size-4" aria-hidden />
        Volver a eventos
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-bold">{evento.titulo}</h1>
          {pasado && <Badge variant="secondary">Finalizado</Badge>}
          {!pasado && estado === 'confirmado' && <Badge>Confirmado</Badge>}
          {!pasado && estado === 'lista_espera' && (
            <Badge variant="outline">Lista de espera</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{comunidad.nombre}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle</CardTitle>
          <CardDescription>{evento.descripcion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {inicio.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            · {inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            –
            {fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {evento.lugar}
          </p>
          <p className="flex items-center gap-2">
            <Users className="size-4 shrink-0" aria-hidden />
            {confirmados}
            {evento.cupoMax !== null ? ` / ${evento.cupoMax}` : ''} participantes
            confirmados
          </p>
        </CardContent>
      </Card>

      {puedeParticipar && !pasado && (
        <div className="flex flex-wrap gap-2">
          {estado === 'ninguno' ? (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={confirmar.isPending}
              onClick={() =>
                confirmar.mutate(eventoId, {
                  onSuccess: () => toast.success('Participación confirmada'),
                  onError: () =>
                    toast.error('No pudimos confirmar tu participación.'),
                })
              }
            >
              {confirmar.isPending ? 'Confirmando…' : 'Confirmar participación'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={cancelar.isPending}
              onClick={() =>
                cancelar.mutate(eventoId, {
                  onSuccess: () => toast.success('Participación cancelada'),
                  onError: () =>
                    toast.error('No pudimos cancelar tu participación.'),
                })
              }
            >
              {cancelar.isPending ? 'Cancelando…' : 'Cancelar participación'}
            </Button>
          )}
        </div>
      )}

      {suspendido && esMiembro && !pasado && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Tu cuenta está suspendida. No puedes confirmar asistencia a eventos.
        </p>
      )}

      {!esMiembro && !pasado && (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Debes unirte a {comunidad.nombre} para confirmar tu participación.
        </p>
      )}
    </div>
  )
}
