function cursorDesdeSeries(ejercicios, series) {
  const confirmadas = new Map()
  for (const serie of series) {
    const set = confirmadas.get(serie.ejercicio_id) ?? new Set()
    set.add(serie.numero_serie)
    confirmadas.set(serie.ejercicio_id, set)
  }

  for (let i = 0; i < ejercicios.length; i += 1) {
    const ejercicio = ejercicios[i]
    const hechas = confirmadas.get(ejercicio.ejercicio_id) ?? new Set()
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

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const ejercicios = [
  { ejercicio_id: '10', series: 3 },
  { ejercicio_id: '20', series: 2 },
]

assert(
  JSON.stringify(cursorDesdeSeries(ejercicios, [])) ===
    JSON.stringify({ ejercicioIndex: 0, serieIndex: 0, done: false }),
  'vacío empieza en 0/0',
)

assert(
  JSON.stringify(
    cursorDesdeSeries(ejercicios, [
      { ejercicio_id: '10', numero_serie: 1 },
      { ejercicio_id: '10', numero_serie: 2 },
    ]),
  ) === JSON.stringify({ ejercicioIndex: 0, serieIndex: 2, done: false }),
  'tercera serie del primer ejercicio',
)

assert(
  cursorDesdeSeries(ejercicios, [
    { ejercicio_id: '10', numero_serie: 1 },
    { ejercicio_id: '10', numero_serie: 2 },
    { ejercicio_id: '10', numero_serie: 3 },
    { ejercicio_id: '20', numero_serie: 1 },
    { ejercicio_id: '20', numero_serie: 2 },
  ]).done === true,
  'sesión completa',
)

console.log('player-cursor ok')
