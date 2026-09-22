import { Activity, Dumbbell, Flame, Layers } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SesionTracking } from '@/types/tracking'
import { calcStreak, sumSeries, sumVolumen } from '@/lib/tracking/utils'

type TrackingStatsProps = {
  sesiones: SesionTracking[]
  periodLabel: string
}

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof Activity
  label: string
  value: string | number
  suffix?: string
}) {
  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 shrink-0" aria-hidden />
          <CardTitle className="text-xs font-medium">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold tabular-nums">
          {value}
          {suffix ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>
      </CardContent>
    </Card>
  )
}

export function TrackingStats({ sesiones, periodLabel }: TrackingStatsProps) {
  const streak = calcStreak(sesiones)
  const volumen = sumVolumen(sesiones)
  const series = sumSeries(sesiones)

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        icon={Activity}
        label={`Sesiones (${periodLabel})`}
        value={sesiones.length}
      />
      <KpiCard icon={Flame} label="Racha actual" value={streak} suffix="días" />
      <KpiCard
        icon={Dumbbell}
        label="Volumen"
        value={volumen.toLocaleString('es-ES')}
        suffix="kg"
      />
      <KpiCard icon={Layers} label="Series" value={series} />
    </div>
  )
}
