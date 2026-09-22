import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/sesion/$sesionId')({
  component: SesionLayout,
})

function SesionLayout() {
  return <Outlet />
}
