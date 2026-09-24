import { useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AutoHeight } from '@/components/animate-ui/primitives/effects/auto-height'
import {
  Highlight,
  HighlightItem,
} from '@/components/animate-ui/primitives/effects/highlight'
import { CountingNumber } from '@/components/animate-ui/primitives/texts/counting-number'
import { useIsInView } from '@/hooks/use-is-in-view'
import {
  TRANSICION_CONTROL,
  TRANSICION_ESTADO,
  TRANSICION_PROGRESO,
} from '@/lib/motion'
import { cn } from '@/lib/utils'

export function MetricaContador({
  valor,
  decimales = 0,
  className,
}: {
  valor: number
  decimales?: number
  className?: string
}) {
  return (
    <CountingNumber
      number={valor}
      decimalPlaces={decimales}
      initiallyStable
      inView
      inViewOnce={false}
      className={cn('tabular-nums', className)}
    />
  )
}

const GRID_TAB_COLS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const

export function SelectorTabsAnimado<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  classNameTab = 'min-h-11',
  columnas = 4,
}: {
  items: readonly { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
  ariaLabel: string
  classNameTab?: string
  columnas?: 2 | 3 | 4
}) {
  return (
    <Highlight
      mode="parent"
      value={value}
      click={false}
      hover={false}
      controlledItems
      className="rounded-full bg-background shadow-sm"
      transition={TRANSICION_CONTROL}
      containerClassName={cn(
        'grid gap-1 rounded-full bg-secondary p-1',
        GRID_TAB_COLS[columnas],
      )}
    >
      <div role="tablist" aria-label={ariaLabel} className="contents">
        {items.map((item) => {
          const activo = value === item.id
          return (
            <HighlightItem key={item.id} asChild value={item.id}>
              <button
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => onChange(item.id)}
                className={cn(
                  'relative z-[1] rounded-full px-1 text-xs font-semibold',
                  classNameTab,
                  activo
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            </HighlightItem>
          )
        })}
      </div>
    </Highlight>
  )
}

export function PanelConAutoHeight({
  deps,
  children,
}: {
  deps: unknown[]
  children: ReactNode
}) {
  return (
    <AutoHeight deps={deps} transition={TRANSICION_ESTADO}>
      {children}
    </AutoHeight>
  )
}

export function BarrasVolumenAnimadas({
  barras,
  destacadoIndex,
}: {
  barras: { etiqueta: string; valor: number }[]
  destacadoIndex: number
}) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const { isInView } = useIsInView(contenedorRef, {
    inView: true,
    inViewOnce: true,
  })
  const max = Math.max(...barras.map((b) => b.valor), 1)

  return (
    <div ref={contenedorRef} className="flex h-36 items-end gap-2">
      {barras.map((barra, i) => {
        const alto = Math.max(
          (barra.valor / max) * 100,
          barra.valor === 0 ? 6 : 12,
        )
        return (
          <div
            key={barra.etiqueta}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-28 w-full items-end justify-center">
              <motion.div
                className={cn(
                  'w-full max-w-6 rounded-full',
                  i === destacadoIndex ? 'bg-chart-1' : 'bg-chart-1/30',
                )}
                initial={{ height: 0 }}
                animate={{ height: isInView ? `${alto}%` : 0 }}
                transition={{
                  ...TRANSICION_PROGRESO,
                  delay: i * 0.04,
                }}
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

export function LineaCargaAnimada({ puntos }: { puntos: number[] }) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const { isInView } = useIsInView(contenedorRef, {
    inView: true,
    inViewOnce: true,
  })
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
  const pointsStr = coords.map((c) => `${c.x},${c.y}`).join(' ')

  return (
    <div ref={contenedorRef}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-20 w-full text-chart-1"
        role="img"
        aria-label="Tendencia de carga media"
      >
        <motion.polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsStr}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
          }
          transition={TRANSICION_PROGRESO}
        />
        {coords.map((c, i) => (
          <motion.circle
            key={`${c.x}-${c.y}`}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 4.5 : 3}
            fill="currentColor"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{
              ...TRANSICION_PROGRESO,
              delay: 0.15 + i * 0.05,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function AnilloProgresoAnimado({ value }: { value: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const pct = Math.min(Math.max(value, 0), 100) / 100
  const contenedorRef = useRef<HTMLDivElement>(null)
  const { isInView } = useIsInView(contenedorRef, {
    inView: true,
    inViewOnce: true,
  })

  return (
    <div ref={contenedorRef}>
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
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{
            strokeDashoffset: isInView ? c * (1 - pct) : c,
          }}
          transition={TRANSICION_PROGRESO}
        />
      </svg>
    </div>
  )
}

export function BarraMetaAnimada({ value }: { value: number }) {
  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Avance de la meta semanal"
    >
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={false}
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        transition={TRANSICION_PROGRESO}
      />
    </div>
  )
}

export function CargaCrossfade({
  loading,
  skeleton,
  children,
}: {
  loading: boolean
  skeleton: ReactNode
  children: ReactNode
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSICION_ESTADO}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="contenido"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSICION_ESTADO}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function AuthErrorAnimado({
  error,
  children,
}: {
  error: string | null
  children?: ReactNode
}) {
  return (
    <ContenidoColapsable abierto={!!error} deps={[error, children]}>
      {error ? (
        <div className="flex flex-col gap-1" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          {children}
        </div>
      ) : null}
    </ContenidoColapsable>
  )
}

export function ContenidoColapsable({
  abierto,
  children,
  deps = [],
}: {
  abierto: boolean
  children: ReactNode
  deps?: unknown[]
}) {
  return (
    <AutoHeight deps={[abierto, ...deps]} transition={TRANSICION_ESTADO}>
      {abierto ? children : null}
    </AutoHeight>
  )
}
