import {
  Link,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Flag,
  Pause,
  Play,
  SkipForward,
} from 'lucide-react'
import {
  CampoMetricaAnimado,
  ImagenEjercicioAmpliada,
  IndicadorSeriesAnimado,
  PanelRegistroDescanso,
  PantallaSesionCompletada,
  ProgresoSesionAnimado,
  RelojDescansoAnimado,
  TecnicaColapsable,
} from '@/components/player/PlayerMotion'
import { Button, buttonVariants } from '@/components/ui/button'
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
  listarSeriesDeSesion,
} from '@/lib/gateway/series'
import { useInvalidateSesionQueries, usePlan } from '@/lib/gateway/hooks'
import { cursorDesdeSeries } from '@/lib/player-cursor'
import { usePlayerStore } from '@/store/player-store'
import type { Sesion } from '@/types/dominio'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/sesion/$sesionId/')({
  validateSearch: (raw: Record<string, unknown>): { ejercicio?: number } => {
    const n = Number(raw.ejercicio)
    if (Number.isInteger(n) && n >= 0) return { ejercicio: n }
    return {}
  },
  component: PlayerPage,
})

function ContenidoTecnicaEjercicio({
  descripcion,
  pasos,
}: {
  descripcion?: string
  pasos: string[]
}) {
  return (
    <div className="space-y-3 px-4 pb-4 md:pt-4">
      {descripcion ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {descripcion}
        </p>
      ) : null}
      {pasos.length > 0 ? (
        <ol className="space-y-2">
          {pasos.map((paso, i) => (
            <li key={paso} className="flex gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold tabular-nums text-primary">
                {i + 1}
              </span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

function PlayerPage() {
  const { sesionId } = Route.useParams()
  const { ejercicio: ejercicioInicio = 0 } = Route.useSearch()
  const navigate = useNavigate()
  const { data: plan, isLoading: planLoading } = usePlan()
  const invalidateSesionQueries = useInvalidateSesionQueries()
  const sesion = plan?.semanas
    .flatMap((s) => s.sesiones)
    .find((s) => s.id === sesionId)

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

  return (
    <PlayerSesionActiva
      key={`${sesionId}-${ejercicioInicio}`}
      sesion={sesion}
      sesionId={sesionId}
      ejercicioInicio={ejercicioInicio}
      navigate={navigate}
      invalidateSesionQueries={invalidateSesionQueries}
    />
  )
}

function PlayerSesionActiva({
  sesion,
  sesionId,
  ejercicioInicio,
  navigate,
  invalidateSesionQueries,
}: {
  sesion: Sesion
  sesionId: string
  ejercicioInicio: number
  navigate: ReturnType<typeof useNavigate>
  invalidateSesionQueries: ReturnType<typeof useInvalidateSesionQueries>
}) {
  const [executionSessionId, setExecutionSessionId] = useState<string | null>(
    null,
  )
  const [iniciando, setIniciando] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [dialogSalir, setDialogSalir] = useState(false)
  const [dialogTerminar, setDialogTerminar] = useState(false)
  const [terminando, setTerminando] = useState(false)
  const [verTecnica, setVerTecnica] = useState(false)
  const [imagenAbierta, setImagenAbierta] = useState(false)
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
    hidratarSeries,
    avanzarSerie,
    setErrorGuardado,
    reset,
  } = usePlayerStore()

  const ejercicio = sesion?.ejercicios[ejercicioIndex]
  const totalEjercicios = sesion?.ejercicios.length ?? 0
  const totalSeries = ejercicio?.series ?? 0

  useEffect(() => {
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
    let cancelled = false
    void iniciarSesion(sesionId)
      .then(async (s) => {
        if (cancelled) return
        setExecutionSessionId(s.id)
        const series = await listarSeriesDeSesion(s.id)
        if (cancelled) return
        const cursor = cursorDesdeSeries(sesion.ejercicios, series)
        if (series.length > 0) {
          const nextEj = sesion.ejercicios[cursor.ejercicioIndex]
          hidratarSeries(
            series,
            cursor.ejercicioIndex,
            cursor.serieIndex,
            cursor.done ? 'done' : 'idle',
          )
          if (nextEj) {
            setPeso(nextEj.peso_objetivo_kg ?? 0)
            setRepeticiones(nextEj.repeticiones)
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorGuardado('No se pudo abrir la sesión. Reintenta.')
        }
      })
      .finally(() => {
        if (!cancelled) setIniciando(false)
      })
    return () => {
      cancelled = true
      reset()
    }
  }, [
    sesionId,
    sesion,
    ejercicioInicio,
    initSesion,
    reset,
    hidratarSeries,
    setPeso,
    setRepeticiones,
    setErrorGuardado,
  ])

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

  async function completarSerie() {
    if (!ejercicio || !executionSessionId) {
      setErrorGuardado('La sesión aún no está lista. Espera un momento.')
      return
    }
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
      setPausaDescanso(false)
    } catch {
      setFase('idle')
      setErrorGuardado('Error al guardar. Reintenta.')
    }
  }

  async function finalizarSesion() {
    if (!executionSessionId) {
      setErrorGuardado('La sesión no se llegó a abrir. Vuelve a Hoy e inténtalo de nuevo.')
      setDialogTerminar(false)
      return
    }
    setTerminando(true)
    try {
      await completarSesion(executionSessionId)
      await invalidateSesionQueries()
      await navigate({ to: '/' })
    } catch {
      setErrorGuardado('No se pudo cerrar la sesión. Reintenta.')
      setDialogTerminar(false)
    } finally {
      setTerminando(false)
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
      <PantallaSesionCompletada
        seriesCount={seriesConfirmadas.length}
        terminando={terminando}
        errorGuardado={errorGuardado}
        onListo={() => void finalizarSesion()}
      />
    )
  }

  const totalSeriesSesion = sesion.ejercicios.reduce((acc, e) => acc + e.series, 0)
  const progresoPct =
    totalSeriesSesion > 0
      ? Math.round((seriesConfirmadas.length / totalSeriesSesion) * 100)
      : 0
  const seriesHechasEjercicio = ejercicio
    ? seriesConfirmadas.filter((s) => s.ejercicio_id === ejercicio.ejercicio_id)
        .length
    : 0
  const siguienteLabel =
    serieIndex + 1 < totalSeries
      ? `Serie ${serieIndex + 2} de ${totalSeries}`
      : sesion.ejercicios[ejercicioIndex + 1]?.nombre ?? 'Última serie'
  const imagenSrc = ejercicio ? (ejercicio.gif_url ?? ejercicio.imagen_url) : undefined

  return (
    <div className="-mx-4 -mt-4 -mb-4 flex min-h-dvh flex-col bg-background md:mx-0 md:mt-0 md:mb-0 md:min-h-[calc(100dvh-2rem)]">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center gap-2 px-2 py-2 md:px-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-full"
            aria-label="Salir del entrenamiento"
            onClick={() => setDialogSalir(true)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{sesion.nombre}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              Ejercicio {ejercicioIndex + 1} de {totalEjercicios} ·{' '}
              {seriesConfirmadas.length}/{totalSeriesSesion} series
            </p>
          </div>
          <Button
            variant="ghost"
            className="min-h-11 shrink-0 gap-1.5 px-3 text-destructive hover:text-destructive"
            disabled={fase === 'saving' || terminando}
            onClick={() => setDialogTerminar(true)}
          >
            <Flag className="size-4" aria-hidden />
            Terminar
          </Button>
        </div>
        <ProgresoSesionAnimado
          value={progresoPct}
          aria-label="Progreso de la sesión"
        />
      </header>

      <div className="flex flex-1 flex-col md:grid md:grid-cols-2 md:gap-8 md:pt-6">
        {imagenSrc ? (
          <div className="hidden overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 md:block">
            <img
              src={imagenSrc}
              alt={`Cómo hacer ${ejercicio?.nombre ?? ''}`}
              className="h-full max-h-[32rem] w-full object-contain"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 px-4 pt-4 pb-4 md:px-0 md:pt-0">
            {errorGuardado && (
              <p
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {errorGuardado}
              </p>
            )}

            {ejercicio && (
              <section className="flex items-start gap-3">
                {imagenSrc ? (
                  <button
                    type="button"
                    className="shrink-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-transform active:scale-[.97] focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                    aria-label={`Ampliar imagen de ${ejercicio.nombre}`}
                    onClick={() => setImagenAbierta(true)}
                  >
                    <img
                      src={imagenSrc}
                      alt=""
                      className="size-20 object-contain"
                    />
                  </button>
                ) : null}
                <div className="min-w-0 flex-1 space-y-1">
                  <h1 className="text-xl leading-tight font-bold md:text-2xl">
                    {ejercicio.nombre}
                  </h1>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {ejercicio.series} × {ejercicio.repeticiones} reps
                    {ejercicio.peso_objetivo_kg
                      ? ` · ${ejercicio.peso_objetivo_kg} kg`
                      : ''}
                  </p>
                  <IndicadorSeriesAnimado
                    total={totalSeries}
                    hechas={seriesHechasEjercicio}
                    actual={serieIndex}
                  />
                </div>
              </section>
            )}

            {ejercicio && (ejercicio.descripcion || ejercicio.pasos.length > 0) && (
              <section className="rounded-xl bg-card ring-1 ring-foreground/10">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2 text-sm font-medium md:hidden"
                  aria-expanded={verTecnica}
                  onClick={() => setVerTecnica((v) => !v)}
                >
                  Cómo hacerlo
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform',
                      verTecnica && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </button>
                <TecnicaColapsable abierto={verTecnica}>
                  <ContenidoTecnicaEjercicio
                    descripcion={ejercicio.descripcion}
                    pasos={ejercicio.pasos}
                  />
                </TecnicaColapsable>
                <div className="hidden md:block">
                  <ContenidoTecnicaEjercicio
                    descripcion={ejercicio.descripcion}
                    pasos={ejercicio.pasos}
                  />
                </div>
              </section>
            )}
          </div>

          <div
            className="sticky bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:static md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
          >
            <PanelRegistroDescanso
              fase={fase}
              panelDescanso={
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Descanso · siguiente: {siguienteLabel}
                  </p>
                  <RelojDescansoAnimado
                    segundos={descansoSegundos}
                    total={descansoTotal}
                  />
                  <div className="grid w-full grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-14 rounded-full"
                      onClick={() => {
                        const next = descansoSegundos + 30
                        setDescanso(next)
                        setDescansoTotal((t) => Math.max(t, next))
                      }}
                    >
                      +30 s
                    </Button>
                    <Button
                      type="button"
                      className="min-h-14 rounded-full"
                      aria-label={
                        pausaDescanso ? 'Reanudar descanso' : 'Pausar descanso'
                      }
                      onClick={() => setPausaDescanso((v) => !v)}
                    >
                      {pausaDescanso ? (
                        <Play className="size-5" />
                      ) : (
                        <Pause className="size-5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-14 rounded-full"
                      onClick={saltarDescanso}
                    >
                      <SkipForward className="size-5" aria-hidden />
                      Saltar
                    </Button>
                  </div>
                </div>
              }
              panelRegistro={
                <div className="space-y-3">
                  <CampoMetricaAnimado
                    label="Peso"
                    unidad="kg"
                    value={pesoKg}
                    onChange={setPeso}
                    step={2.5}
                    inputMode="decimal"
                    decimalPlaces={1}
                  />
                  <CampoMetricaAnimado
                    label="Reps"
                    unidad={`de ${ejercicio?.repeticiones ?? 0}`}
                    value={repeticiones}
                    onChange={setRepeticiones}
                    step={1}
                    inputMode="numeric"
                  />
                  <Button
                    size="lg"
                    className="min-h-14 w-full text-base"
                    disabled={
                      fase === 'saving' || iniciando || !executionSessionId
                    }
                    onClick={() => void completarSerie()}
                  >
                    {iniciando
                      ? 'Abriendo sesión…'
                      : fase === 'saving'
                        ? 'Guardando…'
                        : `Completar serie ${serieIndex + 1} de ${totalSeries}`}
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <Dialog open={imagenAbierta} onOpenChange={setImagenAbierta}>
        <DialogContent className="p-2">
          <DialogTitle className="sr-only">{ejercicio?.nombre}</DialogTitle>
          {imagenSrc ? (
            <ImagenEjercicioAmpliada
              src={imagenSrc}
              alt={`Cómo hacer ${ejercicio?.nombre ?? ''}`}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogTerminar} onOpenChange={(o) => !terminando && setDialogTerminar(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Terminar la rutina ahora?</DialogTitle>
            <DialogDescription>
              Registraste {seriesConfirmadas.length} de {totalSeriesSesion} series.
              {seriesConfirmadas.length < totalSeriesSesion
                ? ' Las series que faltan quedarán sin registrar y la sesión se marcará como terminada.'
                : ' La sesión se marcará como terminada.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              disabled={terminando}
              onClick={() => setDialogTerminar(false)}
            >
              Seguir entrenando
            </Button>
            <Button
              variant="destructive"
              disabled={terminando}
              onClick={() => void finalizarSesion()}
            >
              {terminando ? 'Terminando…' : 'Terminar rutina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogSalir} onOpenChange={setDialogSalir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir del entrenamiento?</DialogTitle>
            <DialogDescription>
              {seriesConfirmadas.length > 0
                ? 'Tus series registradas quedan guardadas. Podrás retomar la sesión donde la dejaste.'
                : 'Podrás volver a empezar cuando quieras.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogSalir(false)}>
              Seguir entrenando
            </Button>
            <Button
              variant="secondary"
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
