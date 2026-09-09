# Contrato de gateway pendiente (fitpro-clients)

Este documento lista lo que **gym-gateway** ya expone y lo que falta para
que la PWA de clientes deje el modo prototipo.

Verificado en `gym-gateway` (2026-09-09).

## Disponible hoy

| Método | Ruta | Uso en fitpro-clients |
|--------|------|------------------------|
| POST | `/api/auth/signup` | `/register` |
| POST | `/api/auth/login` | `/login` |
| POST | `/api/auth/refresh` | Renovación de token |
| POST | `/api/auth/logout` | `/perfil` — cerrar sesión |
| GET | `/api/auth/user` | AuthProvider, `/perfil` |

### Pendiente en auth

- **Rol `client` en el alta:** el signup actual no asigna rol. Hay que acordar
  que los usuarios de esta app nazcan como `client` (trigger Supabase o lógica
  en gateway).

## No existe — series (player)

Sin esto el producto **no persiste entrenamientos**. El player (`/sesion/$sesionId`)
opera en modo prototipo.

### Contrato propuesto

```
POST /api/sesiones/{sesion_id}/series
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "ejercicio_id": "uuid",
  "numero_serie": 1,
  "peso_kg": 60,
  "repeticiones": 8,
  "rpe": null
}

→ 201 { "id": "uuid", "confirmada": true, ... }
```

```
GET /api/sesiones/{sesion_id}/series
→ 200 [{ "ejercicio_id", "numero_serie", "peso_kg", "repeticiones", ... }]
```

```
GET /api/clientes/me/sesion-hoy
→ 200 { "sesion": { ... }, "racha_dias": 3 }
```

```
GET /api/clientes/me/plan
→ 200 { "id", "nombre", "semanas": [...] }
```

```
GET /api/clientes/me/historial
→ 200 [{ "id", "nombre", "fecha", "series": [...] }]
```

Implementación en frontend: `src/lib/gateway/series.ts` (stubs que lanzan
`SeriesEndpointMissingError`).

## No existe — fotos de progreso

Sin esto `/progreso` no puede cumplir honestidad de guardado (C9). **No** usar
Supabase Storage desde el frontend (C1).

### Contrato propuesto

- Bucket privado: `progreso-fotos`
- Tabla: `foto_progreso` (`id`, `user_id`, `creada_en`, `storage_path`)
- RLS: solo el propio `user_id`

```
POST /api/progreso/fotos
Content-Type: multipart/form-data
→ 201 { "id", "creada_en", "url_firmada" }

GET /api/progreso/fotos
→ 200 [{ "id", "creada_en", "url_firmada" }]

DELETE /api/progreso/fotos/{foto_id}
→ 204

GET /api/progreso/fotos/{foto_id}/url
→ 200 { "url": "signed-url" }
```

Implementación en frontend: `src/lib/gateway/fotos.ts` (stubs).

## Variables de entorno (fitpro-clients)

```bash
VITE_GATEWAY_URL=http://localhost:8000
```

Copiar `.env.example` → `.env` antes de probar auth.
