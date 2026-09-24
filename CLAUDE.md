# CLAUDE.md — Contexto del proyecto (PWA de clientes)

> Archivo de arranque para el asistente. Es **autónomo**: todo lo necesario
> para trabajar en este repo está aquí. Para **crear o modificar pantallas/UI**,
> leer también **[DESIGN.md](./DESIGN.md)** antes de tocar `src/`.
>
> Última revisión: 2026-09-22

---

## 1. Qué es esta app

La app con la que una persona **entrena**: abre, ve qué le toca hoy, ejecuta la
sesión y **registra lo que levantó** (peso, repeticiones, series). Es una PWA
instalable, pensada para usarse de pie en el gimnasio, con una mano.

Su razón de existir es el **registro de la sesión**. Todo lo demás — el plan,
el historial, el perfil — está al servicio de eso.

- **Idioma:** español (UI, commits, docs, nombres de dominio).
- **Alcance del MVP:** entrar → ver la sesión del día → ejecutarla → persistir
  las series. Nada más.
- **Fuera de alcance:** creación/edición de rutinas y planes, gestión de otras
  personas, calendario de terceros, comunidades, pagos, IA. Si una tarea pide
  eso, cuestionarla (§9.4).
- **Estado hoy (2026-09-22):** auth, plan, Hoy, player e historial hablan con
  `gym-gateway` (`training.sessions` / `session_sets`). La IA de rutinas vive
  en el gateway (no hay `gym-mcp`). Iconos PWA aún pendientes.

### Relación con los repos hermanos

En el mismo directorio padre viven otros proyectos. **Este repo es
independiente de ellos**: no importa su código, no hereda sus decisiones y no
hay que leer su documentación para trabajar aquí.

| Repo | Relación real |
|------|---------------|
| `../gym-gateway` | **Backend compartido.** Es la API de esta app (§2). Un cambio de contrato cruza este límite y hay que avisar al usuario. |
| `../fitpro` | Cockpit web de entrenadores, otro producto del mismo dominio. Comparte el **lenguaje visual** (marca, tono, español) y **a grandes rasgos el modelo de dominio** — plan, sesión, ejercicio, serie. **Nada más:** distinto stack de UI, distintas rutas, distinto código. No copiar componentes ni clases desde ahí. |
| Otros (`movil`, `web`, …) | Sin relación con este repo. |

---

## 2. Stack

| Capa | Hoy | Objetivo |
|---|---|---|
| App | React 19.2 + Vite 8 + TypeScript ~6.0 (estricto) | — |
| Routing | **TanStack Router v1** file-based en `src/routes/` | §7 |
| Estado servidor | **TanStack Query v5** montado en `main.tsx` | Fuente de datos de plan/sesiones (pendiente cablear) |
| Estado UI efímero | **Zustand** — `store/player-store.ts` (runtime del player) | Serie actual, timer, descanso |
| UI kit | **shadcn/ui** (`base-nova`) — avatar, badge, button, card, input, label, sheet, dialog, progress, skeleton, separator, switch, sonner | §8 DESIGN |
| Estilos | Tailwind 4 + tokens shadcn; **marca verde en `--primary`** (`DESIGN.md §3`) | — |
| Tipografía | **Geist Variable** (`@fontsource-variable/geist`), `--font-sans` / `--font-heading` | Ver `DESIGN.md §4` |
| Iconos | `lucide-react` | — |
| Motion | **Animate UI** (registry de shadcn, copy-first) sobre `motion` — capa de movimiento, no segundo set de componentes (C15) | Plan por fases e inventario por pantalla en `DESIGN.md §18` |
| PWA | `vite-plugin-pwa` (`registerType: autoUpdate`, manifest `GYMApp`) — **faltan `public/pwa-192x192.png` y `pwa-512x512.png`** | Instalable; offline real después del MVP |
| Compilador | **React Compiler** vía `babel-plugin-react-compiler` + `@rolldown/plugin-babel` | — |
| Backend | **`../gym-gateway`** — auth, plan, sesiones, comunidades, fotos. IA de rutinas también está ahí (antes `gym-mcp`) | [GATEWAY.md](./GATEWAY.md) |
| Supabase directo | `@supabase/supabase-js` instalado pero **sin usar** (C1) | Todo por el gateway |
| Validación runtime | **Zod** — schemas en `lib/gateway/schemas.ts` | Ampliar con contratos de dominio |
| Tests | — (sin Vitest, sin `*.test.ts`) | Vitest + @testing-library/react |

**Node.js:** el sistema local tiene **v18.19.1**; Vite 8 pide Node ≥20.19/22.12
y TypeScript ~6.0 sube el piso. Si `vite` o `tsc -b` fallan localmente, revisar
la versión de Node activa **antes** de asumir un bug del código.

