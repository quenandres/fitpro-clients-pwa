import type { SesionModalidad } from '@/types/tracking'
import { cn } from '@/lib/utils'

export function heatmapCellClass(
  modalidad: SesionModalidad | null,
  options?: { pad?: boolean; outOfRange?: boolean },
): string {
  if (options?.pad) return 'invisible'
  if (options?.outOfRange) return 'bg-transparent'

  if (!modalidad) {
    return 'bg-muted text-muted-foreground'
  }

  const byMod: Record<SesionModalidad, string> = {
    fuerza: 'bg-orange-500 text-white',
    isometrico: 'bg-blue-500 text-white',
    otro: 'bg-primary text-primary-foreground',
  }

  return cn('font-medium tabular-nums', byMod[modalidad])
}
