import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { SesionPreview } from '@/components/SesionPreview'
import { usePlan } from '@/lib/gateway/hooks'
import type { Sesion } from '@/types/dominio'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/plan')({
  component: PlanPage,
})

function PlanPage() {
  const { data: plan, isLoading, isError } = usePlan()
  const [seleccionada, setSeleccionada] = useState<Sesion | null>(null)
  const [sheetAbierto, setSheetAbierto] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Tu plan</h1>
          <p className="text-muted-foreground">Cargando…</p>
        </header>
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Tu plan</h1>
          <p className="text-muted-foreground">
            Aún no tienes un plan activo asignado.
          </p>
        </header>
      </div>
    )
  }

  function seleccionarSesion(sesion: Sesion) {
    setSeleccionada(sesion)
    if (window.innerWidth < 768) {
      setSheetAbierto(true)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Tu plan</h1>
        <p className="text-muted-foreground">
          {plan.nombre} · Semana {plan.semana_actual}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {plan.semanas.map((semana) => (
            <Card key={semana.numero}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Semana {semana.numero}
                  {semana.numero === plan.semana_actual && (
                    <Badge className="ml-2" variant="secondary">
                      Actual
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-0 pb-2">
                {semana.sesiones.map((sesion) => (
                  <button
                    key={sesion.id}
                    type="button"
                    onClick={() => seleccionarSesion(sesion)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent',
                      seleccionada?.id === sesion.id && 'bg-primary/10',
                    )}
                  >
                    <div>
                      <p className="font-medium">{sesion.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {sesion.dia}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {sesion.estado === 'completada'
                          ? 'Hecha'
                          : sesion.estado === 'hoy'
                            ? 'Hoy'
                            : 'Pendiente'}
                      </Badge>
                      <ChevronRight className="size-4 text-muted-foreground md:hidden" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="hidden md:flex md:flex-col">
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>
              {seleccionada
                ? 'Ejercicios de la sesión seleccionada'
                : 'Selecciona una sesión'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {seleccionada ? (
              <SesionPreview sesion={seleccionada} />
            ) : (
              <p className="text-muted-foreground" role="status">
                Toca una sesión para ver los ejercicios
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="max-h-[85dvh]">
          <SheetHeader>
            <SheetTitle>Vista previa</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto pb-4">
            {seleccionada && (
              <SesionPreview
                sesion={seleccionada}
                onCerrar={() => setSheetAbierto(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
