import {
  planSchema,
  sesionDelDiaSchema,
  sesionHistorialSchema,
} from '@/lib/gateway/schemas'
import { gatewayFetch } from '@/lib/gateway/client'
import type { Plan, SesionDelDia, SesionHistorial } from '@/types/dominio'

export async function fetchPlan(): Promise<Plan> {
  const data = await gatewayFetch<unknown>('/api/clientes/me/plan')
  return planSchema.parse(data) as Plan
}

export async function fetchSesionHoy(): Promise<SesionDelDia> {
  const data = await gatewayFetch<unknown>('/api/clientes/me/sesion-hoy')
  return sesionDelDiaSchema.parse(data) as SesionDelDia
}

export async function fetchHistorial(): Promise<SesionHistorial[]> {
  const data = await gatewayFetch<unknown>('/api/clientes/me/historial')
  return zArray(sesionHistorialSchema).parse(data) as SesionHistorial[]
}

function zArray<T>(schema: { parse: (v: unknown) => T }) {
  return { parse: (v: unknown) => (Array.isArray(v) ? v.map((x) => schema.parse(x)) : []) }
}
