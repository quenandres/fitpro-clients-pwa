import { useState } from 'react'
import { CalendarDays, FileText, Lock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ETIQUETAS_CATEGORIA } from '@/lib/comunidades/display'
import type { Comunidad } from '@/types/comunidad'

type ComunidadHeaderProps = {
  comunidad: Comunidad
  esMiembro: boolean
  joinPending?: boolean
  leavePending?: boolean
  onUnirme: () => void
  onSalir: () => void
}

export function ComunidadHeader({
  comunidad,
  esMiembro,
  joinPending = false,
  leavePending = false,
  onUnirme,
  onSalir,
}: ComunidadHeaderProps) {
  const [confirmarSalir, setConfirmarSalir] = useState(false)
  const esPrivada = comunidad.visibilidad === 'privada'
  const suspendido = comunidad.suspendido ?? false

  return (
    <>
      <section className="space-y-4">
        <div
          className="relative h-28 overflow-hidden rounded-xl bg-cover bg-center md:h-36"
          style={
            comunidad.portadaUrl
              ? { backgroundImage: `url(${comunidad.portadaUrl})` }
              : { background: comunidad.colorPortada }
          }
        >
          {comunidad.avatarUrl ? (
            <img
              src={comunidad.avatarUrl}
              alt=""
              className="absolute bottom-3 left-4 size-16 rounded-xl border-2 border-background object-cover md:size-20"
            />
          ) : (
            <span
              className="absolute bottom-3 left-4 flex size-16 items-center justify-center rounded-xl border-2 border-background text-lg font-bold text-white md:size-20"
              style={{ background: comunidad.colorAvatar }}
            >
              {comunidad.iniciales}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">{comunidad.nombre}</h1>
              {esPrivada && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="size-3" aria-hidden />
                  Privada
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{comunidad.descripcion}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {ETIQUETAS_CATEGORIA[comunidad.categoria]}
              </Badge>
              <span className="inline-flex items-center gap-1">
                <Users className="size-4" aria-hidden />
                {comunidad.miembrosCount} miembros
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="size-4" aria-hidden />
                {comunidad.postsCount} publicaciones
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" aria-hidden />
                {comunidad.eventosCount} eventos
              </span>
            </div>
          </div>

          {esMiembro ? (
            <Button
              variant="outline"
              className="min-h-11"
              disabled={leavePending}
              onClick={() => setConfirmarSalir(true)}
            >
              {leavePending ? 'Saliendo…' : 'Salir'}
            </Button>
          ) : esPrivada ? (
            <p className="max-w-xs rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              Esta comunidad es privada. Necesitas una invitación para unirte.
            </p>
          ) : (
            <Button
              className="min-h-11"
              disabled={joinPending}
              onClick={onUnirme}
            >
              {joinPending ? 'Uniéndote…' : 'Unirme'}
            </Button>
          )}
        </div>

        {suspendido && esMiembro && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Tu cuenta está suspendida en esta comunidad. No puedes publicar,
            comentar ni confirmar asistencia a eventos.
          </p>
        )}
      </section>

      <Dialog open={confirmarSalir} onOpenChange={setConfirmarSalir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir de {comunidad.nombre}?</DialogTitle>
            <DialogDescription>
              Dejarás de ver publicaciones y eventos de esta comunidad. Puedes
              volver a unirte cuando quieras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => setConfirmarSalir(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="min-h-11"
              disabled={leavePending}
              onClick={() => {
                onSalir()
                setConfirmarSalir(false)
              }}
            >
              Salir de la comunidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
