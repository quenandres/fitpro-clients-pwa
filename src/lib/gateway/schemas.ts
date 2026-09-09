import { z } from 'zod'

export const authTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  token_type: z.string().optional(),
})

export type AuthTokens = z.infer<typeof authTokensSchema>

export const usuarioSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string().nullable().optional(),
  aud: z.string().optional(),
  exp: z.number().optional(),
})

export type UsuarioGateway = z.infer<typeof usuarioSchema>

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(1).optional(),
})
