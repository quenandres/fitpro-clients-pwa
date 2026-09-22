import type { CategoriaComunidad, Comunidad } from '@/types/comunidad'
import type { ComunidadGateway } from '@/lib/gateway/schemas'

const COLORES_CATEGORIA: Record<
  CategoriaComunidad,
  { portada: string; avatar: string }
> = {
  crossfit: { portada: 'oklch(0.35 0.08 150)', avatar: 'oklch(0.505 0.132 150)' },
  running: { portada: 'oklch(0.38 0.06 240)', avatar: 'oklch(0.55 0.12 240)' },
  fuerza: { portada: 'oklch(0.32 0.06 30)', avatar: 'oklch(0.48 0.12 30)' },
  yoga: { portada: 'oklch(0.32 0.05 300)', avatar: 'oklch(0.5 0.1 300)' },
  nutricion: { portada: 'oklch(0.36 0.07 90)', avatar: 'oklch(0.52 0.11 90)' },
  ciclismo: { portada: 'oklch(0.34 0.06 200)', avatar: 'oklch(0.5 0.1 200)' },
  calistenia: { portada: 'oklch(0.33 0.05 60)', avatar: 'oklch(0.49 0.09 60)' },
}

function inicialesDe(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function mapComunidadGateway(raw: ComunidadGateway): Comunidad {
  const colores = COLORES_CATEGORIA[raw.categoria]
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    categoria: raw.categoria,
    visibilidad: raw.visibilidad,
    colorPortada: colores.portada,
    colorAvatar: colores.avatar,
    iniciales: inicialesDe(raw.nombre),
    portadaUrl: raw.portadaUrl,
    avatarUrl: raw.avatarUrl,
    miembrosCount: raw.miembrosCount,
    postsCount: raw.postsCount,
    eventosCount: raw.eventosCount,
    reglas: raw.reglas,
    creadaEn: raw.creadaEn,
    esMiembro: raw.esMiembro,
    miRol: raw.miRol,
    suspendido: raw.suspendido,
  }
}
