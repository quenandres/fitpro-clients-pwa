import {
  Link,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Minus,
  Pause,
  Play,
  Plus,
  SkipForward,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  completarSesion,
  guardarSerie,
  iniciarSesion,
} from '@/lib/gateway/series'
import { usePlan } from '@/lib/gateway/hooks'
import { usePlayerStore } from '@/store/player-store'
import { cn } from '@/lib/utils'
import type { EjercicioPrescrito } from '@/types/dominio'

export const Route = createFileRoute('/_authenticated/sesion/$sesionId/')({
  validateSearch: (raw: Record<string, unknown>): { ejercicio?: number } => {
    const n = Number(raw.ejercicio)
    if (Number.isInteger(n) && n >= 0) return { ejercicio: n }
    return {}
  },
  component: PlayerPage,
})

function formatMmSs(total: number) {
  const m = Math.floor(Math.max(total, 0) / 60)
  const s = Math.max(total, 0) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function PlayerPage() {
  const { sesionId } = Route.useParams()
  const { ejercicio: ejercicioInicio = 0 } = Route.useSearch()
  const navigate = useNavigate()
  const { data: plan, isLoading: planLoading } = usePlan()
  const sesion = plan?.semanas
    .flatMap((s) => s.sesiones)
    .find((s) => s.id === sesionId)
  const [executionSessionId, setExecutionSessionId] = useState<string | null>(
    null,
  )
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [dialogSalir, setDialogSalir] = useState(false)
  const [pausaDescanso, setPausaDescanso] = useState(false)
  const [descansoTotal, setDescansoTotal] = useState(90)

  const {
    ejercicioIndex,
    serieIndex,
    pesoKg,
    repeticiones,
    fase,
    descansoSegundos,
    seriesConfirmadas,
    errorGuardado,
    initSesion,
    setPeso,
    setRepeticiones,
    setFase,
    setDescanso,
    agregarSerieConfirmada,
    avanzarSerie,
    setErrorGuardado,
    reset,
  } = usePlayerStore()

  const ejercicio = sesion?.ejercicios[ejercicioIndex]
  const totalEjercicios = sesion?.ejercicios.length ?? 0
  const totalSeries = ejercicio?.series ?? 0

  useEffect(() => {
    if (!sesion) return
    const idx = Math.min(
      ejercicioInicio,
      Math.max(sesion.ejercicios.length - 1, 0),
    )
    const ej = sesion.ejercicios[idx]
    initSesion(
      sesionId,
      idx,
      ej?.peso_objetivo_kg ?? 0,
      ej?.repeticiones ?? 0,
    )
    void iniciarSesion(sesionId).then((s) => setExecutionSessionId(s.id))
    return () => reset()
  }, [sesionId, sesion, initSesion, reset, ejercicioInicio])

  useEffect(() => {
    if (fase === 'rest') setPausaDescanso(false)
  }, [fase])

  useEffect(() => {
    if (fase === 'rest' && descansoSegundos > descansoTotal) {
      setDescansoTotal(descansoSegundos)
    }
  }, [fase, descansoSegundos, descansoTotal])

  useEffect(() => {
    if (fase !== 'rest' || pausaDescanso || descansoSegundos <= 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      const current = usePlayerStore.getState().descansoSegundos
      if (current <= 1) {
        avanzarSerie(totalSeries, totalEjercicios)
        if (sesion?.ejercicios[usePlayerStore.getState().ejercicioIndex]) {
          const nextEj =
            sesion.ejercicios[usePlayerStore.getState().ejercicioIndex]
          setPeso(nextEj.peso_objetivo_kg ?? pesoKg)
          setRepeticiones(nextEj.repeticiones)
        }
      } else {
        setDescanso(current - 1)
      }
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [
    fase,
    pausaDescanso,
    descansoSegundos,
    avanzarSerie,
    totalSeries,
    totalEjercicios,
    sesion,
    setDescanso,
    setPeso,
    setRepeticiones,
    pesoKg,
  ])

  if (planLoading) {
    return <p className="p-4 text-muted-foreground">Cargando sesión…</p>
  }

  if (!sesion) {
    return (
      <div className="space-y-4">
        <p role="alert">No encontramos esta sesión.</p>
        <Link
          to="/"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          Volver a Hoy
        </Link>
      </div>
    )
  }

  async function completarSerie() {
    if (!ejercicio || !executionSessionId) return
    setFase('saving')
    setErrorGuardado(null)
    try {
      const serie = await guardarSerie({
        session_id: executionSessionId,
        ejercicio_id: ejercicio.ejercicio_id,
        numero_serie: serieIndex + 1,
        peso_kg: pesoKg,
        repeticiones,
      })
      agregarSerieConfirmada(serie)
      setDescansoTotal(90)
    } catch {
      setFase('idle')
      setErrorGuardado('Error al guardar. Reintenta.')
    }
  }

  function saltarDescanso() {
    avanzarSerie(totalSeries, totalEjercicios)
    const nextIdx = usePlayerStore.getState().ejercicioIndex
    const nextEj = sesion!.ejercicios[nextIdx]
    if (nextEj) {
      setPeso(nextEj.peso_objetivo_kg ?? 0)
      setRepeticiones(nextEj.repeticiones)
    }
  }

  if (fase === 'done') {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center space-y-6 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Check className="size-12 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold">¡Entrenamiento terminado!</h1>
          <p className="mt-2 text-muted-foreground">
            {seriesConfirmadas.length} series registradas
          </p>
        </div>
        <Button
          size="lg"
          className="w-full max-w-sm"
          onClick={() => {
            if (executionSessionId) {
              void completarSesion(executionSessionId)
            }
            void navigate({ to: '/' })
          }}
        >
          Listo
        </Button>
      </div>
    )
  }

  return (
    <div className="-mx-4 -mt-4 flex min-h-dvh flex-col bg-background md:mx-0 md:mt-0 md:min-h-[calc(100dvh-2rem)]">
      <div className="grid flex-1 md:grid-cols-2 md:gap-8 md:px-0">
        <HeroEjercicio
          ejercicio={ejercicio}
          onSalir={() => setDialogSalir(true)}
        />

        <div className="flex flex-1 flex-col px-4 pb-6 pt-5 md:px-0 md:pt-2">
          {errorGuardado && (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {errorGuardado}
            </p>
          )}

          {ejercicio && (
            <header className="mb-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sesion.nombre} · ejercicio {ejercicioIndex + 1} de{' '}
                {totalEjercicios}
              </p>
              <h1 className="text-2xl font-bold">{ejercicio.nombre}</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {ejercicio.descripcion}
              </p>
            </header>
          )}

          {ejercicio && (
            <ol className="mb-5 space-y-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              {ejercicio.pasos.map((paso, i) => (
                <li key={paso} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold tabular-nums text-primary">
                    {i + 1}
                  </span>
                  <span>{paso}</span>
                </li>
              ))}
            </ol>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3">
            <MetricaChip
              etiqueta="Serie"
              valor={`${serieIndex + 1}/${totalSeries}`}
            />
            <MetricaChip
              etiqueta="Reps"
              valor={`${repeticiones}/${ejercicio?.repeticiones ?? 0}`}
            />
          </div>

          {fase === 'rest' ? (
            <div className="mt-auto flex flex-col items-center gap-6 pb-2">
              <RelojDescanso
                segundos={descansoSegundos}
                total={descansoTotal}
              />
              <div className="flex w-full items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-14 min-w-20 rounded-full px-5"
                  onClick={() => setDescanso(descansoSegundos + 30)}
                >
                  +30 s
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="size-16 rounded-full"
                  aria-label={pausaDescanso ? 'Reanudar descanso' : 'Pausar descanso'}
                  onClick={() => setPausaDescanso((v) => !v)}
                >
                  {pausaDescanso ? (
                    <Play className="size-6" />
                  ) : (
                    <Pause className="size-6" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-14 min-w-20 rounded-full px-5"
                  onClick={saltarDescanso}
                >
                  <SkipForward className="size-5" aria-hidden />
                  Saltar
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-auto space-y-6 pb-2">
              <div className="grid grid-cols-2 gap-4">
                <CampoMetrica
                  label="Peso (kg)"
                  value={pesoKg}
                  onChange={setPeso}
                  step={2.5}
                  inputMode="decimal"
                />
                <CampoMetrica
                  label="Reps"
                  value={repeticiones}
                  onChange={setRepeticiones}
                  step={1}
                  inputMode="numeric"
                />
              </div>
              <Button
                size="lg"
                className="min-h-14 w-full text-base"
                disabled={fase === 'saving'}
                onClick={() => void completarSerie()}
              >
                {fase === 'saving' ? 'Guardando…' : 'Completar serie'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogSalir} onOpenChange={setDialogSalir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir del entrenamiento?</DialogTitle>
            <DialogDescription>
              {seriesConfirmadas.length > 0
                ? 'Tienes series registradas en esta sesión. Si sales, el progreso no guardado se perderá.'
                : 'Podrás volver a empezar cuando quieras.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogSalir(false)}>
              Seguir entrenando
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                void navigate({
                  to: '/sesion/$sesionId/detalle',
                  params: { sesionId },
                })
              }
            >
              Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HeroEjercicio({
  ejercicio,
  onSalir,
}: {
  ejercicio: EjercicioPrescrito | undefined
  onSalir: () => void
}) {
  return (
    <div className="relative isolate overflow-hidden bg-card md:rounded-3xl">
      {ejercicio ? (
        <img
          src={ejercicio.gif_url ?? ejercicio.imagen_url}
          alt={`Cómo hacer ${ejercicio.nombre}`}
          className="h-[38dvh] w-full bg-background object-contain object-center md:h-full md:min-h-[32rem]"
        />
      ) : (
        <div className="h-[38dvh] bg-muted md:min-h-[32rem]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-3 left-3 z-10 size-11 rounded-full"
        aria-label="Salir del entrenamiento"
        onClick={onSalir}
      >
        <ArrowLeft className="size-5" />
      </Button>
    </div>
  )
}

function MetricaChip({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-secondary px-4 py-3 text-center">
      <p className="text-xs font-medium text-muted-foreground">{etiqueta}</p>
      <p className="text-xl font-bold tabular-nums">{valor}</p>
    </div>
  )
}

function RelojDescanso({
  segundos,
  total,
}: {
  segundos: number
  total: number
}) {
  const r = 86
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(segundos / total, 1) : 0
  return (
    <div className="relative size-56">
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
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <p className="absolute inset-0 flex items-center justify-center text-5xl font-bold tabular-nums">
        {formatMmSs(segundos)}
      </p>
    </div>
  )
}

function CampoMetrica({
  label,
  value,
  onChange,
  step,
  inputMode,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step: number
  inputMode: 'decimal' | 'numeric'
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2">
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
        <Input
          type="number"
          inputMode={inputMode}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-16 w-24 border-0 bg-transparent text-center text-4xl font-bold tabular-nums shadow-none focus-visible:ring-0"
        />
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
    </div>
  )
}
