import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Camera, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { cn } from '@/lib/utils'
import type { FotoProgreso } from '@/types/dominio'

export const Route = createFileRoute('/_authenticated/progreso')({
  component: ProgresoPage,
})

function ProgresoPage() {
  const [fotos, setFotos] = useState<FotoProgreso[]>([])
  const [antesId, setAntesId] = useState<string | null>(null)
  const [despuesId, setDespuesId] = useState<string | null>(null)
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [borrarId, setBorrarId] = useState<string | null>(null)

  const fotoAntes = fotos.find((f) => f.id === antesId)
  const fotoDespues = fotos.find((f) => f.id === despuesId)

  async function simularSubida(file: File) {
    setSubiendo(true)
    setError(null)
    try {
      // Prototipo: no hay endpoint en gateway (C1, C9)
      await new Promise((r) => setTimeout(r, 800))
      const nueva: FotoProgreso = {
        id: crypto.randomUUID(),
        creada_en: new Date().toISOString(),
        url: URL.createObjectURL(file),
      }
      setFotos((prev) => [nueva, ...prev])
      if (!antesId) setAntesId(nueva.id)
      else if (!despuesId) setDespuesId(nueva.id)
      setSheetAbierto(false)
    } catch {
      setError('No se pudo subir la foto. El backend de fotos aún no existe.')
    } finally {
      setSubiendo(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void simularSubida(file)
    e.target.value = ''
  }

  function confirmarBorrado() {
    if (!borrarId) return
    setFotos((prev) => prev.filter((f) => f.id !== borrarId))
    if (antesId === borrarId) setAntesId(null)
    if (despuesId === borrarId) setDespuesId(null)
    setBorrarId(null)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Progreso</h1>
        <p className="text-muted-foreground">Compara tu evolución con fotos</p>
      </header>

      <PrototypeBanner mensaje="Prototipo: las fotos se guardan solo en memoria local de esta sesión. El gateway aún no tiene Storage ni API de progreso." />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {fotos.length === 0 ? (
            <Card role="status">
              <CardHeader>
                <CardTitle>Todavía no hay fotos</CardTitle>
                <CardDescription>
                  Saca la primera para ver tu progreso.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <ComparadorSlot
                label="Antes"
                foto={fotoAntes}
                vacio="Selecciona una foto abajo"
              />
              <ComparadorSlot
                label="Después"
                foto={fotoDespues}
                vacio={
                  fotos.length < 2
                    ? 'Añade otra foto para comparar'
                    : 'Selecciona una foto abajo'
                }
              />
            </div>
          )}

          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={() => setSheetAbierto(true)}
            disabled={subiendo}
          >
            <ImagePlus className="size-5" aria-hidden />
            {subiendo ? 'Subiendo…' : 'Añadir foto'}
          </Button>
        </div>

        {fotos.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Línea de tiempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="flex items-center gap-2 rounded-lg border border-border p-2"
                >
                  <img
                    src={foto.url}
                    alt=""
                    className="size-12 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(foto.creada_en).toLocaleDateString('es-ES')}
                    </p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAntesId(foto.id)}
                        className={cn(
                          'rounded px-1.5 py-0.5 text-xs',
                          antesId === foto.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:bg-accent',
                        )}
                      >
                        Antes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDespuesId(foto.id)}
                        className={cn(
                          'rounded px-1.5 py-0.5 text-xs',
                          despuesId === foto.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:bg-accent',
                        )}
                      >
                        Después
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive"
                    aria-label="Eliminar foto"
                    onClick={() => setBorrarId(foto.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Añadir foto</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3 pb-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 hover:bg-accent">
              <Camera className="size-6 text-primary" aria-hidden />
              <span className="font-medium">Tomar foto</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileChange}
                disabled={subiendo}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 hover:bg-accent">
              <ImagePlus className="size-6 text-primary" aria-hidden />
              <span className="font-medium">Elegir de galería</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                disabled={subiendo}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              En producción, la foto se subirá al gateway cuando exista el
              endpoint. Por ahora es solo una vista previa local.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!borrarId} onOpenChange={() => setBorrarId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta foto?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setBorrarId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarBorrado}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ComparadorSlot({
  label,
  foto,
  vacio,
}: {
  label: string
  foto?: FotoProgreso
  vacio: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        {foto && (
          <CardDescription>
            {new Date(foto.creada_en).toLocaleDateString('es-ES')}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {foto ? (
          <img
            src={foto.url}
            alt={`Foto ${label.toLowerCase()}`}
            className="aspect-[3/4] w-full rounded-lg object-cover"
          />
        ) : (
          <div
            className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground"
            role="status"
          >
            {vacio}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
