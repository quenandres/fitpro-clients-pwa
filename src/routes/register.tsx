import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsEmail, setNeedsEmail] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const { needsEmailConfirmation } = await signup(email, password)
      if (needsEmailConfirmation) {
        setNeedsEmail(true)
      } else {
        await navigate({ to: '/' })
      }
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setLoading(false)
    }
  }

  if (needsEmail) {
    return (
      <AppShell hideNav>
        <div className="flex min-h-[80dvh] items-center justify-center">
          <Card className="w-full md:max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Revisa tu correo</CardTitle>
              <CardDescription>
                Te enviamos un enlace para confirmar tu cuenta. Cuando lo
                confirmes, podrás entrar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/login"
                className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
              >
                Ir a entrar
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell hideNav>
      <div className="flex min-h-[80dvh] items-center justify-center">
        <Card className="w-full md:max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
            <CardDescription>
              Regístrate como cliente para ver tu plan de entrenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmacion">Confirmar contraseña</Label>
                <Input
                  id="confirmacion"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
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
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
