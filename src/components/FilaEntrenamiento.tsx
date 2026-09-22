import { Link, type LinkComponentProps } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilaEntrenamientoProps = LinkComponentProps & {
  titulo: string
  meta: string
  imagenUrl: string
  imagenAlt: string
}

export function FilaEntrenamiento({
  titulo,
  meta,
  imagenUrl,
  imagenAlt,
  className,
  ...props
}: FilaEntrenamientoProps) {
  return (
    <Link
      {...props}
      className={cn(
        'flex min-h-20 items-center gap-4 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-colors',
        'hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[.97]',
        'motion-reduce:active:scale-100',
        className,
      )}
    >
      <img
        src={imagenUrl}
        alt={imagenAlt}
        className="size-16 shrink-0 rounded-full bg-background object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold">{titulo}</p>
        <p className="truncate text-sm text-muted-foreground">{meta}</p>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  )
}
