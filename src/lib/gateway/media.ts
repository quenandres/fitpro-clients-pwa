import { gatewayFetch } from '@/lib/gateway/client'
import { isMockMode } from '@/lib/mock-mode'
import { catalogoEjercicios } from '@/lib/mock/datos'

export async function fetchExerciseMedia(exerciseId: string): Promise<{
  imagen_url: string
  gif_url: string
}> {
  if (isMockMode()) {
    const found = catalogoEjercicios().find((e) => e.ejercicio_id === exerciseId)
    const url = found?.imagen_url ?? '/ejercicios/sentadilla.svg'
    return { imagen_url: url, gif_url: url }
  }
  return gatewayFetch(`/api/media/ejercicios/${exerciseId}`)
}
