import { fotoProgresoSchema } from '@/lib/gateway/schemas'
import type { FotoProgreso } from '@/types/dominio'

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="480"><rect fill="%23e5e7eb" width="320" height="480"/><text x="50%" y="50%" text-anchor="middle" fill="%236b7280" font-size="14">Progreso demo</text></svg>',
  )

let fotos: FotoProgreso[] | null = null

export function resetFotosDemoState(): void {
  fotos = null
}

function ensureFotos(): FotoProgreso[] {
  if (!fotos) {
    const base = new Date()
    base.setDate(base.getDate() - 45)
    fotos = [
      fotoProgresoSchema.parse({
        id: 'foto-demo-1',
        creada_en: base.toISOString(),
        url: PLACEHOLDER,
      }),
      fotoProgresoSchema.parse({
        id: 'foto-demo-2',
        creada_en: new Date().toISOString(),
        url: PLACEHOLDER,
      }),
    ]
  }
  return fotos
}

export function demoListarFotos(): FotoProgreso[] {
  return [...ensureFotos()]
}

export async function demoSubirFoto(_file: File): Promise<FotoProgreso> {
  const foto = fotoProgresoSchema.parse({
    id: `foto-${Date.now()}`,
    creada_en: new Date().toISOString(),
    url: PLACEHOLDER,
  })
  ensureFotos().unshift(foto)
  return foto
}

export function demoEliminarFoto(fotoId: string): void {
  const list = ensureFotos()
  const idx = list.findIndex((f) => f.id === fotoId)
  if (idx >= 0) list.splice(idx, 1)
}
