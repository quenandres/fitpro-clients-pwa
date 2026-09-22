import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { HISTORIAL_SEARCH_DEFAULT } from '@/lib/routes/historialSearch'
import type { SesionTracking } from '@/types/tracking'
import {
  TRACKING_MODALIDAD_LABELS,
  formatSessionDate,
} from '@/lib/tracking/utils'

type RecentSessionsListProps = {
  sesiones: SesionTracking[]
  limit?: number
}

export function RecentSessionsList({
  sesiones,
  limit = 10,
}: RecentSessionsListProps) {
  const recent = sesiones.slice(0, limit)

  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin sesiones en este periodo.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {recent.map((s) => (
        <li key={s.id}>
          <Link
            to="/historial/$sesionId"
            params={{ sesionId: s.id }}
            search={HISTORIAL_SEARCH_DEFAULT}
            className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{s.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {formatSessionDate(s.fecha)} · {s.series_completadas} series ·{' '}
                {s.volumen_kg.toLocaleString('es-ES')} kg
              </p>
            </div>
            <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
              {TRACKING_MODALIDAD_LABELS[s.modalidad]}
            </Badge>
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
