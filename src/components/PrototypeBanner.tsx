import { AlertTriangle } from 'lucide-react'

type PrototypeBannerProps = {
  mensaje: string
}

export function PrototypeBanner({ mensaje }: PrototypeBannerProps) {
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{mensaje}</p>
    </div>
  )
}
