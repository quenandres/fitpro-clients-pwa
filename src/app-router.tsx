import { RouterProvider } from '@tanstack/react-router'
import { queryClient, router } from '@/router'
import { useAuth } from '@/providers/auth-provider'

export function AppRouter() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    )
  }

  return <RouterProvider router={router} context={{ auth, queryClient }} />
}
