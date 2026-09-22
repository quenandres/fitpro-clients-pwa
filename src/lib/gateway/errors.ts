export class GatewayError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(message: string, status: number, detail?: unknown) {
    super(message)
    this.name = 'GatewayError'
    this.status = status
    this.detail = detail
  }
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof GatewayError) {
    if (typeof error.detail === 'string' && error.detail.trim()) {
      return error.detail
    }
    if (typeof error.detail === 'object' && error.detail !== null) {
      const d = error.detail as Record<string, unknown>
      if (typeof d.detail === 'string' && d.detail.trim()) return d.detail
      if (typeof d.error_description === 'string') return d.error_description
      if (typeof d.msg === 'string') return d.msg
      if (typeof d.message === 'string') return d.message
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}

export function mensajeEnlaceCaducado(): string {
  return 'Este enlace ya no sirve. Pide un código nuevo para entrar.'
}
