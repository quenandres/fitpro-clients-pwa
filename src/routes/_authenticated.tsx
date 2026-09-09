import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) return
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    const role = context.auth.user?.role
    if (role && role !== 'client') {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
