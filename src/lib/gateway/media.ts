import { gatewayFetch } from '@/lib/gateway/client'

export async function fetchExerciseMedia(exerciseId: string): Promise<{
  imagen_url: string
  gif_url: string
}> {
  return gatewayFetch(`/api/media/ejercicios/${exerciseId}`)
}
