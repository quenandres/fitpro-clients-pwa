import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SelectorTabsAnimado } from '@/components/motion/DashboardMotion'
import { Button } from '@/components/ui/button'
import {
  TRACKING_PERIOD_LABELS,
  type TrackingPeriod,
} from '@/lib/tracking/utils'

const PERIOD_OPTIONS = [
  { id: 'semana' as const, label: TRACKING_PERIOD_LABELS.semana },
  { id: 'mes' as const, label: TRACKING_PERIOD_LABELS.mes },
  { id: 'trimestre' as const, label: TRACKING_PERIOD_LABELS.trimestre },
  { id: 'anio' as const, label: TRACKING_PERIOD_LABELS.anio },
]

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
      <SelectorTabsAnimado
        items={PERIOD_OPTIONS}
        value={period}
        onChange={onPeriodChange}
        ariaLabel="Periodo de actividad"
        classNameTab="min-h-10 px-2"
      />

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
