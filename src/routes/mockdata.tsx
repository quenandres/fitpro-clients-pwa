import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { resetAllDemoRuntimeState } from '@/lib/mock/reset-demo-state'
import { isMockMode, MOCK_MODE_STORAGE_KEY, setMockMode } from '@/lib/mock-mode'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/mockdata')({
  component: MockDataPage,
})

function MockDataPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [enabled, setEnabled] = useState(() => isMockMode())

  const apply = async (next: boolean) => {
    setMockMode(next)
    setEnabled(next)
    resetAllDemoRuntimeState()
    queryClient.clear()
    await refreshUser()
    if (next) {
      void navigate({ to: '/' })
    } else {
      void navigate({ to: '/login' })
    }
  }

  return (
    <AppShell hideNav>
      <div className="mx-auto w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Modo demostración</CardTitle>
            <CardDescription>
              Para recorridos con inversores. Con el modo activo no hace falta
              iniciar sesión: entras como Valentina y todas las pantallas usan
              datos de ejemplo (no se envían al servidor).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex min-h-11 items-center justify-between gap-4">
              <Label htmlFor="mock-mode" className="flex flex-col gap-1">
                <span className="font-medium">Activar modo mock</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {enabled
                    ? 'Activo — entras como Valentina Ruiz sin contraseña'
                    : 'Inactivo — datos reales vía gym-gateway'}
                </span>
              </Label>
              <Switch
                id="mock-mode"
                checked={enabled}
                onCheckedChange={(checked) => void apply(checked)}
              />
            </div>
            {enabled ? (
              <Link
                to="/"
                className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
              >
                Ir a Hoy
              </Link>
            ) : (
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'lg' }),
                  'w-full',
                )}
              >
                Ir a iniciar sesión
              </Link>
            )}
            <p className="text-xs text-muted-foreground">
              Clave manual:{' '}
              <code className="rounded bg-muted px-1">{MOCK_MODE_STORAGE_KEY}</code>{' '}
              = <code className="rounded bg-muted px-1">1</code> y recarga la
              página. Quitar la clave para volver a datos reales.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
