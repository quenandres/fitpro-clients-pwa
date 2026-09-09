# CLAUDE.md — Contexto del proyecto (PWA de clientes)

> Archivo de arranque para el asistente. Es **autónomo**: todo lo necesario
> para trabajar en este repo está aquí. Para **crear o modificar pantallas/UI**,
> leer también **[DESIGN.md](./DESIGN.md)** antes de tocar `src/`.
>
> Última revisión: 2026-09-09

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
- **Estado hoy (2026-09-09):** **scaffold**. Vite + React 19 + TanStack Router
  + shadcn/ui recién inicializados; `src/App.tsx` sigue siendo la landing del
  template de Vite. No hay rutas, ni auth, ni dominio, ni iconos de PWA. Ver §5.

### Relación con los repos hermanos

En el mismo directorio padre viven otros proyectos. **Este repo es
independiente de ellos**: no importa su código, no hereda sus decisiones y no
hay que leer su documentación para trabajar aquí.

| Repo | Relación real |
|------|---------------|
| `../gym-gateway` | **Backend compartido.** Es la API de esta app (§2). Un cambio de contrato cruza este límite y hay que avisar al usuario. |
| `../fitpro` | Cockpit web de entrenadores, otro producto del mismo dominio. Comparte el **lenguaje visual** (marca, tono, español) y **a grandes rasgos el modelo de dominio** — plan, sesión, ejercicio, serie. **Nada más:** distinto stack de UI, distintas rutas, distinto código. No copiar componentes ni clases desde ahí. |
| Otros (`gym-mcp`, `movil`, `web`, …) | Sin relación con este repo. |

---

## 2. Stack

| Capa | Hoy | Objetivo |
|---|---|---|
| App | React 19.2 + Vite 8 + TypeScript ~6.0 (estricto) | — |
| Routing | **TanStack Router v1** + `@tanstack/router-plugin` (file-based, `autoCodeSplitting`) — cableado en `vite.config.ts`, **sin rutas creadas** | Árbol de §7 |
| Estado servidor | **TanStack Query v5** instalado, **sin `QueryClientProvider`** en `src/main.tsx` | Fuente de datos de plan/sesiones |
| Estado UI efímero | Zustand 5 instalado, **sin stores** | Runtime del player (serie actual, timer) |
| UI kit | **shadcn/ui** (`style: base-nova`, `baseColor: neutral`) sobre **Base UI** (`@base-ui/react`) — hay 4 componentes: `avatar`, `badge`, `button`, `card` | Set mínimo del player + listas |
| Estilos | Tailwind 4 (`@tailwindcss/vite`) + tokens shadcn en `src/index.css` + `tw-animate-css` | Marca aplicada sobre esa base (`DESIGN.md §3`) |
| Tipografía | **Geist Variable** (`@fontsource-variable/geist`), `--font-sans` / `--font-heading` | Ver `DESIGN.md §4` |
| Iconos | `lucide-react` | — |
| PWA | `vite-plugin-pwa` (`registerType: autoUpdate`, manifest `GYMApp`) — **faltan `public/pwa-192x192.png` y `pwa-512x512.png`** | Instalable; offline real después del MVP |
| Compilador | **React Compiler** vía `babel-plugin-react-compiler` + `@rolldown/plugin-babel` | — |
| Backend | **`../gym-gateway`** (FastAPI → Supabase Auth + PostgREST; JWT ES256 vía JWKS; RBAC server-side) — **sin cliente HTTP en este repo todavía** | Cliente propio en `src/lib/gateway/` |
| Supabase directo | `@supabase/supabase-js` **instalado pero sin usar** — decisión pendiente (§5.3) | Por defecto: **no**, todo por el gateway |
| Validación runtime | **Zod no instalado** | Validar toda respuesta del gateway (§6, C4) |
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
├── public/
│   ├── favicon.svg
│   └── icons.svg              # sprite del template Vite (se va con §5.1)
├── src/
│   ├── main.tsx               # createRoot + <App /> — sin providers todavía
│   ├── App.tsx                # LANDING DEL TEMPLATE DE VITE — a reemplazar (§5.1)
│   ├── App.css                # CSS del template — a borrar con App.tsx
│   ├── index.css              # Tailwind 4 + tokens shadcn (:root / .dark) + Geist
│   ├── assets/                # hero.png, react.svg, vite.svg — del template
│   ├── components/ui/         # shadcn: avatar, badge, button, card
│   └── lib/utils.ts           # re-export de `cn`
├── components.json            # config shadcn (aliases @/…, style base-nova)
├── vite.config.ts             # tanstackRouter + react + tailwind + VitePWA + alias @
├── tsconfig.app.json          # estricto: noUnusedLocals/Parameters, paths @/*
├── CLAUDE.md                  # este archivo
├── DESIGN.md                  # guía de diseño
└── README.md                  # README del template de Vite (desactualizado)
```

**Estructura objetivo de `src/`** — crear solo lo que haga falta, sin adelantar
carpetas vacías:

```
src/
├── routes/          # árbol file-based (routeTree.gen.ts es GENERADO, no editar)
├── components/ui/   # shadcn
├── components/…     # componentes de dominio (player, plan, sesión)
├── lib/gateway/     # cliente HTTP propio: auth, sesión, errores, schemas
├── store/           # zustand, solo runtime del player
├── hooks/
└── types/           # modelo de dominio en español
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

