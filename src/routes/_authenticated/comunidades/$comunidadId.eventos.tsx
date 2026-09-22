import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { EventoCard } from '@/components/comunidades/EventoCard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useComunidad,
  useComunidadEventos,
  useConfirmarEvento,
  useCancelarEvento,
} from '@/lib/gateway/comunidades-hooks'
import { cn } from '@/lib/utils'

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
  const { data: lista = [], isLoading } = useComunidadEventos(comunidadId, tab)
  const confirmar = useConfirmarEvento(comunidadId)
  const cancelar = useCancelarEvento(comunidadId)
  const esMiembro = comunidad?.esMiembro ?? false

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Eventos</h2>

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

      {isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
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
              pasado={tab === 'pasados'}
              estadoParticipacion={evento.estadoParticipacion ?? 'ninguno'}
              onConfirmar={() => confirmar.mutate(evento.id)}
              onCancelar={() => cancelar.mutate(evento.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
