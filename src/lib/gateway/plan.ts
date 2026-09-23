import {
  planSchema,
  sesionDelDiaSchema,
  sesionHistorialSchema,
} from '@/lib/gateway/schemas'
import { gatewayFetch } from '@/lib/gateway/client'
import { isMockMode } from '@/lib/mock-mode'
import {
  historialMock,
  planMock,
  sesionDelDiaMock,
} from '@/lib/mock/datos'
import type { Plan, SesionDelDia, SesionHistorial } from '@/types/dominio'

export async function fetchPlan(): Promise<Plan> {
  if (isMockMode()) {
    return planSchema.parse(planMock) as Plan
  }
  const data = await gatewayFetch<unknown>('/api/clientes/me/plan')
  return planSchema.parse(data) as Plan
}

export async function fetchSesionHoy(): Promise<SesionDelDia> {
  if (isMockMode()) {
    return sesionDelDiaSchema.parse(sesionDelDiaMock) as SesionDelDia
  }
  const data = await gatewayFetch<unknown>('/api/clientes/me/sesion-hoy')
  return sesionDelDiaSchema.parse(data) as SesionDelDia
}

export async function fetchHistorial(): Promise<SesionHistorial[]> {
  if (isMockMode()) {
    return zArray(sesionHistorialSchema).parse(historialMock) as SesionHistorial[]
  }
  const data = await gatewayFetch<unknown>('/api/clientes/me/historial')
  return zArray(sesionHistorialSchema).parse(data) as SesionHistorial[]
}

function zArray<T>(schema: { parse: (v: unknown) => T }) {
  return { parse: (v: unknown) => (Array.isArray(v) ? v.map((x) => schema.parse(x)) : []) }
}
