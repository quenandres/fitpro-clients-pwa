import { Link, useRouterState } from '@tanstack/react-router'
import {
  Highlight,
  HighlightItem,
} from '@/components/animate-ui/primitives/effects/highlight'
import { TRANSICION_CONTROL } from '@/lib/motion'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Inicio', suffix: '', value: 'inicio' },
  { label: 'Publicaciones', suffix: '/publicaciones', value: 'publicaciones' },
  { label: 'Eventos', suffix: '/eventos', value: 'eventos' },
  { label: 'Miembros', suffix: '/miembros', value: 'miembros' },
] as const

type ComunidadTabsNavProps = {
  comunidadId: string
}

export function ComunidadTabsNav({ comunidadId }: ComunidadTabsNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const base = `/comunidades/${comunidadId}`

  const activeValue =
    TABS.find(({ suffix }) =>
      suffix === ''
        ? pathname === base || pathname === `${base}/`
        : pathname.startsWith(`${base}${suffix}`),
    )?.value ?? 'inicio'

  return (
    <Highlight
      mode="parent"
      value={activeValue}
      click={false}
      hover={false}
      controlledItems
      className="rounded-full bg-background shadow-sm"
      transition={TRANSICION_CONTROL}
      containerClassName="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1"
    >
      <div role="tablist" aria-label="Secciones de la comunidad" className="contents">
        {TABS.map(({ label, suffix, value }) => {
          const activo = activeValue === value

          const to =
            suffix === ''
              ? '/comunidades/$comunidadId'
              : suffix === '/publicaciones'
                ? '/comunidades/$comunidadId/publicaciones'
                : suffix === '/eventos'
                  ? '/comunidades/$comunidadId/eventos'
                  : '/comunidades/$comunidadId/miembros'

          return (
            <HighlightItem key={value} asChild value={value}>
              <Link
                to={to}
                params={{ comunidadId }}
                role="tab"
                aria-selected={activo}
                className={cn(
                  'relative z-[1] flex min-h-11 items-center justify-center rounded-full px-1 text-center text-xs font-semibold',
                  activo
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            </HighlightItem>
          )
        })}
      </div>
    </Highlight>
  )
}
