import { Link, useRouterState } from '@tanstack/react-router'
import { isMockMode } from '@/lib/mock-mode'
import {
  CalendarDays,
  History,
  Home,
  Images,
  User,
  Users,
} from 'lucide-react'
import { NavHighlightBar } from '@/components/shell/NavHighlight'
import { ThemeToggle } from '@/components/ThemeToggle'
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

const ROUTES_SIN_NAV = ['/login', '/register', '/recuperar', '/mockdata']
const ROUTES_PLAYER = /^\/sesion\/[^/]+\/?$/

type AppShellProps = {
  children: React.ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navActivaTo =
    NAV_ITEMS.find(({ to }) => navActiva(pathname, to))?.to ?? '/'
  const mockActivo = isMockMode()
  const ocultarNav =
    hideNav ||
    ROUTES_SIN_NAV.includes(pathname) ||
    ROUTES_PLAYER.test(pathname)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {mockActivo && !ROUTES_SIN_NAV.includes(pathname) && (
        <div className="border-b border-primary/20 bg-primary/5 px-4 py-1.5 text-center text-xs text-muted-foreground">
          <Link to="/mockdata" className="font-medium text-primary underline-offset-2 hover:underline">
            Modo demo
          </Link>
          {' · '}
          Datos de demostración
        </div>
      )}
      {!ocultarNav && (
        <div
          className={cn(
            'fixed right-3 z-[60] md:hidden',
            mockActivo && !ROUTES_SIN_NAV.includes(pathname) ? 'top-11' : 'top-3',
          )}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <ThemeToggle />
        </div>
      )}

      {!ocultarNav && (
        <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:block">
          <div className="relative">
            <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <ThemeToggle />
            </div>
            <NavHighlightBar
              items={NAV_ITEMS.map(({ to, label, icon }) => ({
                to,
                label,
                icon,
              }))}
              activeTo={navActivaTo}
              layout="top"
            />
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
          <NavHighlightBar
            items={NAV_ITEMS.map(({ to, label, shortLabel, icon }) => ({
              to,
              label: shortLabel ?? label,
              icon,
            }))}
            activeTo={navActivaTo}
            layout="bottom"
          />
        </nav>
      )}
    </div>
  )
}