`node_modules` está instalado: el build no debería romper por dependencias
ausentes.

---

## 3. Estructura del repo

```
fitpro-clients/
├── public/favicon.svg
├── src/
│   ├── main.tsx               # QueryClientProvider → ThemeProvider → AuthProvider → Router
│   ├── app-router.tsx         # RouterProvider con contexto de auth
│   ├── router.ts              # createRouter + queryClient
│   ├── routes/                # file-based (routeTree.gen.ts GENERADO)
│   ├── components/            # AppShell, PrototypeBanner, SesionPreview, ui/
│   ├── providers/             # auth-provider, theme-provider
│   ├── lib/gateway/           # cliente HTTP + stubs series/fotos
│   ├── lib/mock/              # datos prototipo hasta endpoints reales
│   ├── store/player-store.ts
│   ├── types/dominio.ts
│   └── index.css
├── .env.example               # VITE_GATEWAY_URL
├── GATEWAY.md                 # contrato pendiente con gym-gateway
├── CLAUDE.md
└── DESIGN.md
```

---

## 4. Comandos

```bash
npm install                 # ya corrido en este entorno
npm run dev                 # Vite dev server (http://localhost:5173)
npm run build               # tsc -b && vite build
npm run lint                # ESLint flat config (TS + react-hooks + react-refresh)
npm run preview             # sirve el build — necesario para probar el service worker

# shadcn: agregar componentes (no escribirlos a mano)
npx shadcn@latest add <componente>

# Backend local:
# cd ../gym-gateway && uvicorn app.main:app --reload
```

**Variables de entorno:** `.env.example` con `VITE_GATEWAY_URL` (puerto **8008**
si el gateway corre en Docker). Copiar a `.env` antes de probar auth. No
agregar `VITE_SUPABASE_*` (C1).

---

## 5. Advertencias críticas (leer antes de editar)

1. **Template de Vite eliminado.** `App.tsx`, `App.css`, `public/icons.svg` ya
   no existen. No borrar código "por estética" fuera de eso.
2. **`main.tsx` montado:** `QueryClientProvider` → `ThemeProvider` →
   `AuthProvider` → `RouterProvider` (vía `app-router.tsx`).
3. **`@supabase/supabase-js` está instalado y contradice C1.** La decisión
   vigente es que **todo** el tráfico pasa por `gym-gateway` (una sola puerta,
   con RBAC y RLS server-side). **No instanciar el cliente de Supabase sin
   discutirlo con el usuario**: sería una segunda vía de acceso. Si se decide
   usarlo (Realtime, offline), registrar la decisión en §6 antes de escribir
   código. Por defecto: gateway.
4. **Auth es real desde el día 1, no mock.** El gateway valida credenciales
   contra Supabase Auth y devuelve JWT ES256 con refresh. No inventar un login
   mock "mientras tanto": lo que se necesita es el cliente HTTP de §3
   (`lib/gateway/`), escrito en este repo.
5. **El rol de esta app es `client`.** El gateway ya hace RBAC server-side; el
   gating del frontend es barrera secundaria, no la principal. No exponer
   pantallas de gestión (rutinas, otras personas, catálogos). **Excepción
   temporal (C12):** también entra `admin`, para probar la PWA con cuentas de
   administración.
6. **Dominio en `src/types/dominio.ts`.** Tipos derivados del contrato del
   gateway; hoy Hoy/Plan/Historial usan mock en `lib/mock/`. Reglas: **`ejercicio_id`**
   nunca nombre como clave; Zod en respuestas del gateway (C4).
7. **Player persiste series reales.** `/api/sesiones/*/iniciar|series|completar`
   escribe `training.sessions` / `session_sets`. Progreso de fotos ya va por
   `/api/progreso/fotos`. El panel de stats de Hoy sigue con `progresoHoyMock`.
8. **shadcn/ui: agregar, no reescribir.** Los componentes de
   `src/components/ui/` los genera el CLI (`npx shadcn@latest add`). No
   escribirlos a mano; editarlos solo para adaptarlos a tokens de marca, y
   dejar constancia en `DESIGN.md §8`.
9. **PWA instalable:** `public/pwa-192x192.png`, `public/pwa-512x512.png` y
   `public/pwa-icon.svg` (verde marca, mancuerna). Probar con
   `npm run build && npm run preview`. El nombre del manifest sigue siendo
   `GYMApp` — decidir el definitivo antes de publicar.
10. **El service worker no corre en `npm run dev`.** Probar instalabilidad y
    caché con `npm run build && npm run preview`.
11. **React Compiler está activo.** No agregar `useMemo`/`useCallback`
    defensivos "por performance"; sí respetar las reglas de hooks.
12. **`src/routeTree.gen.ts` es generado.** No editarlo ni revisarlo.

---

