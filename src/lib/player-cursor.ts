import type { EjercicioPrescrito, SerieRegistrada } from '@/types/dominio'

export function cursorDesdeSeries(
  ejercicios: Pick<EjercicioPrescrito, 'ejercicio_id' | 'series'>[],
  series: SerieRegistrada[],
): { ejercicioIndex: number; serieIndex: number; done: boolean } {
  const confirmadas = new Map<string, Set<number>>()
  for (const serie of series) {
    const set = confirmadas.get(serie.ejercicio_id) ?? new Set<number>()
    set.add(serie.numero_serie)
    confirmadas.set(serie.ejercicio_id, set)
  }

  for (let i = 0; i < ejercicios.length; i += 1) {
    const ejercicio = ejercicios[i]
    const hechas = confirmadas.get(ejercicio.ejercicio_id) ?? new Set<number>()
    for (let n = 1; n <= ejercicio.series; n += 1) {
      if (!hechas.has(n)) {
        return { ejercicioIndex: i, serieIndex: n - 1, done: false }
      }
    }
  }

  return {
    ejercicioIndex: Math.max(ejercicios.length - 1, 0),
    serieIndex: 0,
    done: ejercicios.length > 0,
  }
}
