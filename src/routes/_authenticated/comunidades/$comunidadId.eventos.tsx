import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { EventoCard } from '@/components/comunidades/EventoCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { puedeModerarComunidad } from '@/lib/comunidades/display'
import {
  useComunidad,
  useComunidadEventos,
  useConfirmarEvento,
  useCancelarEvento,
  useCreateEvento,
  useDeleteEvento,
} from '@/lib/gateway/comunidades-hooks'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/_authenticated/comunidades/$comunidadId/eventos',
)({
  component: ComunidadEventosPage,
})

type TabEventos = 'proximos' | 'pasados'

function ComunidadEventosPage() {
  const { comunidadId } = Route.useParams()
  const [tab, setTab] = useState<TabEventos>('proximos')
  const { data: comunidad } = useComunidad(comunidadId)
  const { data: lista = [], isLoading, isError, refetch } =
    useComunidadEventos(comunidadId, tab)
  const confirmar = useConfirmarEvento(comunidadId)
  const cancelar = useCancelarEvento(comunidadId)
  const createEvento = useCreateEvento(comunidadId)
  const deleteEvento = useDeleteEvento(comunidadId)

  const esMiembro = comunidad?.esMiembro ?? false
  const suspendido = comunidad?.suspendido ?? false
  const puedeModerar = puedeModerarComunidad(comunidad?.miRol)

  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [lugar, setLugar] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [cupoMax, setCupoMax] = useState('')
  const [rsvpPendingId, setRsvpPendingId] = useState<string | null>(null)

  function crearEvento() {
    if (!titulo.trim() || !descripcion.trim() || !lugar.trim() || !inicio || !fin) {
      return
    }
    createEvento.mutate(
      {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        lugar: lugar.trim(),
        inicioEn: new Date(inicio).toISOString(),
        finEn: new Date(fin).toISOString(),
        cupoMax: cupoMax ? Number(cupoMax) : null,
      },
      {
        onSuccess: () => {
          setTitulo('')
          setDescripcion('')
          setLugar('')
          setInicio('')
          setFin('')
          setCupoMax('')
          setSheetAbierto(false)
          toast.success('Evento creado')
        },
        onError: () => toast.error('No pudimos crear el evento. Inténtalo de nuevo.'),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Eventos</h2>
        {puedeModerar && tab === 'proximos' && (
          <Button
            className="min-h-11 gap-2"
            onClick={() => setSheetAbierto(true)}
          >
            <Plus className="size-4" aria-hidden />
            Crear evento
          </Button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Filtrar eventos"
        className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1"
      >
        {(
          [
            { id: 'proximos' as const, label: 'Próximos' },
            { id: 'pasados' as const, label: 'Pasados' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'min-h-11 rounded-full text-xs font-semibold transition-colors',
              tab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {!esMiembro && tab === 'proximos' && (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Únete a la comunidad para confirmar tu participación en eventos.
        </p>
      )}

      {suspendido && esMiembro && tab === 'proximos' && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Tu cuenta está suspendida. No puedes confirmar asistencia a eventos.
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : isError ? (
        <p className="rounded-xl border border-destructive/30 px-4 py-8 text-center text-sm text-destructive">
          No pudimos cargar los eventos.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tab === 'proximos'
            ? 'No hay eventos próximos.'
            : 'No hay eventos pasados.'}
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              comunidadId={comunidadId}
              esMiembro={esMiembro}
              suspendido={suspendido}
              puedeModerar={puedeModerar}
              pasado={tab === 'pasados'}
              estadoParticipacion={evento.estadoParticipacion ?? 'ninguno'}
              confirmarPending={rsvpPendingId === evento.id}
              onConfirmar={() => {
                setRsvpPendingId(evento.id)
                confirmar.mutate(evento.id, {
                  onSettled: () => setRsvpPendingId(null),
                  onSuccess: () => toast.success('Participación confirmada'),
                  onError: () =>
                    toast.error('No pudimos confirmar tu participación.'),
                })
              }}
              onCancelar={() => {
                setRsvpPendingId(evento.id)
                cancelar.mutate(evento.id, {
                  onSettled: () => setRsvpPendingId(null),
                  onSuccess: () => toast.success('Participación cancelada'),
                  onError: () =>
                    toast.error('No pudimos cancelar tu participación.'),
                })
              }}
              onEliminar={
                puedeModerar
                  ? () =>
                      deleteEvento.mutate(evento.id, {
                        onSuccess: () => toast.success('Evento eliminado'),
                        onError: () =>
                          toast.error('No pudimos eliminar el evento.'),
                      })
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo evento</SheetTitle>
            <SheetDescription>
              Programa una actividad para la comunidad.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="evento-titulo">Título</Label>
              <Input
                id="evento-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evento-desc">Descripción</Label>
              <textarea
                id="evento-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="border-input bg-background flex min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evento-lugar">Lugar</Label>
              <Input
                id="evento-lugar"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="evento-inicio">Inicio</Label>
                <Input
                  id="evento-inicio"
                  type="datetime-local"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  className="min-h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evento-fin">Fin</Label>
                <Input
                  id="evento-fin"
                  type="datetime-local"
                  value={fin}
                  onChange={(e) => setFin(e.target.value)}
                  className="min-h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evento-cupo">Cupo máximo (opcional)</Label>
              <Input
                id="evento-cupo"
                type="number"
                min={1}
                value={cupoMax}
                onChange={(e) => setCupoMax(e.target.value)}
                className="min-h-11"
              />
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => setSheetAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              className="min-h-11"
              disabled={
                !titulo.trim() ||
                !descripcion.trim() ||
                !lugar.trim() ||
                !inicio ||
                !fin ||
                createEvento.isPending
              }
              onClick={crearEvento}
            >
              {createEvento.isPending ? 'Creando…' : 'Crear evento'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
