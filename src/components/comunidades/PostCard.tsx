import { useState } from 'react'
import { Heart, Pin, PinOff, Trash2 } from 'lucide-react'
import { Zoom } from '@/components/animate-ui/primitives/effects/zoom'
import { ListaComentariosAnimada } from '@/components/comunidades/ComunidadesMotion'
import { MetricaContador } from '@/components/motion/DashboardMotion'
import { TRANSICION_CONTROL } from '@/lib/motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ETIQUETAS_TIPO_POST,
  puedeModerarComunidad,
} from '@/lib/comunidades/display'
import type { PostComunidad, RolComunidad } from '@/types/comunidad'
import { cn } from '@/lib/utils'

type PostCardProps = {
  post: PostComunidad
  autorNombre: string
  autorIniciales: string
  liked: boolean
  esPropio?: boolean
  miRol?: RolComunidad | null
  suspendido?: boolean
  esMiembro?: boolean
  onToggleLike: () => void
  onComentar?: (texto: string) => void
  onFijar?: () => void
  onEliminar?: () => void
  likePending?: boolean
  comentarioPending?: boolean
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
  miRol,
  suspendido = false,
  esMiembro = false,
  onToggleLike,
  onComentar,
  onFijar,
  onEliminar,
  likePending = false,
  comentarioPending = false,
}: PostCardProps) {
  const [comentario, setComentario] = useState('')
  const puedeModerar = puedeModerarComunidad(miRol)
  const puedeParticipar = esMiembro && !suspendido
  const comentarios = post.comentarios ?? []

  function enviarComentario() {
    const limpio = comentario.trim()
    if (!limpio || !onComentar) return
    onComentar(limpio)
    setComentario('')
  }

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
        {(puedeModerar || esPropio) && (
          <div className="flex shrink-0 gap-1">
            {puedeModerar && onFijar && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="min-h-11 min-w-11"
                onClick={onFijar}
                aria-label={post.fijado ? 'Dejar de fijar' : 'Fijar publicación'}
              >
                {post.fijado ? (
                  <PinOff className="size-4" />
                ) : (
                  <Pin className="size-4" />
                )}
              </Button>
            )}
            {(puedeModerar || esPropio) && onEliminar && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="min-h-11 min-w-11 text-destructive"
                onClick={onEliminar}
                aria-label="Eliminar publicación"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm">{post.texto}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('min-h-11 gap-2', liked && 'text-primary')}
          onClick={onToggleLike}
          disabled={!puedeParticipar || likePending}
        >
          <Zoom
            key={liked ? 'liked' : 'unliked'}
            inView
            inViewOnce={false}
            initialScale={0.75}
            transition={TRANSICION_CONTROL}
            className="flex items-center"
          >
            <Heart
              className={cn('size-4', liked && 'fill-current')}
              aria-hidden
            />
          </Zoom>
          Me gusta
          {post.likes.length > 0 && (
            <span className="tabular-nums">
              (
              <MetricaContador valor={post.likes.length} className="inline" />)
            </span>
          )}
        </Button>

        {comentarios.length > 0 && (
          <ListaComentariosAnimada
            items={comentarios}
            renderItem={(c) => (
              <>
                <p className="text-xs font-semibold">
                  {c.autorNombre ?? 'Miembro'}
                </p>
                <p className="text-sm">{c.texto}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatFechaRelativa(c.creadoEn)}
                </p>
              </>
            )}
          />
        )}

        {puedeParticipar && onComentar && (
          <div className="flex gap-2 border-t border-border pt-3">
            <Input
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario…"
              className="min-h-11"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  enviarComentario()
                }
              }}
            />
            <Button
              type="button"
              className="min-h-11 shrink-0"
              disabled={!comentario.trim() || comentarioPending}
              onClick={enviarComentario}
            >
              Enviar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
