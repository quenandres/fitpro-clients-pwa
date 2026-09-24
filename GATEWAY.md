# Contrato gym-gateway (fitpro-clients)

Actualizado: 2026-09-22

Backend único: `gym-gateway`. No hay `gym-mcp` ni otro origen de API.

## Auth

| Método | Ruta | Notas |
|--------|------|-------|
| POST | `/api/auth/signup` | Body: `{ email, password, app: "client", full_name? }` |
| POST | `/api/auth/login` | |
| POST | `/api/auth/recover` | Envía un código de 6 dígitos. No revela si el email existe. |
| POST | `/api/auth/reset-password` | Body: `{ email, token, password }` → sesión |
| POST | `/api/auth/refresh` | |
| POST | `/api/auth/logout` | |
| GET | `/api/auth/user` | Incluye `role` de `users.profiles` |

## Cliente (PWA)

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/clientes/me/plan` | Plan activo con ejercicios + media firmada |
| GET | `/api/clientes/me/sesion-hoy` | Sesión del día + racha |
| GET | `/api/clientes/me/historial` | Sesiones completadas |
| POST | `/api/sesiones/{plan_session_id}/iniciar` | Crea sesión de ejecución |
| POST | `/api/sesiones/{session_id}/series` | Persiste serie |
| GET | `/api/sesiones/{session_id}/series` | Lista series |
| POST | `/api/sesiones/{session_id}/completar` | Marca sesión completada |
| GET | `/api/media/ejercicios/{id}` | URLs firmadas imagen/GIF |

## Progreso

| Método | Ruta |
|--------|------|
| GET | `/api/progreso/fotos` |
| POST | `/api/progreso/fotos` | multipart `file` |
| DELETE | `/api/progreso/fotos/{id}` |

## Comunidades

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/comunidades?tab=para-ti\|mis\|descubrir&q=` | Explorar |
| GET | `/api/comunidades/{id}` | Detalle + `esMiembro`, `miRol` |
| POST | `/api/comunidades/{id}/unirse` | Unirse (públicas) |
| DELETE | `/api/comunidades/{id}/salir` | Salir |
| GET | `/api/comunidades/{id}/publicaciones` | Feed |
| POST | `/api/comunidades/{id}/publicaciones` | `{ texto, tipo }` |
| POST | `/api/comunidades/{id}/publicaciones/{postId}/reaccion` | Toggle like |
| GET | `/api/comunidades/{id}/eventos?estado=proximos\|pasados` | Eventos |
| GET | `/api/comunidades/{id}/eventos/{eventoId}` | Detalle + RSVP |
| POST | `/api/comunidades/{id}/eventos/{eventoId}/confirmar` | RSVP |
| DELETE | `/api/comunidades/{id}/eventos/{eventoId}/confirmar` | Cancelar RSVP |

Cliente: `src/lib/gateway/comunidades.ts` + hooks en `comunidades-hooks.ts`.

## Entorno

```bash
VITE_GATEWAY_URL=http://localhost:8008
```
