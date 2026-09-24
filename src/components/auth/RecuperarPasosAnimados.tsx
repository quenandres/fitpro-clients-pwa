import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { TRANSICION_ESTADO } from '@/lib/motion'

export function RecuperarPasosAnimados({
  paso,
  formularioEmail,
  formularioCodigo,
}: {
  paso: 'email' | 'codigo'
  formularioEmail: ReactNode
  formularioCodigo: ReactNode
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {paso === 'email' ? (
        <motion.div
          key="email"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSICION_ESTADO}
        >
          {formularioEmail}
        </motion.div>
      ) : (
        <motion.div
          key="codigo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSICION_ESTADO}
        >
          {formularioCodigo}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
