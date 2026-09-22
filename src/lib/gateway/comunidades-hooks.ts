import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mapComunidadGateway } from '@/lib/comunidades/display'
import {
  cancelarEvento,
  confirmarEvento,
  createComentario,
  createEvento,
  createPublicacion,
  deleteEvento,
  deletePublicacion,
  fetchComunidad,
  fetchComunidades,
  fetchEvento,
  fetchEventos,
  fetchMiembros,
  fetchPublicaciones,
  joinComunidad,
  leaveComunidad,
  removeMiembro,
  toggleReaccion,
  updateMiembro,
  updatePublicacion,
  type TabExplorar,
} from '@/lib/gateway/comunidades'
import type { PostComunidadGateway } from '@/lib/gateway/schemas'
import type { PostComunidad, RolComunidad, TipoPost } from '@/types/comunidad'

export const comunidadesKeys = {
  all: ['comunidades'] as const,
  list: (tab: TabExplorar, q: string) =>
    [...comunidadesKeys.all, 'list', tab, q] as const,
  detail: (id: string) => [...comunidadesKeys.all, 'detail', id] as const,
  members: (id: string) => [...comunidadesKeys.all, 'members', id] as const,
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
    tipo: raw.tipo,
    texto: raw.texto,
    likes: raw.likes,
    fijado: raw.fijado,
    creadoEn: raw.creadoEn,
    liked: raw.liked,
    autorNombre: raw.autorNombre,
    autorIniciales: raw.autorIniciales,
    comentarios: raw.comentarios,
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

export function useComunidadMiembros(comunidadId: string) {
  return useQuery({
    queryKey: comunidadesKeys.members(comunidadId),
    queryFn: () => fetchMiembros(comunidadId),
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

export function useCreateComentario(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, texto }: { postId: string; texto: string }) =>
      createComentario(comunidadId, postId, texto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) })
    },
  })
}

export function useUpdatePublicacion(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, fijado }: { postId: string; fijado: boolean }) =>
      updatePublicacion(comunidadId, postId, { fijado }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) })
    },
  })
}

export function useDeletePublicacion(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => deletePublicacion(comunidadId, postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) })
    },
  })
}

export function useCreateEvento(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      titulo: string
      descripcion?: string
      lugar?: string
      inicioEn: string
      finEn: string
      cupoMax?: number | null
    }) => createEvento(comunidadId, body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.events(comunidadId, 'proximos'),
      })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) })
    },
  })
}

export function useDeleteEvento(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventoId: string) => deleteEvento(comunidadId, eventoId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.events(comunidadId, 'proximos'),
      })
      void qc.invalidateQueries({
        queryKey: comunidadesKeys.events(comunidadId, 'pasados'),
      })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) })
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

export function useUpdateMiembro(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      rol,
      suspendido,
    }: {
      userId: string
      rol?: RolComunidad
      suspendido?: boolean
    }) => updateMiembro(comunidadId, userId, { rol, suspendido }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.members(comunidadId) })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) })
    },
  })
}

export function useRemoveMiembro(comunidadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => removeMiembro(comunidadId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.members(comunidadId) })
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) })
    },
  })
}
