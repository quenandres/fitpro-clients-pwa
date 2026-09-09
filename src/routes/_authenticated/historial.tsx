import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { historialMock, sesionDelDiaMock } from '@/lib/mock/datos'
import type { SesionHistorial } from '@/types/dominio'

export const Route = createFileRoute('/_authenticated/historial')({
  component: HistorialPage,
})

function DetalleSesion({ sesion }: { sesion: SesionHistorial }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{sesion.nombre}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(sesion.fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">
          {sesion.ejercicios_count} ejercicios · {sesion.volumen_kg.toLocaleString('es-ES')} kg de volumen
        </p>
      </div>
      <Separator />
      <ul className="space-y-3">
        {sesion.series.map((serie, i) => (
          <li key={`${serie.ejercicio_id}-${serie.numero_serie}-${i}`} className="text-sm">
            <span className="font-medium">Serie {serie.numero_serie}</span>
            <span className="text-muted-foreground">
              {' '}
              — {serie.peso_kg > 0 ? `${serie.peso_kg} kg × ` : ''}
              {serie.repeticiones} reps
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HistorialPage() {
  const [seleccionada, setSeleccionada] = useState<SesionHistorial | null>(
    historialMock[0] ?? null,
  )
  const [sheetAbierto, setSheetAbierto] = useState(false)

  if (historialMock.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Historial</h1>
        </header>
        <Card role="status">
          <CardHeader>
            <CardTitle>Todavía no registraste ninguna sesión</CardTitle>
            <CardDescription>
              Cuando completes un entrenamiento, aparecerá aquí.
            </CardDescription>
          </CardHeader>
          {sesionDelDiaMock.sesion && (
            <CardContent>
              <Link
                to="/sesion/$sesionId"
                params={{ sesionId: sesionDelDiaMock.sesion.id }}
                className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
              >
                Ir a la sesión de hoy
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Historial</h1>
        <p className="text-muted-foreground">Tus entrenamientos registrados</p>
      </header>

      <PrototypeBanner mensaje="Datos de ejemplo hasta que exista el log de sesiones en el gateway." />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          {historialMock.map((sesion) => (
            <button
              key={sesion.id}
              type="button"
              onClick={() => {
                setSeleccionada(sesion)
                if (window.innerWidth < 768) setSheetAbierto(true)
              }}
              className={cn(
                'w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent',
                seleccionada?.id === sesion.id && 'border-primary/50 bg-primary/5',
              )}
            >
              <p className="font-medium">{sesion.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(sesion.fecha).toLocaleDateString('es-ES')} ·{' '}
                {sesion.volumen_kg.toLocaleString('es-ES')} kg
              </p>
            </button>
          ))}
        </div>

        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Detalle</CardTitle>
          </CardHeader>
          <CardContent>
            {seleccionada ? (
              <DetalleSesion sesion={seleccionada} />
            ) : (
              <p className="text-muted-foreground">Selecciona una sesión</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="max-h-[85dvh]">
          <SheetHeader>
            <SheetTitle>Detalle de sesión</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto pb-4">
            {seleccionada && <DetalleSesion sesion={seleccionada} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
