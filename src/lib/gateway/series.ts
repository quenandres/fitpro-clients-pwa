import type { SerieRegistrada } from '@/types/dominio'

/**
 * PERSISTENCIA DE SERIES — NO IMPLEMENTADO EN GATEWAY
 *
 * El player necesita un endpoint de dominio que persista cada serie
 * (peso, repeticiones, ejercicio_id, sesion_id). Hoy gym-gateway solo
 * expone auth y un proxy PostgREST genérico; no hay contrato acordado.
 *
 * Ver GATEWAY.md para el contrato propuesto.
 */

export class SeriesEndpointMissingError extends Error {
  constructor() {
    super(
      'El endpoint de persistencia de series no existe en el gateway. El player opera en modo prototipo.',
    )
    this.name = 'SeriesEndpointMissingError'
  }
}

export type GuardarSerieInput = {
  sesion_id: string
  ejercicio_id: string
  numero_serie: number
  peso_kg: number
  repeticiones: number
}

/** Stub: lanza hasta que exista POST /api/sesiones/{id}/series */
export async function guardarSerie(
  input: GuardarSerieInput,
): Promise<SerieRegistrada> {
  void input
  throw new SeriesEndpointMissingError()
}

/** Stub: lanza hasta que exista GET /api/sesiones/{id}/series */
export async function listarSeriesDeSesion(
  sesionId: string,
): Promise<SerieRegistrada[]> {
  void sesionId
  throw new SeriesEndpointMissingError()
}
