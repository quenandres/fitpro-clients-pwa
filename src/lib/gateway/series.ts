import { serieRegistradaSchema } from '@/lib/gateway/schemas'
import { gatewayFetch } from '@/lib/gateway/client'
import type { SerieRegistrada } from '@/types/dominio'

export type GuardarSerieInput = {
  session_id: string
  ejercicio_id: string
  numero_serie: number
  peso_kg: number
  repeticiones: number
}

export async function iniciarSesion(planSessionId: string): Promise<{ id: string }> {
  return gatewayFetch<{ id: string }>(
    `/api/sesiones/${planSessionId}/iniciar`,
    { method: 'POST' },
  )
}

export async function guardarSerie(
  input: GuardarSerieInput,
): Promise<SerieRegistrada> {
  const data = await gatewayFetch<unknown>(
    `/api/sesiones/${input.session_id}/series`,
    {
      method: 'POST',
      body: JSON.stringify({
        ejercicio_id: Number(input.ejercicio_id),
        numero_serie: input.numero_serie,
        peso_kg: input.peso_kg,
        repeticiones: input.repeticiones,
      }),
    },
  )
  return serieRegistradaSchema.parse(data)
}

export async function listarSeriesDeSesion(
  sessionId: string,
): Promise<SerieRegistrada[]> {
  const data = await gatewayFetch<unknown>(`/api/sesiones/${sessionId}/series`)
  const rows = Array.isArray(data) ? data : []
  return rows.map((row) => serieRegistradaSchema.parse(row))
}

export async function completarSesion(sessionId: string): Promise<void> {
  await gatewayFetch(`/api/sesiones/${sessionId}/completar`, { method: 'POST' })
}
