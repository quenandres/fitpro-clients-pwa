import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'
import { ComunidadHeader } from '@/components/comunidades/ComunidadHeader'
import { ComunidadTabsNav } from '@/components/comunidades/ComunidadTabsNav'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useComunidad,
  useJoinComunidad,
  useLeaveComunidad,
} from '@/lib/gateway/comunidades-hooks'

export const Route = createFileRoute('/_authenticated/comunidades/$comunidadId')({
  component: ComunidadLayout,
})

function ComunidadLayout() {
  const { comunidadId } = Route.useParams()
  const { data: comunidad, isLoading, isError } = useComunidad(comunidadId)
  const joinMutation = useJoinComunidad()
  const leaveMutation = useLeaveComunidad()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (isError || !comunidad) {
    throw notFound()
  }

  return (
    <div className="space-y-6">
      <ComunidadHeader
        comunidad={comunidad}
        esMiembro={comunidad.esMiembro ?? false}
        onUnirme={() => joinMutation.mutate(comunidadId)}
        onSalir={() => leaveMutation.mutate(comunidadId)}
      />

      <ComunidadTabsNav comunidadId={comunidadId} />

      <Outlet />
    </div>
  )
}
