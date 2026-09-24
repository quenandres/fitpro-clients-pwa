import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { AutoHeight } from '@/components/animate-ui/primitives/effects/auto-height'
import {
  Highlight,
  HighlightItem,
} from '@/components/animate-ui/primitives/effects/highlight'
import { ImageZoom } from '@/components/animate-ui/primitives/effects/image-zoom'
import { Zoom } from '@/components/animate-ui/primitives/effects/zoom'
import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'
import {
  SPRING_METRICA,
  TRANSICION_CONTROL,
  TRANSICION_ESTADO,
  TRANSICION_PROGRESO,
} from '@/lib/motion'
import { cn } from '@/lib/utils'

const SLIDING_SPRING = {
  stiffness: 300,
  damping: 30,
  mass: 0.4,
}

export function ProgresoSesionAnimado({
  value,
  'aria-label': ariaLabel,
}: {
  value: number
  'aria-label'?: string
}) {
  return (
    <div
      className="relative flex h-1 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full bg-primary"
        initial={false}
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        transition={TRANSICION_PROGRESO}
      />
    </div>
  )
}

export function IndicadorSeriesAnimado({
  total,
  hechas,
  actual,
}: {
  total: number
  hechas: number
  actual: number
}) {
  return (
    <Highlight
      mode="parent"
      value={String(actual)}
      click={false}
      hover={false}
      controlledItems
      className="rounded-full bg-primary/15 ring-1 ring-primary"
      transition={TRANSICION_CONTROL}
      containerClassName="inline-flex"
    >
      <ol
        className="relative flex flex-wrap gap-1.5 pt-1"
        aria-label={`${hechas} de ${total} series hechas`}
      >
        {Array.from({ length: total }, (_, i) => {
          const hecha = i < hechas
          const esActual = !hecha && i === actual
          return (
            <HighlightItem key={i} asChild value={String(i)}>
              <li
                className={cn(
                  'relative z-[1] flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                  hecha && 'bg-primary text-primary-foreground',
                  esActual && 'text-primary',
                  !hecha && !esActual && 'bg-muted text-muted-foreground',
                )}
              >
                {hecha ? (
                  <Zoom
                    inView
                    inViewOnce={false}
                    initialScale={0.5}
                    transition={SPRING_METRICA}
                    className="flex items-center justify-center"
                  >
                    <Check className="size-3.5" aria-hidden />
                  </Zoom>
                ) : (
                  i + 1
                )}
              </li>
            </HighlightItem>
          )
        })}
      </ol>
    </Highlight>
  )
}

export function RelojDescansoAnimado({
  segundos,
  total,
}: {
  segundos: number
  total: number
}) {
  const r = 86
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(segundos / total, 1) : 0
  const minutos = Math.floor(Math.max(segundos, 0) / 60)
  const segs = Math.max(segundos, 0) % 60

  return (
    <div className="relative size-36 md:size-56">
      <svg
        viewBox="0 0 200 200"
        className="-rotate-90 text-primary"
        aria-hidden
      >
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={TRANSICION_PROGRESO}
        />
      </svg>
      <p
        className="absolute inset-0 flex items-center justify-center gap-0.5 text-4xl font-bold tabular-nums md:text-5xl"
        aria-live="polite"
      >
        <SlidingNumber
          number={minutos}
          padStart
          initiallyStable
          inView
          inViewOnce={false}
          transition={SLIDING_SPRING}
          className="inline-flex"
        />
        <span>:</span>
        <SlidingNumber
          number={segs}
          padStart
          initiallyStable
          inView
          inViewOnce={false}
          transition={SLIDING_SPRING}
          className="inline-flex"
        />
      </p>
    </div>
  )
}

export function CampoMetricaAnimado({
  label,
  unidad,
  value,
  onChange,
  step,
  inputMode,
  decimalPlaces = 0,
}: {
  label: string
  unidad: string
  value: number
  onChange: (v: number) => void
  step: number
  inputMode: 'decimal' | 'numeric'
  decimalPlaces?: number
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <div className="w-14 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-[11px] text-muted-foreground tabular-nums">
          {unidad}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-14 shrink-0 rounded-full"
        aria-label={`Reducir ${label}`}
        onClick={() => onChange(Math.max(0, value - step))}
      >
        <Minus className="size-5" />
      </Button>
      <div className="relative min-w-0 flex-1">
        <Input
          type="number"
          inputMode={inputMode}
          aria-label={label}
          value={value || ''}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={cn(
            'h-14 w-full border-0 bg-transparent text-center text-3xl font-bold tabular-nums shadow-none focus-visible:ring-0',
            !focused && 'text-transparent caret-foreground',
          )}
        />
        {!focused ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl font-bold tabular-nums"
            aria-hidden
          >
            <SlidingNumber
              number={value}
              initiallyStable
              inView
              inViewOnce={false}
              decimalPlaces={decimalPlaces}
              transition={SLIDING_SPRING}
            />
          </div>
        ) : null}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-14 shrink-0 rounded-full"
        aria-label={`Aumentar ${label}`}
        onClick={() => onChange(value + step)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  )
}

export function PanelRegistroDescanso({
  fase,
  panelDescanso,
  panelRegistro,
}: {
  fase: string
  panelDescanso: ReactNode
  panelRegistro: ReactNode
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {fase === 'rest' ? (
        <motion.div
          key="descanso"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSICION_PROGRESO}
        >
          {panelDescanso}
        </motion.div>
      ) : (
        <motion.div
          key="registro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSICION_PROGRESO}
        >
          {panelRegistro}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function TecnicaColapsable({
  abierto,
  children,
}: {
  abierto: boolean
  children: ReactNode
}) {
  return (
    <AutoHeight
      deps={[abierto, children]}
      transition={TRANSICION_ESTADO}
      className="md:hidden"
    >
      {abierto ? children : null}
    </AutoHeight>
  )
}

export function PantallaSesionCompletada({
  seriesCount,
  terminando,
  errorGuardado,
  onListo,
}: {
  seriesCount: number
  terminando: boolean
  errorGuardado: string | null
  onListo: () => void
}) {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center space-y-6 text-center">
      <Zoom inView initialScale={0.5} transition={SPRING_METRICA}>
        <div className="rounded-full bg-primary/10 p-4">
          <Check className="size-12 text-primary" aria-hidden />
        </div>
      </Zoom>
      <div>
        <h1 className="text-2xl font-bold">¡Entrenamiento terminado!</h1>
        <p className="mt-2 text-muted-foreground tabular-nums">
          <CountingNumber
            number={seriesCount}
            initiallyStable
            inView
            className="font-medium text-foreground"
          />{' '}
          series registradas
        </p>
      </div>
      <Button
        size="lg"
        className="min-h-14 w-full max-w-sm"
        disabled={terminando}
        onClick={onListo}
      >
        {terminando ? 'Guardando…' : 'Listo'}
      </Button>
      {errorGuardado ? (
        <p className="text-sm text-destructive" role="alert">
          {errorGuardado}
        </p>
      ) : null}
    </div>
  )
}

export function ImagenEjercicioAmpliada({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  return (
    <ImageZoom
      zoomOnHover={false}
      zoomOnClick
      zoomScale={2}
      transition={TRANSICION_ESTADO}
      className="max-h-[70dvh] w-full overflow-hidden rounded-lg bg-background"
    >
      <img src={src} alt={alt} className="max-h-[70dvh] w-full object-contain" />
    </ImageZoom>
  )
}
