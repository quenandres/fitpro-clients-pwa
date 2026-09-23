import type { GuardarSerieInput } from '@/lib/gateway/series'
import { serieRegistradaSchema } from '@/lib/gateway/schemas'
import type { SerieRegistrada } from '@/types/dominio'

const sessions = new Map<string, { id: string; planSessionId: string }>()
const seriesBySession = new Map<string, SerieRegistrada[]>()

export function resetSeriesDemoState(): void {
  sessions.clear()
  seriesBySession.clear()
}

export function demoIniciarSesion(planSessionId: string): { id: string } {
  const existing = [...sessions.values()].find(
    (s) => s.planSessionId === planSessionId,
  )
  if (existing) return { id: existing.id }
  const id = `demo-session-${planSessionId}`
  sessions.set(id, { id, planSessionId })
  if (!seriesBySession.has(id)) seriesBySession.set(id, [])
  return { id }
}

export function demoGuardarSerie(input: GuardarSerieInput): SerieRegistrada {
  const list = seriesBySession.get(input.session_id) ?? []
  const row: SerieRegistrada = serieRegistradaSchema.parse({
    id: `serie-${input.session_id}-${input.ejercicio_id}-${input.numero_serie}`,
    ejercicio_id: input.ejercicio_id,
    numero_serie: input.numero_serie,
    peso_kg: input.peso_kg,
    repeticiones: input.repeticiones,
    confirmada: true,
  })
  const idx = list.findIndex(
    (s) =>
      s.ejercicio_id === row.ejercicio_id &&
      s.numero_serie === row.numero_serie,
  )
  if (idx >= 0) list[idx] = row
  else list.push(row)
  seriesBySession.set(input.session_id, list)
  return row
}

export function demoListarSeriesDeSesion(sessionId: string): SerieRegistrada[] {
  return [...(seriesBySession.get(sessionId) ?? [])]
}

export function demoCompletarSesion(_sessionId: string): void {
  // no-op en demo
}
