import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ContenidoColapsable } from '@/components/motion/DashboardMotion'
import { TRANSICION_ESTADO } from '@/lib/motion'
import { cn } from '@/lib/utils'

type ItemConId = { id: string }

/** Entrada/salida de filas del feed, eventos, miembros y explorar (solo tras confirmación del servidor). */
export function ListaItemsAnimada<T extends ItemConId>({
  items,
  className,
  itemClassName,
  renderItem,
}: {
  items: T[]
  className?: string
  itemClassName?: string
  renderItem: (item: T) => ReactNode
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={TRANSICION_ESTADO}
            className={cn('overflow-hidden', itemClassName)}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Comentarios dentro de un post (mismo token, menor desplazamiento). */
export function ListaComentariosAnimada<T extends ItemConId>({
  items,
  renderItem,
}: {
  items: T[]
  renderItem: (item: T) => ReactNode
}) {
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={TRANSICION_ESTADO}
            className="overflow-hidden rounded-lg bg-secondary/60 px-3 py-2"
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Avisos de estado (suspendido, no miembro) sin empujar el layout de golpe. */
export function AvisoComunidadAnimado({
  visible,
  children,
}: {
  visible: boolean
  children: ReactNode
}) {
  return (
    <ContenidoColapsable abierto={visible} deps={[children]}>
      {visible ? children : null}
    </ContenidoColapsable>
  )
}
