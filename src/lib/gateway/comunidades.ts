import { gatewayFetch } from '@/lib/gateway/client'
import {
  comunidadSchema,
  eventoComunidadSchema,
  miembroComunidadSchema,
  postComunidadSchema,
  type ComunidadGateway,
  type EventoComunidadGateway,
  type MiembroComunidadGateway,
  type PostComunidadGateway,
} from '@/lib/gateway/schemas'
import { isMockMode } from '@/lib/mock-mode'
import * as demo from '@/lib/mock/comunidades-demo'
import type { RolComunidad, TipoPost } from '@/types/comunidad'
import { z } from 'zod'

export type TabExplorar = 'para-ti' | 'mis' | 'descubrir'

export async function fetchComunidades(params: {
  tab?: TabExplorar
  q?: string
}): Promise<ComunidadGateway[]> {
  if (isMockMode()) return demo.demoFetchComunidades(params)
  const search = new URLSearchParams()
  if (params.tab) search.set('tab', params.tab)
  if (params.q?.trim()) search.set('q', params.q.trim())
  const qs = search.toString()
  const data = await gatewayFetch<unknown>(
    `/api/comunidades${qs ? `?${qs}` : ''}`,
  )
  return z.array(comunidadSchema).parse(data)
}

export async function fetchComunidad(id: string): Promise<ComunidadGateway> {
  if (isMockMode()) return demo.demoFetchComunidad(id)
  const data = await gatewayFetch<unknown>(`/api/comunidades/${id}`)
  return comunidadSchema.parse(data)
}

export async function joinComunidad(id: string): Promise<ComunidadGateway> {
  if (isMockMode()) return demo.demoJoinComunidad(id)
  const data = await gatewayFetch<unknown>(`/api/comunidades/${id}/unirse`, {
    method: 'POST',
  })
  return comunidadSchema.parse(data)
}

export async function leaveComunidad(id: string): Promise<void> {
  if (isMockMode()) {
    demo.demoLeaveComunidad(id)
    return
  }
  await gatewayFetch<void>(`/api/comunidades/${id}/salir`, {
    method: 'DELETE',
  })
}

export async function fetchPublicaciones(
  comunidadId: string,
): Promise<PostComunidadGateway[]> {
  if (isMockMode()) return demo.demoFetchPublicaciones(comunidadId)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/publicaciones`,
  )
  return z.array(postComunidadSchema).parse(data)
}

export async function createPublicacion(
  comunidadId: string,
  body: { texto: string; tipo: TipoPost },
): Promise<PostComunidadGateway> {
  if (isMockMode()) return demo.demoCreatePublicacion(comunidadId, body)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/publicaciones`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
  return postComunidadSchema.parse(data)
}

export async function toggleReaccion(
  comunidadId: string,
  postId: string,
  tipo: 'like' = 'like',
): Promise<PostComunidadGateway> {
  if (isMockMode()) return demo.demoToggleReaccion(comunidadId, postId)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/publicaciones/${postId}/reaccion`,
    {
      method: 'POST',
      body: JSON.stringify({ tipo }),
    },
  )
  return postComunidadSchema.parse(data)
}

export async function createComentario(
  comunidadId: string,
  postId: string,
  texto: string,
): Promise<PostComunidadGateway> {
  if (isMockMode()) return demo.demoCreateComentario(comunidadId, postId, texto)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/publicaciones/${postId}/comentarios`,
    {
      method: 'POST',
      body: JSON.stringify({ texto }),
    },
  )
  return postComunidadSchema.parse(data)
}

export async function updatePublicacion(
  comunidadId: string,
  postId: string,
  body: { fijado?: boolean },
): Promise<PostComunidadGateway> {
  if (isMockMode()) return demo.demoUpdatePublicacion(comunidadId, postId, body)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/publicaciones/${postId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
  return postComunidadSchema.parse(data)
}

export async function deletePublicacion(
  comunidadId: string,
  postId: string,
): Promise<void> {
  if (isMockMode()) {
    demo.demoDeletePublicacion(comunidadId, postId)
    return
  }
  await gatewayFetch<void>(
    `/api/comunidades/${comunidadId}/publicaciones/${postId}`,
    { method: 'DELETE' },
  )
}

export async function fetchEventos(
  comunidadId: string,
  estado: 'proximos' | 'pasados' = 'proximos',
): Promise<EventoComunidadGateway[]> {
  if (isMockMode()) return demo.demoFetchEventos(comunidadId, estado)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/eventos?estado=${estado}`,
  )
  return z.array(eventoComunidadSchema).parse(data)
}

export async function fetchEvento(
  comunidadId: string,
  eventoId: string,
): Promise<EventoComunidadGateway> {
  if (isMockMode()) return demo.demoFetchEvento(comunidadId, eventoId)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/eventos/${eventoId}`,
  )
  return eventoComunidadSchema.parse(data)
}

export async function createEvento(
  comunidadId: string,
  body: {
    titulo: string
    descripcion?: string
    lugar?: string
    inicioEn: string
    finEn: string
    cupoMax?: number | null
  },
): Promise<EventoComunidadGateway> {
  if (isMockMode()) return demo.demoCreateEvento(comunidadId, body)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/eventos`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
  return eventoComunidadSchema.parse(data)
}

export async function deleteEvento(
  comunidadId: string,
  eventoId: string,
): Promise<void> {
  if (isMockMode()) {
    demo.demoDeleteEvento(comunidadId, eventoId)
    return
  }
  await gatewayFetch<void>(
    `/api/comunidades/${comunidadId}/eventos/${eventoId}`,
    { method: 'DELETE' },
  )
}

export async function confirmarEvento(
  comunidadId: string,
  eventoId: string,
): Promise<EventoComunidadGateway> {
  if (isMockMode()) return demo.demoConfirmarEvento(comunidadId, eventoId)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/eventos/${eventoId}/confirmar`,
    { method: 'POST' },
  )
  return eventoComunidadSchema.parse(data)
}

export async function cancelarEvento(
  comunidadId: string,
  eventoId: string,
): Promise<EventoComunidadGateway> {
  if (isMockMode()) return demo.demoCancelarEvento(comunidadId, eventoId)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/eventos/${eventoId}/confirmar`,
    { method: 'DELETE' },
  )
  return eventoComunidadSchema.parse(data)
}

export async function fetchMiembros(
  comunidadId: string,
): Promise<MiembroComunidadGateway[]> {
  if (isMockMode()) return demo.demoFetchMiembros(comunidadId)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/miembros`,
  )
  return z.array(miembroComunidadSchema).parse(data)
}

export async function updateMiembro(
  comunidadId: string,
  userId: string,
  body: { rol?: RolComunidad; suspendido?: boolean },
): Promise<MiembroComunidadGateway> {
  if (isMockMode()) return demo.demoUpdateMiembro(comunidadId, userId, body)
  const data = await gatewayFetch<unknown>(
    `/api/comunidades/${comunidadId}/miembros/${userId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
  return miembroComunidadSchema.parse(data)
}

export async function removeMiembro(
  comunidadId: string,
  userId: string,
): Promise<void> {
  if (isMockMode()) {
    demo.demoRemoveMiembro(comunidadId, userId)
    return
  }
  await gatewayFetch<void>(
    `/api/comunidades/${comunidadId}/miembros/${userId}`,
    { method: 'DELETE' },
  )
}
