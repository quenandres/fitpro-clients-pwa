import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Search, ShieldCheck, ShieldOff, UserX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListaItemsAnimada } from '@/components/comunidades/ComunidadesMotion'
import { CargaCrossfade } from '@/components/motion/DashboardMotion'
import { Skeleton } from '@/components/ui/skeleton'
import {
  puedeAdministrarComunidad,
  puedeModerarComunidad,
} from '@/lib/comunidades/display'
import {
  useComunidad,
  useComunidadMiembros,
  useRemoveMiembro,
  useUpdateMiembro,
} from '@/lib/gateway/comunidades-hooks'
import type { MiembroComunidad, RolComunidad } from '@/types/comunidad'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/_authenticated/comunidades/$comunidadId/miembros',
)({
  component: ComunidadMiembrosPage,
})

const ROL_ETIQUETA: Record<RolComunidad, string> = {
  member: 'Miembro',
  moderator: 'Moderador',
  leader: 'Líder',
}

function ComunidadMiembrosPage() {
  const { comunidadId } = Route.useParams()
  const { data: comunidad } = useComunidad(comunidadId)
  const { data: miembros = [], isLoading, isError, refetch } =
    useComunidadMiembros(comunidadId)
  const updateMiembro = useUpdateMiembro(comunidadId)
  const removeMiembro = useRemoveMiembro(comunidadId)
  const [busqueda, setBusqueda] = useState('')

  const puedeModerar = puedeModerarComunidad(comunidad?.miRol)
  const puedeAdministrar = puedeAdministrarComunidad(comunidad?.miRol)

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return miembros
    const q = busqueda.trim().toLowerCase()
    return miembros.filter((m) => m.nombre.toLowerCase().includes(q))
  }, [miembros, busqueda])

  function cambiarRol(miembro: MiembroComunidad, rol: RolComunidad) {
    updateMiembro.mutate(
      { userId: miembro.id, rol },
      {
        onSuccess: () => toast.success(`Rol de ${miembro.nombre} actualizado`),
        onError: () =>
          toast.error('No se pudo cambiar el rol. Inténtalo de nuevo.'),
      },
    )
  }

  function toggleSuspender(miembro: MiembroComunidad) {
    updateMiembro.mutate(
      { userId: miembro.id, suspendido: !miembro.suspendido },
      {
        onSuccess: () =>
          toast.success(
            miembro.suspendido
              ? `${miembro.nombre} reactivado`
              : `${miembro.nombre} suspendido`,
          ),
        onError: () =>
          toast.error('No se pudo actualizar al miembro. Inténtalo de nuevo.'),
      },
    )
  }

  function expulsar(miembro: MiembroComunidad) {
    removeMiembro.mutate(miembro.id, {
      onSuccess: () => toast.success(`${miembro.nombre} eliminado de la comunidad`),
      onError: () =>
        toast.error('No se pudo eliminar al miembro. Inténtalo de nuevo.'),
    })
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-destructive/30 px-4 py-8 text-center text-sm text-destructive">
        No pudimos cargar los miembros.{' '}
        <button type="button" className="underline" onClick={() => void refetch()}>
          Reintentar
        </button>
      </p>
    )
  }

  return (
    <CargaCrossfade
      loading={isLoading}
      skeleton={<Skeleton className="h-48 rounded-xl" />}
    >
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Miembros ({miembros.length})
      </h2>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar miembro…"
          className="min-h-11 pl-9"
          aria-label="Buscar miembro"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay miembros que coincidan con la búsqueda.
        </p>
      ) : (
        <ListaItemsAnimada
          className="space-y-2"
          items={filtrados}
          renderItem={(miembro) => (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {miembro.iniciales}
                </span>
                <div>
                  <p className="font-medium">{miembro.nombre}</p>
                  <div className="flex flex-wrap gap-1">
                    {miembro.rol && (
                      <Badge variant="outline">{ROL_ETIQUETA[miembro.rol]}</Badge>
                    )}
                    {miembro.suspendido && (
                      <Badge variant="destructive">Suspendido</Badge>
                    )}
                  </div>
                </div>
              </div>

              {puedeModerar && miembro.rol !== 'leader' && (
                <div className="flex flex-wrap gap-2">
                  {puedeAdministrar && miembro.rol === 'member' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      disabled={updateMiembro.isPending}
                      onClick={() => cambiarRol(miembro, 'moderator')}
                    >
                      Hacer moderador
                    </Button>
                  )}
                  {puedeAdministrar && miembro.rol === 'moderator' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      disabled={updateMiembro.isPending}
                      onClick={() => cambiarRol(miembro, 'member')}
                    >
                      Quitar moderador
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 gap-1"
                    disabled={updateMiembro.isPending}
                    onClick={() => toggleSuspender(miembro)}
                  >
                    {miembro.suspendido ? (
                      <>
                        <ShieldCheck className="size-4" />
                        Reactivar
                      </>
                    ) : (
                      <>
                        <ShieldOff className="size-4" />
                        Suspender
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="min-h-11 gap-1"
                    disabled={removeMiembro.isPending}
                    onClick={() => expulsar(miembro)}
                  >
                    <UserX className="size-4" />
                    Expulsar
                  </Button>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
    </CargaCrossfade>
  )
}
