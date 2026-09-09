import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppShell } from '@/components/AppShell'
import { mensajeDeError } from '@/lib/gateway/errors'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      await navigate({ to: '/' })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell hideNav>
      <div className="flex min-h-[80dvh] items-center justify-center">
        <Card className="w-full md:max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <CardDescription>
              Accede a tu plan y registra tu entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                  Crear cuenta
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
