import { Heart, Pin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ETIQUETAS_TIPO_POST } from '@/lib/mock/comunidades'
import type { PostComunidad } from '@/types/comunidad'
import { cn } from '@/lib/utils'

type PostCardProps = {
  post: PostComunidad
  autorNombre: string
  autorIniciales: string
  liked: boolean
  esPropio?: boolean
  onToggleLike: () => void
}

function formatFechaRelativa(iso: string) {
  const fecha = new Date(iso)
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PostCard({
  post,
  autorNombre,
  autorIniciales,
  liked,
  esPropio = false,
  onToggleLike,
}: PostCardProps) {

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0 pb-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {autorIniciales}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{esPropio ? 'Tú' : autorNombre}</p>
            <Badge variant="outline">{ETIQUETAS_TIPO_POST[post.tipo]}</Badge>
            {post.fijado && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="size-3" aria-hidden />
                Fijado
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatFechaRelativa(post.creadoEn)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm">{post.texto}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'min-h-11 gap-2',
            liked && 'text-primary',
          )}
          onClick={onToggleLike}
        >
          <Heart
            className={cn('size-4', liked && 'fill-current')}
            aria-hidden
          />
          Me gusta
          {post.likes.length > 0 && (
            <span className="tabular-nums">({post.likes.length})</span>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
