import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { PostCard } from '@/components/comunidades/PostCard'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useComunidad,
  useComunidadEventos,
  useComunidadPosts,
  useToggleLike,
} from '@/lib/gateway/comunidades-hooks'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute(
  '/_authenticated/comunidades/$comunidadId/',
)({
  component: ComunidadInicioPage,
})

function ComunidadInicioPage() {
  const { comunidadId } = Route.useParams()
  const { user } = useAuth()
  const { data: comunidad, isLoading: loadingComunidad } = useComunidad(comunidadId)
  const { data: postsRaw = [], isLoading: loadingPosts } = useComunidadPosts(comunidadId)
  const { data: eventosProximos = [] } = useComunidadEventos(comunidadId, 'proximos')
  const toggleLike = useToggleLike(comunidadId)

  const posts = useMemo(
    () =>
      [...postsRaw]
        .sort(
          (a, b) =>
            new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
        )
        .slice(0, 2),
    [postsRaw],
  )

  const proximoEvento = eventosProximos[0]

  if (loadingComunidad || loadingPosts) {
    return <Skeleton className="h-48 rounded-xl" />
  }

  if (!comunidad) return null

  return (
    <div className="space-y-6">
      {comunidad.reglas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reglas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {comunidad.reglas.map((regla) => (
                <li key={regla}>{regla}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Publicaciones recientes</h2>
          <Link
            to="/comunidades/$comunidadId/publicaciones"
            params={{ comunidadId }}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'min-h-11 inline-flex items-center gap-1',
            )}
          >
            Ver todas
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay publicaciones en esta comunidad.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                autorNombre={post.autorNombre ?? 'Miembro'}
                autorIniciales={post.autorIniciales ?? '?'}
                liked={post.liked ?? false}
                esPropio={post.autorId === user?.id}
                onToggleLike={() => toggleLike.mutate(post.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Próximo evento</h2>
          <Link
            to="/comunidades/$comunidadId/eventos"
            params={{ comunidadId }}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'min-h-11 inline-flex items-center gap-1',
            )}
          >
            Ver eventos
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        {proximoEvento ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{proximoEvento.titulo}</CardTitle>
              <CardDescription>{proximoEvento.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden />
                {new Date(proximoEvento.inicioEn).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <Link
                to="/comunidades/$comunidadId/eventos/$eventoId"
                params={{
                  comunidadId,
                  eventoId: proximoEvento.id,
                }}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'min-h-11 inline-flex items-center',
                )}
              >
                {comunidad.esMiembro ? 'Ver y confirmar' : 'Ver detalle'}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay eventos próximos programados.
          </p>
        )}
      </section>
    </div>
  )
}
