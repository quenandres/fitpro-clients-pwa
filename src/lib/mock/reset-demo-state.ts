import { resetComunidadesDemoState } from '@/lib/mock/comunidades-demo'
import { resetFotosDemoState } from '@/lib/mock/fotos-demo'
import { resetSeriesDemoState } from '@/lib/mock/series-demo'

export function resetAllDemoRuntimeState(): void {
  resetComunidadesDemoState()
  resetFotosDemoState()
  resetSeriesDemoState()
}
