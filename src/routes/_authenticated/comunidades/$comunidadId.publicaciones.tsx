import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
  useComunidad,
  useComunidadPosts,
  useCreatePublicacion,
  useToggleLike,
} from '@/lib/gateway/comunidades-hooks'
import { useAuth } from '@/providers/auth-provider'
import type { TipoPost } from '@/types/comunidad'
import { cn } from '@/lib/utils'

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
  const { data: postsRaw = [], isLoading } = useComunidadPosts(comunidadId)
  const createPost = useCreatePublicacion(comunidadId)
  const toggleLike = useToggleLike(comunidadId)
  const esMiembro = comunidad?.esMiembro ?? false

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
        },
      },
    )
  }

  if (isLoading) {
    return <Skeleton className="h-48 rounded-xl" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Publicaciones</h2>
        {esMiembro && (
          <Button
            className="min-h-11 gap-2"
            onClick={() => setSheetAbierto(true)}
          >
            <PenLine className="size-4" aria-hidden />
            Publicar
          </Button>
        )}
      </div>

      {!esMiembro && (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Únete a la comunidad para publicar en el feed.
        </p>
      )}

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sé el primero en publicar algo.
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
              <div
                role="radiogroup"
                aria-label="Tipo de publicación"
                className="grid grid-cols-3 gap-1 rounded-full bg-secondary p-1"
              >
                {TIPOS_POST.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={tipo === id}
                    onClick={() => setTipo(id)}
                    className={cn(
                      'min-h-11 rounded-full text-xs font-semibold transition-colors',
                      tipo === id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
              Publicar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
