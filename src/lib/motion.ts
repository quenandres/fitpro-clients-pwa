import type { Transition } from 'motion/react'

/** Hover, foco, chips, badges — §18.3 */
export const TRANSICION_CONTROL: Transition = {
  duration: 0.15,
  ease: 'easeOut',
}

/** Error, skeleton → contenido, alto automático — §18.3 */
export const TRANSICION_ESTADO: Transition = {
  duration: 0.2,
  ease: 'easeOut',
}

/** Barra de sesión, anillo de descanso, cambio de serie — §18.3 */
export const TRANSICION_PROGRESO: Transition = {
  duration: 0.25,
  ease: 'easeInOut',
}

/** Dígitos de peso/reps, contadores — §18.3 */
export const SPRING_METRICA: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

/** View Transition del cambio de tema (única excepción > 0.3 s) — §18.3 */
export const DURACION_TEMA_MS = 350

export function prefiereMovimientoReducido(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
