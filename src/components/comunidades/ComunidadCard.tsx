import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ETIQUETAS_CATEGORIA } from '@/lib/mock/comunidades'
import type { Comunidad } from '@/types/comunidad'

type ComunidadCardProps = {
  comunidad: Comunidad
  esMiembro: boolean
  onUnirme?: () => void
}

export function ComunidadCard({
  comunidad,
  esMiembro,
  onUnirme,
}: ComunidadCardProps) {
  return (
    <Card className="overflow-hidden">
      <div
        className="h-16 w-full bg-cover bg-center"
        style={
          comunidad.portadaUrl
            ? { backgroundImage: `url(${comunidad.portadaUrl})` }
            : { background: comunidad.colorPortada }
        }
        aria-hidden
      />
      <CardHeader className="-mt-8 flex-row items-end gap-3 space-y-0 pb-2">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-background text-sm font-bold text-white"
          style={{ background: comunidad.colorAvatar }}
        >
          {comunidad.iniciales}
        </span>
        <div className="min-w-0 flex-1 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate text-base">{comunidad.nombre}</CardTitle>
            {comunidad.visibilidad === 'privada' && (
              <Badge variant="secondary">Privada</Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">
            {comunidad.descripcion}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{ETIQUETAS_CATEGORIA[comunidad.categoria]}</Badge>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {comunidad.miembrosCount}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to="/comunidades/$comunidadId"
            params={{ comunidadId: comunidad.id }}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'min-h-11',
            )}
          >
            Ver
          </Link>
          {!esMiembro && onUnirme && (
            <Button size="sm" className="min-h-11" onClick={onUnirme}>
              Unirme
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
