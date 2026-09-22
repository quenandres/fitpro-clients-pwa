import type { SesionHistorial } from '@/types/dominio'
import type { EjercicioEjecutado, SesionTracking } from '@/types/tracking'

function agruparEjercicios(series: SesionHistorial['series']): EjercicioEjecutado[] {
  const byId = new Map<number, EjercicioEjecutado>()

  for (const serie of series) {
    const ejercicioId = Number(serie.ejercicio_id)
    if (Number.isNaN(ejercicioId)) continue

    const entry =
      byId.get(ejercicioId) ??
      ({
        ejercicio_id: ejercicioId,
        nombre: `Ejercicio ${ejercicioId}`,
        series: [],
      } satisfies EjercicioEjecutado)

    entry.series.push({
      n: serie.numero_serie,
      reps: serie.repeticiones,
      peso_kg: serie.peso_kg,
    })
    byId.set(ejercicioId, entry)
  }

  return [...byId.values()].map((ej) => ({
    ...ej,
    series: ej.series.sort((a, b) => a.n - b.n),
  }))
}

export function adaptHistorialToTracking(rows: SesionHistorial[]): SesionTracking[] {
  return rows.map((row) => {
    const ejercicios = agruparEjercicios(row.series)
    const seriesCompletadas = ejercicios.reduce((acc, ej) => acc + ej.series.length, 0)

    return {
      id: row.id,
      fecha: row.fecha,
      nombre: row.nombre,
      volumen_kg: row.volumen_kg,
      series_completadas: seriesCompletadas,
      ejercicios_count: row.ejercicios_count,
      modalidad: 'fuerza',
      duracion_min: Math.max(20, seriesCompletadas * 2),
      ejercicios,
    }
  })
}
