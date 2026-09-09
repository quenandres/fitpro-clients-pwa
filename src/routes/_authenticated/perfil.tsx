import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut, Moon, Sun, Monitor } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/providers/auth-provider'
import { useTheme } from '@/providers/theme-provider'

export const Route = createFileRoute('/_authenticated/perfil')({
  component: PerfilPage,
})

function PerfilPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const navigate = useNavigate()

  const iniciales = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  async function handleLogout() {
    await logout()
    await navigate({ to: '/login' })
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">Tu cuenta y preferencias</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identidad</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">{iniciales}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.email ?? '—'}</p>
              <p className="text-sm capitalize text-muted-foreground">
                {user?.role ?? 'cliente'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>
              Tema actual: {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sun className="size-4 text-muted-foreground" aria-hidden />
                <Label htmlFor="tema-claro" className="cursor-pointer">
                  Claro
                </Label>
              </div>
              <Switch
                id="tema-claro"
                checked={theme === 'light'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'light' : 'system')
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Moon className="size-4 text-muted-foreground" aria-hidden />
                <Label htmlFor="tema-oscuro" className="cursor-pointer">
                  Oscuro
                </Label>
              </div>
              <Switch
                id="tema-oscuro"
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'system')
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="size-4 text-muted-foreground" aria-hidden />
                <Label htmlFor="tema-sistema" className="cursor-pointer">
                  Seguir sistema
                </Label>
              </div>
              <Switch
                id="tema-sistema"
                checked={theme === 'system'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'system' : resolvedTheme)
                }
              />
            </div>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </Button>

            <p className="text-xs text-muted-foreground">
              fitpro-clients v0.0.0
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
