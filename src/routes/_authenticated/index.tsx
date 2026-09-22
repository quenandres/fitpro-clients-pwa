import { Link, createFileRoute } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Dumbbell,
  Flame,
  Star,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { useSesionHoy } from '@/lib/gateway/hooks'
import { HISTORIAL_SEARCH_DEFAULT } from '@/lib/routes/historialSearch'
import { useAuth } from '@/providers/auth-provider'
import { progresoHoyMock, type PeriodoHoy } from '@/lib/mock/datos'
import type { Sesion } from '@/types/dominio'

export const Route = createFileRoute('/_authenticated/')({
  component: HoyPage,
})

const PERIODOS: { id: PeriodoHoy; label: string }[] = [
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'trimestre', label: '3 meses' },
  { id: 'anio', label: 'Año' },
]

function formatKg(valor: number, decimales = 0) {
  return valor.toLocaleString('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

function inicialDeEmail(email: string | undefined) {
  return email?.trim().charAt(0).toUpperCase() || '?'
}

function CabeceraHoy({ racha }: { racha: number | null }) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Dumbbell className="size-4" aria-hidden />
        </span>
        <p className="text-sm font-semibold">GYMApp</p>
      </div>
      <div className="flex items-center gap-2">
        {racha !== null && racha > 0 && (
          <p className="flex min-h-11 items-center gap-1 rounded-full bg-secondary px-3 text-sm font-medium tabular-nums">
            <Flame className="size-4 text-primary" aria-hidden />
            <span>{racha}</span>
            <span className="sr-only">días de racha</span>
          </p>
        )}
        <Link
          to="/perfil"
          className="rounded-full focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Ir a perfil"
        >
          <Avatar size="default">
            <AvatarFallback>{inicialDeEmail(user?.email)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}

function SelectorPeriodo({
  value,
  onChange,
}: {
  value: PeriodoHoy
  onChange: (periodo: PeriodoHoy) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Periodo"
      className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1"
    >
      {PERIODOS.map((periodo) => {
        const activo = value === periodo.id
        return (
          <button
            key={periodo.id}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(periodo.id)}
            className={cn(
              'min-h-11 rounded-full px-1 text-xs font-semibold transition-colors',
              activo
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {periodo.label}
          </button>
        )
      })}
    </div>
  )
}

function Delta({
  valor,
  unidad,
  invertido,
}: {
  valor: number
  unidad: string
  invertido?: boolean
}) {
  const negativo = valor < 0
  const Icono = negativo ? ArrowDownRight : ArrowUpRight
  return (
    <p
      className={cn(
        'flex items-center justify-end gap-0.5 text-xs font-medium tabular-nums',
        invertido
          ? negativo
            ? 'text-primary'
            : 'text-destructive'
          : negativo
            ? 'text-destructive'
            : 'text-primary',
      )}
    >
      <Icono className="size-3.5" aria-hidden />
      {negativo ? '' : '+'}
      {valor}
      {unidad}
    </p>
  )
}

function BarrasVolumen({
  barras,
  destacadoIndex,
}: {
  barras: { etiqueta: string; valor: number }[]
  destacadoIndex: number
}) {
  const max = Math.max(...barras.map((b) => b.valor), 1)
  return (
    <div className="flex h-36 items-end gap-2">
      {barras.map((barra, i) => {
        const alto = Math.max((barra.valor / max) * 100, barra.valor === 0 ? 6 : 12)
        return (
          <div
            key={barra.etiqueta}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-28 w-full items-end justify-center">
              <div
                className={cn(
                  'w-full max-w-6 rounded-full motion-reduce:transition-none',
                  i === destacadoIndex ? 'bg-chart-1' : 'bg-chart-1/30',
                )}
                style={{ height: `${alto}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {barra.etiqueta}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function LineaCarga({ puntos }: { puntos: number[] }) {
  const min = Math.min(...puntos)
  const max = Math.max(...puntos)
  const span = max - min || 1
  const w = 320
  const h = 88
  const pad = 10
  const coords = puntos.map((punto, i) => {
    const x = pad + (i / Math.max(puntos.length - 1, 1)) * (w - pad * 2)
    const y = pad + (1 - (punto - min) / span) * (h - pad * 2)
    return { x, y }
  })

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-20 w-full text-chart-1"
      role="img"
      aria-label="Tendencia de carga media"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
      />
      {coords.map((c, i) => (
        <circle
          key={`${c.x}-${c.y}`}
          cx={c.x}
          cy={c.y}
          r={i === coords.length - 1 ? 4.5 : 3}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

function Anillo({ value }: { value: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(Math.max(value, 0), 100) / 100)
  return (
    <svg
      viewBox="0 0 72 72"
      className="size-14 -rotate-90 text-chart-1"
      aria-hidden
    >
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        className="stroke-muted"
        strokeWidth="8"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

function PanelProgreso({ periodo }: { periodo: PeriodoHoy }) {
  const data = progresoHoyMock[periodo]
  const etiquetaPeriodo =
    periodo === 'semana'
      ? 'semana pasada'
      : periodo === 'mes'
        ? 'mes pasado'
        : periodo === 'trimestre'
          ? 'trimestre pasado'
          : 'año pasado'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardDescription>Volumen levantado</CardDescription>
            <CardTitle className="mt-1 text-3xl font-bold tabular-nums">
              {formatKg(data.volumen_kg)}{' '}
              <span className="text-base font-medium text-muted-foreground">
                kg
              </span>
            </CardTitle>
          </div>
          <div className="text-right">
            <Delta valor={data.delta_volumen_pct} unidad="%" />
            <p className="text-xs text-muted-foreground">vs {etiquetaPeriodo}</p>
          </div>
        </CardHeader>
        <CardContent>
          <BarrasVolumen
            barras={data.barras}
            destacadoIndex={data.destacadoIndex}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardDescription>Carga media</CardDescription>
            <CardTitle className="mt-1 text-3xl font-bold tabular-nums">
              {formatKg(data.carga_kg, 1)}{' '}
              <span className="text-base font-medium text-muted-foreground">
                kg
              </span>
            </CardTitle>
          </div>
          <div className="text-right">
            <Delta valor={data.delta_carga_kg} unidad=" kg" invertido />
            <p className="text-xs text-muted-foreground">vs {etiquetaPeriodo}</p>
          </div>
        </CardHeader>
        <CardContent>
          <LineaCarga puntos={data.carga_puntos} />
        </CardContent>
      </Card>
    </div>
  )
}

function TarjetasResumen({
  racha,
  metaPct,
}: {
  racha: number | null
  metaPct: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader className="pb-0">
          <CardDescription className="flex items-center gap-1">
            <Flame className="size-3.5 text-primary" aria-hidden />
            Racha
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {racha ?? 0}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              días
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Sigue así.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-0">
          <CardDescription>Meta semanal</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {metaPct}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              %
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={metaPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance de la meta semanal"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${metaPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">En ritmo.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Insights({ periodo }: { periodo: PeriodoHoy }) {
  const data = progresoHoyMock[periodo]
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Resumen</h2>
      <div className="grid grid-cols-3 gap-2">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Volumen</CardDescription>
            <CardTitle className="text-sm font-semibold tabular-nums">
              {formatKg(data.volumen_kg)} kg
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="items-center text-center">
            <Anillo value={data.meta_semanal_pct} />
            <CardDescription>Completado</CardDescription>
            <CardTitle className="text-sm font-semibold tabular-nums">
              {data.meta_semanal_pct}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1">
              <Star className="size-3.5 text-primary" aria-hidden />
              Mejor día
            </CardDescription>
            <CardTitle className="text-sm font-semibold">
              {data.mejor_dia}
            </CardTitle>
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatKg(data.mejor_volumen_kg)} kg
            </p>
          </CardHeader>
        </Card>
      </div>
    </section>
  )
}

function CardSesionHoy({
  sesion,
  sesion_completada_hoy,
}: {
  sesion: Sesion
  sesion_completada_hoy: boolean
}) {

  const portada = sesion.ejercicios[0]
  const totalSeries = sesion.ejercicios.reduce((n, ej) => n + ej.series, 0)
  const preview = sesion.ejercicios
    .slice(0, 3)
    .map((ej) => ej.nombre)
    .join(' · ')

  return (
    <section>
      <Card className="overflow-hidden py-0">
        <div className="flex flex-col sm:flex-row">
          <img
            src={portada.imagen_url}
            alt=""
            className="h-44 w-full bg-background object-contain sm:h-auto sm:w-44 sm:shrink-0"
          />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Hoy te toca
              </p>
              <Badge variant="secondary">Hoy</Badge>
            </div>
            <h1 className="text-2xl font-bold">{sesion.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {sesion.ejercicios.length} ejercicios · {totalSeries} series
            </p>
            <p className="line-clamp-2 text-sm">{preview}</p>
            {sesion_completada_hoy ? (
              <Link
                to="/historial"
                search={HISTORIAL_SEARCH_DEFAULT}
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'lg' }),
                  'mt-auto min-h-11 w-full',
                )}
              >
                Ver seguimiento
              </Link>
            ) : (
              <Link
                to="/sesion/$sesionId/detalle"
                params={{ sesionId: sesion.id }}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-auto min-h-11 w-full',
                )}
              >
                Empezar sesión
              </Link>
            )}
          </div>
        </div>
      </Card>
    </section>
  )
}

function HoyPage() {
  const { data: sesionHoy, isLoading, isError } = useSesionHoy()
  const [periodo, setPeriodo] = useState<PeriodoHoy>('semana')
  const data = progresoHoyMock[periodo]

  const sesion = sesionHoy?.sesion ?? null
  const racha_dias = sesionHoy?.racha_dias ?? null
  const es_descanso = sesionHoy?.es_descanso ?? false
  const sesion_completada_hoy = sesionHoy?.sesion_completada_hoy ?? false

  const marco = (contenido: ReactNode) => (
    <div className="space-y-6">
      <CabeceraHoy racha={racha_dias} />
      {contenido}
    </div>
  )

  if (isLoading) {
    return marco(
      <Card role="status">
        <CardHeader>
          <CardDescription>Cargando tu sesión…</CardDescription>
        </CardHeader>
      </Card>,
    )
  }

  if (isError) {
    return marco(
      <Card role="alert">
        <CardHeader>
          <h1 className="text-2xl font-bold">Sin plan asignado</h1>
          <CardDescription>
            Tu entrenador aún no te asignó un plan activo.
          </CardDescription>
        </CardHeader>
      </Card>,
    )
  }

  if (es_descanso) {
    return marco(
      <Card role="status">
        <CardHeader>
          <h1 className="text-2xl font-bold">Hoy toca descanso</h1>
          <CardDescription>
            Recupera bien. Mañana seguimos con fuerza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/plan"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'lg' }),
              'min-h-11 w-full md:w-auto',
            )}
          >
            Ver plan completo
          </Link>
        </CardContent>
      </Card>,
    )
  }

  if (!sesion) {
    return marco(
      <Card role="status">
        <CardHeader>
          <h1 className="text-2xl font-bold">Sin plan asignado</h1>
          <CardDescription>
            Tu entrenador aún no te asignó un plan.
          </CardDescription>
        </CardHeader>
      </Card>,
    )
  }

  return marco(
    <>
      {sesion ? (
        <CardSesionHoy
          sesion={sesion}
          sesion_completada_hoy={sesion_completada_hoy}
        />
      ) : null}
      <PrototypeBanner mensaje="Las cifras de progreso siguen siendo de ejemplo hasta derivarlas del historial real." />
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tu progreso</h2>
          <p className="text-sm text-muted-foreground">
            Pasos pequeños, cambios grandes.
          </p>
        </div>
        <SelectorPeriodo value={periodo} onChange={setPeriodo} />
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          <div className="space-y-4">
            <PanelProgreso periodo={periodo} />
          </div>
          <div className="space-y-4">
            <TarjetasResumen racha={racha_dias} metaPct={data.meta_semanal_pct} />
            <Insights periodo={periodo} />
          </div>
        </div>
      </section>
    </>,
  )
}
