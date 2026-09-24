import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'
import { ComunidadHeader } from '@/components/comunidades/ComunidadHeader'
import { ComunidadTabsNav } from '@/components/comunidades/ComunidadTabsNav'
import { CargaCrossfade } from '@/components/motion/DashboardMotion'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useComunidad,
  useJoinComunidad,
  useLeaveComunidad,
} from '@/lib/gateway/comunidades-hooks'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/comunidades/$comunidadId')({
  component: ComunidadLayout,
})

function ComunidadLayout() {
  const { comunidadId } = Route.useParams()
  const { data: comunidad, isLoading, isError } = useComunidad(comunidadId)
  const joinMutation = useJoinComunidad()
  const leaveMutation = useLeaveComunidad()

  if (isError || (!isLoading && !comunidad)) {
    throw notFound()
  }

  return (
    <CargaCrossfade
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
    {comunidad ? (
    <div className="space-y-6">
      <ComunidadHeader
        comunidad={comunidad}
        esMiembro={comunidad.esMiembro ?? false}
        joinPending={joinMutation.isPending}
        leavePending={leaveMutation.isPending}
        onUnirme={() =>
          joinMutation.mutate(comunidadId, {
            onSuccess: () =>
              toast.success(`Te uniste a ${comunidad.nombre}`),
            onError: () =>
              toast.error(
                comunidad.visibilidad === 'privada'
                  ? 'Esta comunidad es privada. Necesitas una invitación.'
                  : 'No pudimos unirte. Inténtalo de nuevo.',
              ),
          })
        }
        onSalir={() =>
          leaveMutation.mutate(comunidadId, {
            onSuccess: () => toast.success(`Saliste de ${comunidad.nombre}`),
            onError: () =>
              toast.error('No pudimos procesar la salida. Inténtalo de nuevo.'),
          })
        }
      />

      <ComunidadTabsNav comunidadId={comunidadId} />

      <Outlet />
    </div>
    ) : null}
    </CargaCrossfade>
  )
}
