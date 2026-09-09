import {
  Link,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Minus, Plus, SkipForward } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { SeriesEndpointMissingError, guardarSerie } from '@/lib/gateway/series'
import { getSesionById } from '@/lib/mock/datos'
import { usePlayerStore } from '@/store/player-store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/sesion/$sesionId')({
  component: PlayerPage,
})

function PlayerPage() {
  const { sesionId } = Route.useParams()
  const navigate = useNavigate()
  const sesion = getSesionById(sesionId)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [dialogSalir, setDialogSalir] = useState(false)

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
  const progresoEjercicios =
    totalEjercicios > 0 ? ((ejercicioIndex + 1) / totalEjercicios) * 100 : 0

  useEffect(() => {
    if (!sesion) return
    const ej = sesion.ejercicios[0]
    initSesion(
      sesionId,
      0,
      ej?.peso_objetivo_kg ?? 0,
      ej?.repeticiones ?? 0,
    )
    return () => reset()
  }, [sesionId, sesion, initSesion, reset])

  useEffect(() => {
    if (fase !== 'rest' || descansoSegundos <= 0) {
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
    if (!ejercicio) return
    setFase('saving')
    setErrorGuardado(null)
    try {
      const serie = await guardarSerie({
        sesion_id: sesionId,
        ejercicio_id: ejercicio.ejercicio_id,
        numero_serie: serieIndex + 1,
        peso_kg: pesoKg,
        repeticiones,
      })
      agregarSerieConfirmada(serie)
    } catch (err) {
      if (err instanceof SeriesEndpointMissingError) {
        // Prototipo: simular confirmación local con banner visible
        agregarSerieConfirmada({
          ejercicio_id: ejercicio.ejercicio_id,
          numero_serie: serieIndex + 1,
          peso_kg: pesoKg,
          repeticiones,
          confirmada: false,
        })
        setErrorGuardado(
          'Modo prototipo: la serie no se guardó en el servidor.',
        )
      } else {
        setFase('idle')
        setErrorGuardado('Error al guardar. Reintenta.')
      }
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
        <PrototypeBanner mensaje="Sin endpoint de series en el gateway, el log no persiste entre sesiones." />
        <Button
          size="lg"
          className="w-full max-w-sm"
          onClick={() => void navigate({ to: '/' })}
        >
          Listo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <header className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label="Salir del entrenamiento"
          onClick={() => setDialogSalir(true)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">{sesion.nombre}</h1>
          <p className="text-sm tabular-nums text-muted-foreground">
            Ejercicio {ejercicioIndex + 1} de {totalEjercicios} · Serie{' '}
            {serieIndex + 1} de {totalSeries}
          </p>
        </div>
      </header>

      <PrototypeBanner mensaje="Player en modo prototipo: no hay endpoint de persistencia de series en gym-gateway." />

      {errorGuardado && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400" role="alert">
          {errorGuardado}
        </p>
      )}

      <Progress value={progresoEjercicios} className="mb-6 h-2" />

      <div className="grid flex-1 gap-6 md:grid-cols-2">
        <aside className="hidden space-y-2 md:block">
          <p className="text-sm font-medium text-muted-foreground">Ejercicios</p>
          <ul className="space-y-1">
            {sesion.ejercicios.map((ej, i) => (
              <li
                key={ej.ejercicio_id}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  i === ejercicioIndex
                    ? 'bg-primary/10 font-medium text-primary'
                    : i < ejercicioIndex
                      ? 'text-muted-foreground line-through'
                      : 'text-muted-foreground',
                )}
              >
                {ej.nombre}
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col">
          {fase === 'rest' ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 py-8">
              <p className="text-sm text-muted-foreground">Descanso</p>
              <p className="text-5xl font-bold tabular-nums">
                {descansoSegundos}s
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="min-h-14"
                  onClick={() => setDescanso(descansoSegundos + 30)}
                >
                  +30 s
                </Button>
                <Button
                  size="lg"
                  className="min-h-14"
                  onClick={saltarDescanso}
                >
                  <SkipForward className="size-5" aria-hidden />
                  Saltar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-2 md:text-center">
                <h2 className="text-xl font-semibold md:text-2xl">
                  {ejercicio?.nombre}
                </h2>
                <p className="text-muted-foreground">
                  Objetivo: {ejercicio?.series}×{ejercicio?.repeticiones}
                  {ejercicio?.peso_objetivo_kg
                    ? ` · ${ejercicio.peso_objetivo_kg} kg`
                    : ''}
                </p>
              </div>

              <div className="mt-auto space-y-6 pb-4 pt-8 md:pt-4">
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
            </>
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
              onClick={() => void navigate({ to: '/' })}
            >
              Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
