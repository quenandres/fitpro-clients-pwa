import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SemanaPlanCard } from '@/components/plan/SemanaPlanCard'
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
            <SemanaPlanCard
              key={semana.numero}
              semana={semana}
              esActual={semana.numero === plan.semana_actual}
              sesionSeleccionadaId={seleccionada?.id ?? null}
              onSeleccionarSesion={seleccionarSesion}
            />
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
