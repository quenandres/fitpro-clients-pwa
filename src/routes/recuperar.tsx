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
import { requestRecovery } from '@/lib/gateway/auth'
import { mensajeDeError } from '@/lib/gateway/errors'
import { rolPermitidoEnApp } from '@/lib/gateway/schemas'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/recuperar')({
  beforeLoad: ({ context }) => {
    if (
      context.auth.isAuthenticated &&
      rolPermitidoEnApp(context.auth.user?.role)
    ) {
      throw redirect({ to: '/' })
    }
  },
  component: RecuperarPage,
})

function RecuperarPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [paso, setPaso] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePedirCodigo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestRecovery(email)
      setPaso('codigo')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email, token.trim(), password)
      await navigate({ to: '/' })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviar() {
    setError(null)
    setLoading(true)
    try {
      await requestRecovery(email)
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
            <CardTitle className="text-2xl font-bold">
              {paso === 'email' ? 'Recuperar acceso' : 'Código y contraseña nueva'}
            </CardTitle>
            <CardDescription>
              {paso === 'email'
                ? 'Te mandamos un código al correo. No hace falta abrir ningún enlace.'
                : `Escribe el código que llegó a ${email} y elige una contraseña.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paso === 'email' ? (
              <form onSubmit={handlePedirCodigo} className="flex flex-col gap-4">
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
                  {loading ? 'Enviando…' : 'Enviar código'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    to="/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Volver a entrar
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleGuardar} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="token">Código</Label>
                  <Input
                    id="token"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    minLength={6}
                    maxLength={20}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-11 text-base tracking-[0.28em]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Contraseña nueva</Label>
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
                  {loading ? 'Guardando…' : 'Guardar y entrar'}
                </Button>
                <button
                  type="button"
                  className="text-center text-sm text-primary underline-offset-4 hover:underline"
                  onClick={() => void handleReenviar()}
                  disabled={loading}
                >
                  Reenviar código
                </button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    to="/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Volver a entrar
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
