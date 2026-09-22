import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  TRACKING_PERIOD_LABELS,
  type TrackingPeriod,
} from '@/lib/tracking/utils'

const PERIOD_OPTIONS: TrackingPeriod[] = ['semana', 'mes', 'trimestre', 'anio']

type TrackingPeriodNavProps = {
  period: TrackingPeriod
  periodLabel: string
  onPeriodChange: (period: TrackingPeriod) => void
  onPrev: () => void
  onNext: () => void
}

export function TrackingPeriodNav({
  period,
  periodLabel,
  onPeriodChange,
  onPrev,
  onNext,
}: TrackingPeriodNavProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Periodo de actividad"
        className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1"
      >
        {PERIOD_OPTIONS.map((id) => {
          const activo = period === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => onPeriodChange(id)}
              className={cn(
                'min-h-10 rounded-full px-2 text-xs font-semibold transition-colors',
                activo
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {TRACKING_PERIOD_LABELS[id]}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          onClick={onPrev}
          aria-label="Periodo anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-32 text-center text-sm font-medium capitalize">
          {periodLabel}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          onClick={onNext}
          aria-label="Periodo siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
