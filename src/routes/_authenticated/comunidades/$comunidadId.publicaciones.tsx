import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  AvisoComunidadAnimado,
  ListaItemsAnimada,
} from '@/components/comunidades/ComunidadesMotion'
import { PenLine } from 'lucide-react'
import { PostCard } from '@/components/comunidades/PostCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  puedeModerarComunidad,
} from '@/lib/comunidades/display'
import {
  useComunidad,
  useComunidadPosts,
  useCreateComentario,
  useCreatePublicacion,
  useDeletePublicacion,
  useToggleLike,
  useUpdatePublicacion,
} from '@/lib/gateway/comunidades-hooks'
import { useAuth } from '@/providers/auth-provider'
import type { TipoPost } from '@/types/comunidad'
import {
  CargaCrossfade,
  SelectorTabsAnimado,
} from '@/components/motion/DashboardMotion'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/_authenticated/comunidades/$comunidadId/publicaciones',
)({
  component: ComunidadPublicacionesPage,
})

const TIPOS_POST: { id: TipoPost; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'logro', label: 'Logro' },
  { id: 'pregunta', label: 'Pregunta' },
]

function ComunidadPublicacionesPage() {
  const { comunidadId } = Route.useParams()
  const { user } = useAuth()
  const { data: comunidad } = useComunidad(comunidadId)
  const { data: postsRaw = [], isLoading, isError, refetch } =
    useComunidadPosts(comunidadId)
  const createPost = useCreatePublicacion(comunidadId)
  const toggleLike = useToggleLike(comunidadId)
  const createComentario = useCreateComentario(comunidadId)
  const updatePublicacion = useUpdatePublicacion(comunidadId)
  const deletePublicacion = useDeletePublicacion(comunidadId)

  const esMiembro = comunidad?.esMiembro ?? false
  const suspendido = comunidad?.suspendido ?? false
  const puedeModerar = puedeModerarComunidad(comunidad?.miRol)
  const puedeParticipar = esMiembro && !suspendido

  const posts = useMemo(
    () =>
      [...postsRaw].sort((a, b) => {
        if (a.fijado && !b.fijado) return -1
        if (!a.fijado && b.fijado) return 1
        return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
      }),
    [postsRaw],
  )

  const [sheetAbierto, setSheetAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<TipoPost>('general')
  const [likePendingId, setLikePendingId] = useState<string | null>(null)
  const [comentarioPendingId, setComentarioPendingId] = useState<string | null>(
    null,
  )

  const tiposPublicacion = useMemo(() => {
    const base = TIPOS_POST.map(({ id, label }) => ({ id, label }))
    if (puedeModerar) {
      return [...base, { id: 'anuncio' as TipoPost, label: 'Anuncio' }]
    }
    return base
  }, [puedeModerar])

  function publicar() {
    const limpio = texto.trim()
    if (!limpio) return
    createPost.mutate(
      { texto: limpio, tipo },
      {
        onSuccess: () => {
          setTexto('')
          setTipo('general')
          setSheetAbierto(false)
          toast.success('Publicación creada')
        },
        onError: () =>
          toast.error('No pudimos publicar. Inténtalo de nuevo.'),
      },
    )
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-destructive/30 px-4 py-8 text-center text-sm text-destructive">
        No pudimos cargar las publicaciones.{' '}
        <button type="button" className="underline" onClick={() => void refetch()}>
          Reintentar
        </button>
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Publicaciones</h2>
        {puedeParticipar && (
          <Button
            className="min-h-11 gap-2"
            onClick={() => setSheetAbierto(true)}
          >
            <PenLine className="size-4" aria-hidden />
            Publicar
          </Button>
        )}
      </div>

      <AvisoComunidadAnimado visible={!esMiembro}>
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Únete a la comunidad para publicar en el feed.
        </p>
      </AvisoComunidadAnimado>

      <AvisoComunidadAnimado visible={suspendido && esMiembro}>
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Tu cuenta está suspendida. No puedes publicar ni comentar.
        </p>
      </AvisoComunidadAnimado>

      <CargaCrossfade
        loading={isLoading}
        skeleton={<Skeleton className="h-48 rounded-xl" />}
      >
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sé el primero en publicar algo.
          </p>
        ) : (
          <ListaItemsAnimada
            items={posts}
            renderItem={(post) => (
              <PostCard
                post={post}
                autorNombre={post.autorNombre ?? 'Miembro'}
                autorIniciales={post.autorIniciales ?? '?'}
                liked={post.liked ?? false}
                esPropio={post.autorId === user?.id}
                miRol={comunidad?.miRol}
                suspendido={suspendido}
                esMiembro={esMiembro}
                likePending={likePendingId === post.id}
                comentarioPending={comentarioPendingId === post.id}
                onToggleLike={() => {
                  setLikePendingId(post.id)
                  toggleLike.mutate(post.id, {
                    onSettled: () => setLikePendingId(null),
                    onError: () =>
                      toast.error('No pudimos registrar tu reacción.'),
                  })
                }}
                onComentar={
                  puedeParticipar
                    ? (textoComentario) => {
                        setComentarioPendingId(post.id)
                        createComentario.mutate(
                          { postId: post.id, texto: textoComentario },
                          {
                            onSettled: () => setComentarioPendingId(null),
                            onSuccess: () => toast.success('Comentario publicado'),
                            onError: () =>
                              toast.error('No pudimos publicar el comentario.'),
                          },
                        )
                      }
                    : undefined
                }
                onFijar={
                  puedeModerar
                    ? () =>
                        updatePublicacion.mutate(
                          { postId: post.id, fijado: !post.fijado },
                          {
                            onSuccess: () =>
                              toast.success(
                                post.fijado
                                  ? 'Publicación desfijada'
                                  : 'Publicación fijada',
                              ),
                            onError: () =>
                              toast.error('No pudimos actualizar la publicación.'),
                          },
                        )
                    : undefined
                }
                onEliminar={
                  puedeModerar || post.autorId === user?.id
                    ? () =>
                        deletePublicacion.mutate(post.id, {
                          onSuccess: () => toast.success('Publicación eliminada'),
                          onError: () =>
                            toast.error('No pudimos eliminar la publicación.'),
                        })
                    : undefined
                }
              />
            )}
          />
        )}
      </CargaCrossfade>

      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva publicación</SheetTitle>
            <SheetDescription>
              Comparte algo con la comunidad.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <SelectorTabsAnimado
                items={tiposPublicacion}
                value={tipo}
                onChange={setTipo}
                ariaLabel="Tipo de publicación"
                columnas={puedeModerar ? 4 : 3}
                classNameTab="min-h-11 px-1 text-[11px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="texto-post">Texto</Label>
              <textarea
                id="texto-post"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={5}
                placeholder="¿Qué quieres compartir?"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => setSheetAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              className="min-h-11"
              disabled={!texto.trim() || createPost.isPending}
              onClick={publicar}
            >
              {createPost.isPending ? 'Publicando…' : 'Publicar'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
