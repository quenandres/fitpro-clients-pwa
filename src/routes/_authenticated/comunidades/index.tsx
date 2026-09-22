import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ComunidadCard } from '@/components/comunidades/ComunidadCard'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useComunidadesList,
  useJoinComunidad,
} from '@/lib/gateway/comunidades-hooks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/comunidades/')({
  component: ComunidadesExplorarPage,
})

type TabExplorar = 'para-ti' | 'mis' | 'descubrir'

const TABS: { id: TabExplorar; label: string }[] = [
  { id: 'para-ti', label: 'Para ti' },
  { id: 'mis', label: 'Mis comunidades' },
  { id: 'descubrir', label: 'Descubrir' },
]

function ComunidadesExplorarPage() {
  const [tab, setTab] = useState<TabExplorar>('para-ti')
  const [busqueda, setBusqueda] = useState('')
  const { data: comunidades = [], isLoading, isError, refetch } = useComunidadesList(
    tab,
    busqueda,
  )
  const joinMutation = useJoinComunidad()

  const filtradas = useMemo(() => comunidades, [comunidades])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold">Comunidades</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explora grupos, únete y participa en eventos.
        </p>
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar comunidades…"
          className="min-h-11 pl-9"
          aria-label="Buscar comunidades"
        />
      </div>

      <div
        role="tablist"
        aria-label="Explorar comunidades"
        className="grid grid-cols-3 gap-1 rounded-full bg-secondary p-1"
      >
        {TABS.map(({ id, label }) => {
          const activo = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setTab(id)}
              className={cn(
                'min-h-11 rounded-full px-1 text-xs font-semibold transition-colors',
                activo
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-destructive/30 px-4 py-8 text-center text-sm text-destructive">
          No pudimos cargar las comunidades.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Reintentar
          </button>
        </p>
      ) : filtradas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {tab === 'mis'
            ? 'Aún no te has unido a ninguna comunidad.'
            : 'No hay comunidades que coincidan con tu búsqueda.'}
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtradas.map((comunidad) => (
            <li key={comunidad.id}>
              <ComunidadCard
                comunidad={comunidad}
                esMiembro={comunidad.esMiembro ?? false}
                onUnirme={() => joinMutation.mutate(comunidad.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
