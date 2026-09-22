import { fotoProgresoSchema } from '@/lib/gateway/schemas'
import { gatewayFetch, getAccessToken, getGatewayUrl } from '@/lib/gateway/client'
import type { FotoProgreso } from '@/types/dominio'

export async function listarFotos(): Promise<FotoProgreso[]> {
  const data = await gatewayFetch<unknown>('/api/progreso/fotos')
  const rows = Array.isArray(data) ? data : []
  return rows.map((row) => fotoProgresoSchema.parse(row))
}

export async function subirFoto(file: File): Promise<FotoProgreso> {
  const form = new FormData()
  form.append('file', file)
  const token = getAccessToken()
  const res = await fetch(`${getGatewayUrl()}/api/progreso/fotos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    throw new Error('No se pudo subir la foto')
  }
  const data = await res.json()
  return fotoProgresoSchema.parse(data)
}

export async function eliminarFoto(fotoId: string): Promise<void> {
  await gatewayFetch(`/api/progreso/fotos/${fotoId}`, { method: 'DELETE' })
}
