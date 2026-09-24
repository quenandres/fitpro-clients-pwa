import { useSyncExternalStore } from 'react'

const subscribe = (onStoreChange: () => void) => {
  const id = window.setInterval(onStoreChange, 60_000)
  return () => window.clearInterval(id)
}

const getSnapshot = () => Date.now()

/** Marca de tiempo estable en render; se actualiza como mucho cada minuto. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