## 6. Decisiones fijadas (ADR de este repo)

Decisiones vivas de **este** proyecto. No desviarse sin acordar una nueva y
anotarla aquí con fecha.

- **C1 — Una sola puerta al backend.** Todo va por `gym-gateway`. El frontend
  no habla con Supabase directo (ver §5.3).
- **C2 — TanStack Query para datos de servidor.** Nada de estado servidor en
  Zustand ni en `useEffect` + `useState`.
- **C3 — Zustand solo para UI efímera** (runtime del player, modales). Nada de
  dominio en `localStorage` habiendo servidor. La excepción legítima sería una
  **cola offline de series pendientes**, y eso pide decisión propia antes.
- **C4 — Zod para todo lo que entra del exterior.** Instalarlo con la primera
  llamada real al gateway; los tipos de dominio se derivan de los schemas.
- **C5 — Ejercicios por ID, nunca por nombre.**
- **C6 — Mobile-first + layout real en `md+` (2026-09-09).** Sustituye «desktop =
  teléfono centrado». En móvil: bottom nav; en `md+`: top nav horizontal, contenido
  hasta `max-w-6xl`, dos columnas donde aporte. Sin sidebar de gestión
  (`DESIGN.md §11`).
- **C7 — Instalable ahora, offline después.** La PWA instalable entra en el
  MVP; la sincronización offline real, no.
- **C8 — Independencia de repos.** No se importa código de `../fitpro` ni de
  otros hermanos. Lo compartido es el lenguaje visual y la forma del dominio,
  y se re-declara aquí.
- **C9 — Honestidad de guardado.** Nada se muestra como registrado hasta que el
  servidor lo confirma (`DESIGN.md §7`).
- **C10 — `/register` abierto (2026-09-09).** Alta pública como `client`; falta
  que el gateway asigne rol en signup.
- **C11 — Nav de 5 items (2026-09-09).** Sustituido por C13.
- **C12 — Entrenador también entra como cliente (2026-09-20).** La PWA admite
  `client`, `admin`, `superadmin` y `trainer`. Un entrenador puede usar su
  propio plan/rutinas. Solo se bloquea `gym`. No abre pantallas de gestión.
- **C13 — Comunidades + nav de 6 items (2026-09-15, paridad gateway 2026-09-22).**
  Sexto ítem **Comunidades** (`Users`) → `/comunidades`. Datos vía `gym-gateway`
  (`/api/comunidades/*`, TanStack Query en `lib/gateway/comunidades-hooks.ts`):
  explorar, unirse/salir, publicaciones, comentarios, likes, eventos con RSVP,
  miembros y moderación según `miRol`. Sin store mock.
- **C14 — Recuperar acceso con código, no magic link (2026-09-22).**
  `/recuperar` pide un OTP de 6 dígitos vía `POST /api/auth/recover` y
  `POST /api/auth/reset-password`. El enlace de Supabase (`otp_expired` en el
  hash) se descarta: el usuario escribe el código y una contraseña nueva.
