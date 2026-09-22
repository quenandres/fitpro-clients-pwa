import { create } from 'zustand'
import {
  comunidadesMock,
  eventosMock,
  miembrosMock,
  MIEMBRO_ACTUAL_ID,
  postsMock,
} from '@/lib/mock/comunidades'
import type {
  Comunidad,
  EventoComunidad,
  MiembroComunidad,
  PostComunidad,
  TipoPost,
} from '@/types/comunidad'

type ComunidadesState = {
  comunidades: Comunidad[]
  miembros: MiembroComunidad[]
  posts: PostComunidad[]
  eventos: EventoComunidad[]
  esMiembro: (comunidadId: string) => boolean
  joinCommunity: (comunidadId: string, nombreUsuario?: string) => void
  leaveCommunity: (comunidadId: string) => void
  addPost: (comunidadId: string, texto: string, tipo: TipoPost) => void
  toggleLike: (postId: string) => void
  confirmarParticipacion: (eventoId: string) => void
  cancelarParticipacion: (eventoId: string) => void
  getMiembro: (id: string) => MiembroComunidad | undefined
}

function inicialesDe(nombre: string) {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

export const useComunidadesStore = create<ComunidadesState>((set, get) => ({
  comunidades: comunidadesMock.map((c) => ({ ...c })),
  miembros: miembrosMock.map((m) => ({ ...m })),
  posts: postsMock.map((p) => ({ ...p, likes: [...p.likes] })),
  eventos: eventosMock.map((e) => ({
    ...e,
    participantes: [...e.participantes],
  })),

  esMiembro: (comunidadId) =>
    get().miembros.some(
      (m) => m.id === MIEMBRO_ACTUAL_ID && m.comunidadId === comunidadId,
    ),

  joinCommunity: (comunidadId, nombreUsuario = 'Tú') => {
    if (get().esMiembro(comunidadId)) return
    set((s) => ({
      miembros: [
        ...s.miembros,
        {
          id: MIEMBRO_ACTUAL_ID,
          comunidadId,
          nombre: nombreUsuario,
          iniciales: inicialesDe(nombreUsuario),
          unidoEn: new Date().toISOString(),
        },
      ],
      comunidades: s.comunidades.map((c) =>
        c.id === comunidadId
          ? { ...c, miembrosCount: c.miembrosCount + 1 }
          : c,
      ),
    }))
  },

  leaveCommunity: (comunidadId) => {
    set((s) => ({
      miembros: s.miembros.filter(
        (m) => !(m.id === MIEMBRO_ACTUAL_ID && m.comunidadId === comunidadId),
      ),
      comunidades: s.comunidades.map((c) =>
        c.id === comunidadId
          ? { ...c, miembrosCount: Math.max(0, c.miembrosCount - 1) }
          : c,
      ),
      eventos: s.eventos.map((e) =>
        e.comunidadId === comunidadId
          ? {
              ...e,
              participantes: e.participantes.filter(
                (p) => p.miembroId !== MIEMBRO_ACTUAL_ID,
              ),
            }
          : e,
      ),
    }))
  },

  addPost: (comunidadId, texto, tipo) => {
    const post: PostComunidad = {
      id: `post-${Date.now()}`,
      comunidadId,
      autorId: MIEMBRO_ACTUAL_ID,
      tipo,
      texto,
      likes: [],
      creadoEn: new Date().toISOString(),
    }
    set((s) => ({
      posts: [post, ...s.posts],
      comunidades: s.comunidades.map((c) =>
        c.id === comunidadId ? { ...c, postsCount: c.postsCount + 1 } : c,
      ),
    }))
  },

  toggleLike: (postId) => {
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p
        const liked = p.likes.includes(MIEMBRO_ACTUAL_ID)
        return {
          ...p,
          likes: liked
            ? p.likes.filter((id) => id !== MIEMBRO_ACTUAL_ID)
            : [...p.likes, MIEMBRO_ACTUAL_ID],
        }
      }),
    }))
  },

  confirmarParticipacion: (eventoId) => {
    set((s) => ({
      eventos: s.eventos.map((e) => {
        if (e.id !== eventoId) return e
        const sinYo = e.participantes.filter(
          (p) => p.miembroId !== MIEMBRO_ACTUAL_ID,
        )
        const confirmados = sinYo.filter((p) => p.estado === 'confirmado').length
        const cupoLleno =
          e.cupoMax !== null && confirmados >= e.cupoMax
        return {
          ...e,
          participantes: [
            ...sinYo,
            {
              miembroId: MIEMBRO_ACTUAL_ID,
              estado: cupoLleno ? 'lista_espera' : 'confirmado',
            },
          ],
        }
      }),
    }))
  },

  cancelarParticipacion: (eventoId) => {
    set((s) => ({
      eventos: s.eventos.map((e) =>
        e.id === eventoId
          ? {
              ...e,
              participantes: e.participantes.filter(
                (p) => p.miembroId !== MIEMBRO_ACTUAL_ID,
              ),
            }
          : e,
      ),
    }))
  },

  getMiembro: (id) => get().miembros.find((m) => m.id === id),
}))
