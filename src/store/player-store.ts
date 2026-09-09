import { create } from 'zustand'
import type { SerieRegistrada } from '@/types/dominio'

export type FasePlayer = 'idle' | 'saving' | 'rest' | 'done'

type PlayerState = {
  sesionId: string | null
  ejercicioIndex: number
  serieIndex: number
  pesoKg: number
  repeticiones: number
  fase: FasePlayer
  descansoSegundos: number
  seriesConfirmadas: SerieRegistrada[]
  seriesPendientes: boolean
  errorGuardado: string | null
  initSesion: (
    sesionId: string,
    ejercicioIndex?: number,
    pesoInicial?: number,
    repsInicial?: number,
  ) => void
  setPeso: (kg: number) => void
  setRepeticiones: (reps: number) => void
  setFase: (fase: FasePlayer) => void
  setDescanso: (seg: number) => void
  agregarSerieConfirmada: (serie: SerieRegistrada) => void
  avanzarSerie: (totalSeries: number, totalEjercicios: number) => void
  setErrorGuardado: (msg: string | null) => void
  reset: () => void
}

const initialState = {
  sesionId: null as string | null,
  ejercicioIndex: 0,
  serieIndex: 0,
  pesoKg: 0,
  repeticiones: 0,
  fase: 'idle' as FasePlayer,
  descansoSegundos: 0,
  seriesConfirmadas: [] as SerieRegistrada[],
  seriesPendientes: false,
  errorGuardado: null as string | null,
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,

  initSesion: (sesionId, ejercicioIndex = 0, pesoInicial = 0, repsInicial = 0) =>
    set({
      ...initialState,
      sesionId,
      ejercicioIndex,
      pesoKg: pesoInicial,
      repeticiones: repsInicial,
    }),

  setPeso: (kg) => set({ pesoKg: kg }),
  setRepeticiones: (reps) => set({ repeticiones: reps }),
  setFase: (fase) => set({ fase }),
  setDescanso: (seg) => set({ descansoSegundos: seg }),
  setErrorGuardado: (msg) => set({ errorGuardado: msg }),

  agregarSerieConfirmada: (serie) =>
    set((s) => ({
      seriesConfirmadas: [...s.seriesConfirmadas, serie],
      seriesPendientes: false,
      fase: 'rest',
      descansoSegundos: 90,
    })),

  avanzarSerie: (totalSeries, totalEjercicios) => {
    const { serieIndex, ejercicioIndex } = get()
    if (serieIndex + 1 < totalSeries) {
      set({ serieIndex: serieIndex + 1, fase: 'idle', descansoSegundos: 0 })
      return
    }
    if (ejercicioIndex + 1 < totalEjercicios) {
      set({
        ejercicioIndex: ejercicioIndex + 1,
        serieIndex: 0,
        fase: 'idle',
        descansoSegundos: 0,
      })
      return
    }
    set({ fase: 'done', descansoSegundos: 0 })
  },

  reset: () => set(initialState),
}))