- **C15 — Animate UI como capa de motion, selectiva (2026-09-24).** Se adopta
 [Animate UI](https://animate-ui.com) por el registry de shadcn, y **solo** sus
 capas agnósticas (`effects`, `texts`, `buttons`, `animate`, hooks). Queda fuera
 todo lo que trae otra librería de primitivas (`components/base|radix/*`
 importan `@base-ui-components/react`, mientras el repo usa `@base-ui/react`) y
 todo lo decorativo (fondos, partículas, tilt). Un componente de
 `src/components/ui/` no se reemplaza por su gemelo animado: se envuelve.
 Motion solo donde comunica estado o progreso real; no se anima la entrada de
 las pantallas. Inventario por pantalla, tokens de transición y fases en
 **`DESIGN.md §18`**. Rollout **fases 0–6 cerrado** (2026-09-24; QA en §18.9).
- **Pendientes de decidir:** nombre definitivo del producto/manifest; Sentry/PostHog;
 Vitest; iconos PWA.

### Convenciones de código

- **TypeScript estricto y obligatorio** (`noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`): no relajar ni suprimir errores del compilador salvo
  caso puntual y comentado; preferir `unknown` + narrow. `verbatimModuleSyntax`
  obliga a `import type { … }` para tipos.
- **Alias `@/`** → `src/` (en `vite.config.ts` y `tsconfig.app.json`). Usarlo en
  imports cruzados; relativos solo dentro de una misma carpeta.
- **Principios SOLID** al diseñar módulos, hooks y componentes: una razón de
  cambio por unidad (SRP), extender sin modificar consumidores (OCP), contratos
  sustituibles (LSP), APIs mínimas (ISP), depender de abstracciones tipadas
  frente a detalles de infraestructura (DIP).
- Componentes en PascalCase, hooks en `useCamelCase`, stores `useXxxStore`.
- Nombres de dominio en **español** (`Rutina`, `Ejercicio`, `Serie`, `Sesion`,
  `Plan`). Nombres técnicos en inglés.
- No crear archivos nuevos si editar uno existente basta.
- No comentarios que narren el código; solo intención no obvia, trade-offs o
  restricciones.

---

## 7. Rutas

TanStack Router file-based en `src/routes/` → `routeTree.gen.ts` (generado).

- **Públicas:** `/register`, `/login`, `/recuperar` (sin nav; redirigen a `/` si hay JWT).
- **Protegidas (rol `client`, layout `_authenticated` + AppShell):**
  - `/` — Hoy: sesión del día, racha, CTA al detalle de sesión.
  - `/plan` — plan asignado (lectura); preview drawer móvil / split `md+`.
  - `/sesion/$sesionId/detalle` — lista de ejercicios de la sesión (con nav).
  - `/sesion/$sesionId` — **player** inmersivo (sin nav). Escribe series en `gym-gateway`.
  - `/historial` — log de sesiones; detalle drawer / split `md+`.
  - `/progreso` — fotos antes/después. Prototipo hasta Storage en gateway.
  - `/comunidades` — explorar comunidades (tabs, búsqueda, Unirme).
  - `/comunidades/$comunidadId` — inicio de comunidad (Unirme/Salir, resumen).
  - `/comunidades/$comunidadId/publicaciones` — feed + publicar + comentarios.
  - `/comunidades/$comunidadId/eventos` — próximos/pasados + RSVP + crear (moderador).
  - `/comunidades/$comunidadId/eventos/$eventoId` — detalle de evento + RSVP.
  - `/comunidades/$comunidadId/miembros` — listado; moderación si `miRol` lo permite.
  - `/perfil` — identidad, tema, logout.

Nav de 6 items (C13): Hoy, Plan, Historial, Progreso, Comunidades, Perfil.

---

## 8. Hitos

1. **Base** — template limpio, providers, rutas, shell, marca. → *hecho*
2. **Auth** — gateway client, AuthProvider, `/login`, `/register`, `/recuperar`, guards. → *hecho*
3. **Dominio** — `types/` + Zod auth; mock para plan/sesiones. → *parcial*
4. **Lectura** — `/` y `/plan` contra el gateway. → *hecho*
5. **Escritura** — player que **persiste series** vía gateway. → *hecho*
6. **Cierre** — `/historial`, `/progreso`, `/perfil` reales; iconos PWA. → *hecho* (iconos 2026-09-24)

Después del MVP: offline real (cola de sincronización), notificaciones,
observabilidad, tests.

---

## 9. Cómo trabajar con este repo (protocolo para el asistente)

1. Al arrancar una tarea, leer este `CLAUDE.md`. Si toca UI (`src/routes/`,
   `src/components/`, estilos), leer **`DESIGN.md`** antes de implementar.
2. **Antes de dar por hecho que algo no existe, mirar §5.** Este repo es un
   scaffold: la mayoría de "faltantes" son intencionales, no bugs.
3. Si la tarea toca el contrato del backend o pide endpoints que no existen:
   eso vive en `../gym-gateway`. **Avisar al usuario** antes de cruzar ese
   límite de repos.
4. Si la tarea pide funcionalidad de gestión (crear rutinas, administrar otras
   personas, comunidades, pagos), **cuestionarla**: está fuera del alcance de
   esta app (§1).
5. Si la tarea pide hablar con Supabase directo desde el frontend: ver §5.3 y
   acordar la decisión antes de escribir código.
6. Al completar una tarea relevante:
   - Decisión técnica nueva → agregarla a §6 con fecha.
   - Cambio de estado de un hito → actualizar §8.
   - Token o patrón visual nuevo → `DESIGN.md` (ver su §17).
7. Nunca borrar código "por estética". La única limpieza pre-autorizada es la
   del template de Vite (§5.1).
8. No commitear sin que el usuario lo pida explícitamente.

---

## 10. Archivos de referencia rápida

- [DESIGN.md](./DESIGN.md) — guía de diseño y creación de pantallas.
- [src/index.css](./src/index.css) — tokens (shadcn `:root` / `.dark`) + Geist.
  **Código canónico de estilos.**
- [vite.config.ts](./vite.config.ts) — router file-based, Tailwind, PWA, alias.
- [components.json](./components.json) — config de shadcn (`base-nova`, neutral).
- [tsconfig.app.json](./tsconfig.app.json) — reglas estrictas y `paths`.
- [GATEWAY.md](./GATEWAY.md) — endpoints existentes y contrato pendiente.
- [README.md](./README.md) — README del template de Vite; **no** documenta este
  producto (candidato a reescribir).
