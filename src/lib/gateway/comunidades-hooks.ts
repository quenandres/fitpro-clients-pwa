import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mapComunidadGateway } from '@/lib/comunidades/display'
import {
  cancelarEvento,
  confirmarEvento,
  createPublicacion,
  fetchComunidad,
  fetchComunidades,
  fetchEvento,
  fetchEventos,
  fetchPublicaciones,
  joinComunidad,
  leaveComunidad,
  toggleReaccion,
  type TabExplorar,
} from '@/lib/gateway/comunidades'
import type { PostComunidadGateway } from '@/lib/gateway/schemas'
import type { PostComunidad, TipoPost } from '@/types/comunidad'

export const comunidadesKeys = {
  all: ['comunidades'] as const,
  list: (tab: TabExplorar, q: string) =>
    [...comunidadesKeys.all, 'list', tab, q] as const,
  detail: (id: string) => [...comunidadesKeys.all, 'detail', id] as const,
  posts: (id: string) => [...comunidadesKeys.all, 'posts', id] as const,
  events: (id: string, estado: 'proximos' | 'pasados') =>
    [...comunidadesKeys.all, 'events', id, estado] as const,
  event: (comunidadId: string, eventoId: string) =>
    [...comunidadesKeys.all, 'event', comunidadId, eventoId] as const,
}

function mapPost(raw: PostComunidadGateway): PostComunidad {
  return {
    id: raw.id,
    comunidadId: raw.comunidadId,
    autorId: raw.autorId,
    tipo: raw.tipo === 'anuncio' ? 'general' : raw.tipo,
    texto: raw.texto,
    likes: raw.likes,
    fijado: raw.fijado,
    creadoEn: raw.creadoEn,
    liked: raw.liked,
    autorNombre: raw.autorNombre,
    autorIniciales: raw.autorIniciales,
  }
}

export function useComunidadesList(tab: TabExplorar, q: string) {
  return useQuery({
    queryKey: comunidadesKeys.list(tab, q),
    queryFn: async () => {
      const rows = await fetchComunidades({ tab, q })
      return rows.map(mapComunidadGateway)
    },
  })
}

export function useComunidad(comunidadId: string) {
  return useQuery({
    queryKey: comunidadesKeys.detail(comunidadId),
    queryFn: async () => mapComunidadGateway(await fetchComunidad(comunidadId)),
    enabled: Boolean(comunidadId),
  })
}

export function useComunidadPosts(comunidadId: string) {
  return useQuery({
    queryKey: comunidadesKeys.posts(comunidadId),
    queryFn: async () => {
      const rows = await fetchPublicaciones(comunidadId)
      return rows.map(mapPost)
    },
    enabled: Boolean(comunidadId),
  })
}

export function useComunidadEventos(
  comunidadId: string,
  estado: 'proximos' | 'pasados',
) {
  return useQuery({
    queryKey: comunidadesKeys.events(comunidadId, estado),
    queryFn: () => fetchEventos(comunidadId, estado),
    enabled: Boolean(comunidadId),
  })
}

export function useComunidadEvento(comunidadId: string, eventoId: string) {
  return useQuery({
    queryKey: comunidadesKeys.event(comunidadId, eventoId),
    queryFn: () => fetchEvento(comunidadId, eventoId),
    enabled: Boolean(comunidadId && eventoId),
  })
}

export function useJoinComunidad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => joinComunidad(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.all })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(id) })
    },
  })
}

export function useLeaveComunidad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leaveComunidad(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.all })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(id) })
    },
  })
}

export function useCreatePublicacion(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { texto: string; tipo: TipoPost }) =>
      createPublicacion(comunidadId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) })
    },
  })
}

export function useToggleLike(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => toggleReaccion(comunidadId, postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) })
    },
  })
}

export function useConfirmarEvento(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventoId: string) => confirmarEvento(comunidadId, eventoId),
    onSuccess: (_data, eventoId) => {
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.events(comunidadId, 'proximos'),
      })
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.event(comunidadId, eventoId),
      })
    },
  })
}

export function useCancelarEvento(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventoId: string) => cancelarEvento(comunidadId, eventoId),
    onSuccess: (_data, eventoId) => {
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.events(comunidadId, 'proximos'),
      })
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.event(comunidadId, eventoId),
      })
    },
  })
}