**Variables de entorno:** este repo **no tiene `.env` ni `.env.example`
todavía**. Al cablear el backend, crear ambos con `VITE_GATEWAY_URL` como única
variable obligatoria. No agregar `VITE_SUPABASE_*` sin resolver §5.3.

---

## 5. Advertencias críticas (leer antes de editar)

1. **Esto es un scaffold, no una app.** `src/App.tsx` y `src/App.css` son la
   landing del template de Vite (contador, logos, links a Discord). Cualquier
   tarea real empieza por reemplazarlos; `src/assets/*` y `public/icons.svg` se
   van con ellos. **Esta es la única limpieza autorizada de entrada** — no hay
   más código muerto que borrar.
2. **Nada está cableado en `src/main.tsx`.** Router, Query y el tema están
   instalados/decididos pero **no montados**. Antes de asumir "el router no
   funciona": no hay `RouterProvider` ni `src/routes/` todavía. Orden de
   montaje esperado: `QueryClientProvider` → `AuthProvider` → `RouterProvider`.
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
   pantallas de gestión (rutinas, otras personas, catálogos).
6. **El modelo de dominio todavía no existe aquí.** Se define en `src/types/`
   **a partir del contrato del gateway**, no copiando tipos de otro repo. Dos
   reglas duras: ejercicios referenciados por **`ejercicio_id`**, nunca por
   nombre; y nada de `as Tipo` sobre un `fetch` (§6, C4).
7. **El backend del loop puede no estar listo.** Si no existe el endpoint que
   persiste series, esta app no tiene write path. Verificarlo en
   `../gym-gateway` antes de prometer guardado, y **avisar al usuario** si la
   tarea exige cambios en ese repo.
8. **shadcn/ui: agregar, no reescribir.** Los componentes de
   `src/components/ui/` los genera el CLI (`npx shadcn@latest add`). No
   escribirlos a mano; editarlos solo para adaptarlos a tokens de marca, y
   dejar constancia en `DESIGN.md §8`.
9. **PWA a medias:** el manifest apunta a `/pwa-192x192.png` y
   `/pwa-512x512.png`, que **no existen** en `public/`. La instalación falla
   hasta generarlos. El nombre del manifest es `GYMApp` — decidir el definitivo
   antes de publicar.
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
- **C6 — Mobile-first sin versión de escritorio.** El desktop es un teléfono
  centrado (`DESIGN.md §11`).
- **C7 — Instalable ahora, offline después.** La PWA instalable entra en el
  MVP; la sincronización offline real, no.
- **C8 — Independencia de repos.** No se importa código de `../fitpro` ni de
  otros hermanos. Lo compartido es el lenguaje visual y la forma del dominio,
  y se re-declara aquí.
- **C9 — Honestidad de guardado.** Nada se muestra como registrado hasta que el
  servidor lo confirma (`DESIGN.md §7`).
- **Pendientes de decidir:** nombre definitivo del producto/manifest; si hay
  `/register` abierto o solo invitación; Sentry/PostHog antes de producción;
  Vitest.

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

## 7. Rutas (objetivo — todavía no existen)

TanStack Router con **file-based routing**: los archivos de `src/routes/`
generan `src/routeTree.gen.ts`.

- **Pública:** `/login`. (El alta es por invitación del entrenador; **no** abrir
  `/register` sin decidirlo — §6, pendientes.)
- **Protegidas (rol `client`):**
  - `/` — hoy: la sesión que toca, racha, acceso directo a entrenar.
  - `/plan` — plan asignado, semanas y sesiones.
  - `/sesion/$sesionId` — **el player**: ejecutar y registrar series. Es la
    pantalla que justifica esta app (`DESIGN.md §9`).
  - `/historial` — sesiones ya ejecutadas.
  - `/perfil` — cuenta, tema, cerrar sesión.

Si una idea necesita una sexta ruta, revisar §1 antes de crearla.

---

## 8. Hitos

1. **Base** — limpiar el template (§5.1) y montar `main.tsx`: Query + Router +
   tema. → *pendiente*
2. **Auth** — `lib/gateway/` (fetch con token, refresh, errores) +
   `AuthProvider` + `/login` + guard de rutas protegidas. → *pendiente*
3. **Dominio** — `types/` + schemas Zod derivados del contrato del gateway. →
   *pendiente*
4. **Lectura** — `/` y `/plan` contra el gateway. → *pendiente*
5. **Escritura** — `/sesion/$sesionId`: el player que **persiste series**. Es el
   hito que hace que el producto exista. → *pendiente*
6. **Cierre** — `/historial`, `/perfil`, iconos de PWA y manifest definitivo. →
   *pendiente*

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
- [README.md](./README.md) — README del template de Vite; **no** documenta este
  producto (candidato a reescribir).
