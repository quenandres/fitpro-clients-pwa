import { Link, useRouterState } from '@tanstack/react-router'
import {
  CalendarDays,
  History,
  Home,
  Images,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Hoy', shortLabel: 'Hoy', icon: Home },
  { to: '/plan', label: 'Plan', shortLabel: 'Plan', icon: CalendarDays },
  {
    to: '/historial',
    label: 'Seguimiento',
    shortLabel: 'Seg.',
    icon: History,
  },
  { to: '/progreso', label: 'Progreso', shortLabel: 'Fotos', icon: Images },
  {
    to: '/comunidades',
    label: 'Comunidades',
    shortLabel: 'Grupos',
    icon: Users,
  },
  { to: '/perfil', label: 'Perfil', shortLabel: 'Perfil', icon: User },
] as const

function navActiva(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

const ROUTES_SIN_NAV = ['/login', '/register']
const ROUTES_PLAYER = /^\/sesion\/[^/]+\/?$/

type AppShellProps = {
  children: React.ReactNode
  hideNav?: boolean
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  className,
}: {
  to: string
  label: string
  icon: typeof Home
  active: boolean
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        className,
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-5" aria-hidden />
      <span>{label}</span>
    </Link>
  )
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const ocultarNav =
    hideNav ||
    ROUTES_SIN_NAV.includes(pathname) ||
    ROUTES_PLAYER.test(pathname)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {!ocultarNav && (
        <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:block">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-center gap-2 px-4">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                label={label}
                icon={icon}
                active={navActiva(pathname, to)}
                className="min-h-11 flex-row gap-2 px-4 text-sm"
              />
            ))}
          </div>
        </header>
      )}

      <main
        className={cn(
          'mx-auto w-full max-w-6xl flex-1 px-4',
          ocultarNav ? 'pb-4 pt-4' : 'pb-24 pt-4 md:pb-8',
        )}
      >
        {children}
      </main>

      {!ocultarNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label="Navegación principal"
        >
          <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2 py-1">
            {NAV_ITEMS.map(({ to, label, shortLabel, icon }) => (
              <NavLink
                key={to}
                to={to}
                label={shortLabel ?? label}
                icon={icon}
                active={navActiva(pathname, to)}
              />
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
