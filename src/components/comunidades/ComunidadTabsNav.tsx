import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Inicio', suffix: '' },
  { label: 'Publicaciones', suffix: '/publicaciones' },
  { label: 'Eventos', suffix: '/eventos' },
] as const

type ComunidadTabsNavProps = {
  comunidadId: string
}

export function ComunidadTabsNav({ comunidadId }: ComunidadTabsNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const base = `/comunidades/${comunidadId}`

  return (
    <div
      role="tablist"
      aria-label="Secciones de la comunidad"
      className="grid grid-cols-3 gap-1 rounded-full bg-secondary p-1"
    >
      {TABS.map(({ label, suffix }) => {
        const href = `${base}${suffix}`
        const activo =
          suffix === ''
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href)

        return (
          <Link
            key={suffix}
            to={
              suffix === ''
                ? '/comunidades/$comunidadId'
                : suffix === '/publicaciones'
                  ? '/comunidades/$comunidadId/publicaciones'
                  : '/comunidades/$comunidadId/eventos'
            }
            params={{ comunidadId }}
            role="tab"
            aria-selected={activo}
            className={cn(
              'flex min-h-11 items-center justify-center rounded-full px-2 text-center text-xs font-semibold transition-colors',
              activo
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
