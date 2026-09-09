import type { FotoProgreso } from '@/types/dominio'

/**
 * FOTOS DE PROGRESO — NO IMPLEMENTADO EN GATEWAY
 *
 * Se necesita Storage privado + metadatos en gym-gateway.
 * Ver GATEWAY.md para el contrato propuesto.
 */

export class FotosEndpointMissingError extends Error {
  constructor() {
    super(
      'El endpoint de fotos de progreso no existe en el gateway. /progreso opera en modo prototipo.',
    )
    this.name = 'FotosEndpointMissingError'
  }
}

/** Stub: lanza hasta que exista GET /api/progreso/fotos */
export async function listarFotos(): Promise<FotoProgreso[]> {
  throw new FotosEndpointMissingError()
}

/** Stub: lanza hasta que exista POST /api/progreso/fotos */
export async function subirFoto(file: File): Promise<FotoProgreso> {
  void file
  throw new FotosEndpointMissingError()
}

/** Stub: lanza hasta que exista DELETE /api/progreso/fotos/{id} */
export async function eliminarFoto(fotoId: string): Promise<void> {
  void fotoId
  throw new FotosEndpointMissingError()
}
