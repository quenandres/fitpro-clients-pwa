# DESIGN.md — Guía de diseño (PWA de clientes)

> Fuente de verdad para **crear y modificar pantallas** en esta app. El
> asistente debe leerlo **antes** de tocar UI en `src/`. Para el contexto
> operativo del repo, ver [CLAUDE.md](./CLAUDE.md).
>
> El **lenguaje visual** (marca verde, tono, español, mobile-first) se comparte
> con el cockpit de entrenadores; la **implementación no**. Aquel repo usa
> clases propias y otra tipografía. Aquí el sistema es **shadcn/ui (`base-nova`)
> sobre Base UI, con Geist**, y este archivo lo declara completo. No importar
> clases, componentes ni recetas desde otros repos.
>
> Última revisión: 2026-09-14

---

## 1. Principios

La persona abre esta app **en el gimnasio, de pie, con una mano, sudando**. No
viene a explorar: viene a saber qué le toca hoy y a registrar lo que hizo. Cada
decisión de diseño se juzga contra eso.

Un producto fitness **mobile-first** con un único voltaje de marca: el verde.
Ese verde carga cada acción primaria — empezar sesión, completar serie,
guardar — y nada más. El resto es superficie neutra y aire.

| Principio | Qué implica |
|-----------|-------------|
| **Una mano, de pie** | Acciones primarias en la mitad inferior (thumb zone). Nada crítico en la esquina superior. |
| **Un voltaje** | `--primary` (verde) es el único color de acción primaria. Lo demás es neutro o semántico (éxito/error). |
| **Touch generoso** | Objetivo táctil ≥ 44px; en el player, ≥ 56px. Un dedo sudado no acierta un chip de 28px. |
| **Números grandes** | Peso, reps y series se leen a un metro. Son el contenido, no la decoración. |
| **Tokens primero** | Colores vía utilidades mapeadas a tokens. Nunca hex crudo en componentes. |
| **shadcn antes que CSS custom** | Agregar el componente con el CLI y componerlo. Inventar una variante es el último recurso. |
| **Pocas pantallas** | Rutas acotadas (`CLAUDE.md §7`), seis en la nav (C13). Si una idea necesita más, probablemente no es de esta app. |
| **Español en la UI** | Etiquetas, vacíos, errores y toasts en español. Tono directo, motivador, sin marketing vacío. |
| **Accesibilidad mínima** | Foco visible, `aria-label` en botones de solo icono, `role` en vacío/error, `prefers-reduced-motion`. |
| **Honestidad de estado** | Si una serie no se sincronizó, se dice. Nunca fingir guardado. |

Vocabulario de dominio: **plan, semana, sesión, entrenamiento, ejercicio,
serie, repeticiones, peso, RPE, descanso**. No "workout", "set", "listing".

---

## 2. Identidad visual

### Marca

Un producto, un voltaje. El verde se expresa a través del token **`--primary`**
de shadcn; no existe una variable `--brand` paralela.

| Rol | Valor de referencia |
|-----|---------------------|
| Verde marca (light) | `#1a7f37` |
| Verde marca (dark) | `#22c55e` |
| Sobre marca | `#ffffff` |

> **Estado hoy (2026-09-09):** marca verde aplicada en `--primary` (`:root` y
> `.dark`) en `src/index.css`.

- **No** crear un token `--brand`: aquí la marca *es* `--primary`.
- **No** verdes neón arbitrarios ni una segunda paleta.
- **Sin acentos por área.** Cinco pantallas no necesitan wayfinding por color.

### Tipografía

Una sola familia: **Geist Variable** (`--font-sans`, aplicada a `html`;
`--font-heading` hoy apunta a la misma). Geist es variable: la jerarquía se
hace con **peso y tamaño**, no con una segunda tipografía. Si algún día se
separa `--font-heading`, se cambia el token en `index.css` — nunca importando
una fuente suelta en un componente.

Escala en §4.

### Iconos

- Librería: **`lucide-react`** exclusivamente (declarado en `components.json`).
- Tamaños: 16–18px en listas, 20px en nav, 24px en acciones del player,
  28–32px en estados vacíos.
- Icono solo → `aria-label` obligatorio.

---

## 3. Tokens — Color

**Archivo canónico:** [`src/index.css`](src/index.css) — `@theme inline`,
`:root`, `.dark`, `@layer base`.

El sistema es el de shadcn: pares `--x` / `--x-foreground` en oklch, mapeados a
utilidades Tailwind por el bloque `@theme inline`. Se usan **las utilidades**,
no las variables a mano.

### Roles disponibles

| Token | Utilidad | Rol |
|-------|----------|-----|
| `--background` / `--foreground` | `bg-background` / `text-foreground` | Canvas y texto principal |
| `--card` / `--card-foreground` | `bg-card` | Superficie de card |
| `--popover` / `--popover-foreground` | `bg-popover` | Sheets, menús, diálogos |
| `--primary` / `--primary-foreground` | `bg-primary` / `text-primary-foreground` | **Acción primaria = verde de marca** |
| `--secondary` / `--secondary-foreground` | `bg-secondary` | Acción secundaria, chips |
| `--muted` / `--muted-foreground` | `bg-muted` / `text-muted-foreground` | Fondos sutiles, texto de apoyo |
| `--accent` / `--accent-foreground` | `bg-accent` | Hover, item seleccionado |
| `--destructive` | `bg-destructive` / `text-destructive` | Eliminar, error |
| `--border` / `--input` / `--ring` | `border-border` / `ring-ring` | Bordes, campos, anillo de foco |
| `--chart-1…5` | `bg-chart-1` / `text-chart-1` | Gráficas: `--chart-1` es el verde de marca; el resto, escala neutra (§12) |
| `--sidebar-*` | — | **Sin uso**: esta app no tiene sidebar. Ignorar. |

### Modo oscuro

- Variante declarada como `@custom-variant dark (&:is(.dark *))`: el modo
  oscuro se activa con la clase **`.dark`** en `document.documentElement`.
- **`ThemeProvider`** en `src/providers/theme-provider.tsx`: persiste preferencia
  (claro / oscuro / sistema) y aplica `.dark` en `documentElement`.
- **Oscuro es el modo esperado en el gimnasio** (luz baja, pantalla cerca de la
  cara). Toda pantalla nueva se prueba primero en `.dark`.

### Marca aplicada (2026-09-09)

Valores en `src/index.css`:

```css
:root {
  --primary: oklch(0.505 0.132 150);   /* ≈ #1a7f37 */
  --primary-foreground: oklch(1 0 0);
}
.dark {
  --primary: oklch(0.723 0.192 149.6); /* ≈ #22c55e */
  --primary-foreground: oklch(0.145 0 0);
}
```

### Reglas

- **Nunca** hex crudo en componentes (`#22c55e`, `bg-[#161b22]`). Si falta un
  rol, se agrega un token en `index.css`, no un literal.
- **Nunca** `text-muted-foreground` para contenido esencial: es apoyo, no cuerpo.
- Semántica de sesión (completado / pendiente / fallado): `--primary`,
  `--muted-foreground` y `--destructive`. No inventar un amarillo suelto sin
  agregarlo como token.

---

## 4. Tokens — Tipografía

**Familia:** `'Geist Variable', sans-serif` — `--font-sans`, aplicada a `html`
en `@layer base`.

| Rol | Size | Peso | Uso |
|-----|------|------|-----|
| metric-xl | 40–48px | 700 | Peso/reps en el player, cronómetro |
| display | 26–28px | 700 | Título de pantalla (uno por vista) |
| title-lg | 20px | 600 | Título de sección / sheet |
| title-md | 16px | 600 | Título de card, nombre de ejercicio |
| body | 15px | 400 | Cuerpo por defecto — se lee a un brazo de distancia |
| body-sm | 13px | 400 | Meta, descripciones secundarias |
| caption | 12px | 500 | Timestamps, unidades (`kg`, `reps`) |
| label | 12px | 600 | Labels de formulario |
| button | 15px | 600 | Texto de botón |
| badge | 11px | 600 | Badges |

- Números de sesión (peso, reps, series, tiempo) en **`tabular-nums`** — no
  deben bailar al incrementar.
- Máximo **un** `display` por pantalla.
- No inventar tamaños intermedios (`text-[17px]`); usar la escala.

---

## 5. Tokens — Espaciado y forma

**Densidad: cómoda, no compacta.** Aquí lo que importa es **acertar el toque**,
no ver mucho de una vez.

| Nombre | Valor | Uso |
|--------|-------|-----|
| xs | 4px | Gap icono–label |
| sm | 8px | Stacks cortos, gap interno de chip |
| md | 12px | Gap entre elementos de un grupo |
| base | 16px | Padding horizontal de pantalla, gap de formulario |
| lg | 24px | Padding de card/sheet, gap de sección |
| xl | 32px | Separación de bloques mayores |

### Ritmo de layout

| Medida | Valor |
|--------|-------|
| Padding horizontal de pantalla | 16px (`px-4`) |
| Padding de card | 16px |
| Gap entre cards de una lista | 12px |
| Gap de sección | 24px |
| Ancho máximo de contenido | `max-w-6xl` centrado en `md+` (§11); formularios auth `max-w-md` |
| Espacio inferior reservado | altura de la bottom nav + `env(safe-area-inset-bottom)` |

### Radios

El radio es **derivado**: `--radius: 0.625rem` (10px) y `@theme inline` calcula
`--radius-sm/md/lg/xl/2xl/3xl/4xl`. Usar `rounded-sm|md|lg|xl|…`, **no**
valores arbitrarios (`rounded-[14px]`).

| Utilidad | ≈ | Dónde |
|----------|---|-------|
| `rounded-md` | 8px | Chips, inputs densos |
| `rounded-lg` | 10px | Botones, inputs |
| `rounded-xl` | 14px | Cards |
| `rounded-2xl` | 18px | Sheets, contenedores destacados |
| `rounded-full` | — | Avatares, FAB, badges, botón de descanso |

Sin `rounded-none` en controles.

### Safe areas

Es una PWA instalable en modo `standalone`: **no hay barra del navegador que
salve el fondo**. Toda barra fija respeta `env(safe-area-inset-bottom)` y
`env(safe-area-inset-top)`.

---

## 6. Layout y shell

**Implementado:** `src/components/AppShell.tsx`

```
<AppShell>
├── header (md+): top nav horizontal — 6 items
├── <main>  px-4, max-w-6xl mx-auto, padding inferior = nav + safe area
└── bottom nav (< md): 6 items + safe area — oculta en player y auth
```

### Nav — 6 items (2026-09-15, C13)

| Item | Ruta | Icono (lucide) | Label móvil |
|------|------|----------------|-------------|
| Hoy | `/` | `Home` | Hoy |
| Plan | `/plan` | `CalendarDays` | Plan |
| Historial | `/historial` | `History` | Hist. |
| Progreso | `/progreso` | `Images` | Fotos |
| Comunidades | `/comunidades` | `Users` | Grupos |
| Perfil | `/perfil` | `User` | Perfil |

- `< md`: bottom nav fija. `md+`: barra superior horizontal (mismos 6 items).
- Activo = `text-primary` + `bg-primary/10`. Inactivo = `text-muted-foreground`.
- Objetivo táctil ≥ 48px por item.
- **Oculta en:** `/login`, `/register`, `/sesion/$sesionId` (solo el player;
  `/sesion/$sesionId/detalle` sí muestra nav).

### Z-index

| Capa | z-index |
|------|---------|
| Barra de acción del player | 40 |
| Bottom nav | 50 |
| Sheet / Dialog | 60 |
| Toast | 100 |

---

## 7. Anatomía de una pantalla

Se llega a **ejecutar**, no a explorar:

```
AppShell
├── Título de pantalla (un display) + línea de contexto (body-sm, muted)
├── Acción principal si la hay (ancho completo, --primary)
├── Contenido (lista de cards / vacío / error / skeleton)
└── [nav inferior]
```

### Motion

- 0.15–0.2s en cambios de estado (hover, foco, `:active` `scale(.97)`).
- El player puede usar transiciones de serie a serie algo más expresivas
  (~0.25s), porque marcan progreso real.
- **No** coreografiar la entrada de la pantalla como una landing.
- Respetar `prefers-reduced-motion` siempre.

### Estados de control

Todo control interactivo define: **default, hover, `:focus-visible`, active,
disabled, loading**. El anillo de foco (`ring-ring`) no se elimina. El primario
en loading se deshabilita para evitar doble envío: **registrar una serie dos
veces corrompe el log**.

### Persistencia y honestidad

Esta app es el **write path real** del producto:

- Una serie se muestra como confirmada **solo cuando el servidor la confirmó**.
  El estado intermedio es explícito ("guardando…").
- Si falla la red, decirlo y ofrecer reintentar. Nunca descartar en silencio lo
  que la persona ya levantó.
- Mientras el endpoint de persistencia no exista (`CLAUDE.md §5.7`), cualquier
  pantalla de sesión es **prototipo**: marcarla y no prometer guardado.

### Destructivo vs primario

Acción primaria = `--primary`, ancho completo, abajo. **Descartar sesión,
borrar serie, salir sin guardar** = `variant="ghost"` con `text-destructive`, y
confirmación con diálogo si no hay deshacer.

### Estados vacíos

| Vacío | Copy |
|-------|------|
| Sin plan asignado | «Tu entrenador aún no te asignó un plan.» — sin CTA de creación |
| Día sin sesión | «Hoy toca descanso.» — tono positivo, no un error |
| Historial vacío | «Todavía no registraste ninguna sesión.» + CTA a la sesión de hoy si existe |
| Sin conexión | «Sin conexión. Lo que registres se envía cuando vuelvas.» — **solo si eso es cierto** |

Nunca ofrecer un CTA que la persona no puede ejecutar desde esta app.

---

## 8. Componentes — recetas

**Regla base:** el componente se agrega con el CLI
(`npx shadcn@latest add <nombre>`) y se compone. No se escribe a mano ni se
copia de otro repo.

### Disponibles hoy

| Componente | Archivo |
|------------|---------|
| `Avatar` | [src/components/ui/avatar.tsx](src/components/ui/avatar.tsx) |
| `Badge` | [src/components/ui/badge.tsx](src/components/ui/badge.tsx) |
| `Button` | [src/components/ui/button.tsx](src/components/ui/button.tsx) |
| `Card` | [src/components/ui/card.tsx](src/components/ui/card.tsx) |
| `Input` | [src/components/ui/input.tsx](src/components/ui/input.tsx) |
| `Label` | [src/components/ui/label.tsx](src/components/ui/label.tsx) |
| `Sheet` | [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) |
| `Dialog` | [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx) |
| `Progress` | [src/components/ui/progress.tsx](src/components/ui/progress.tsx) |
| `Skeleton` | [src/components/ui/skeleton.tsx](src/components/ui/skeleton.tsx) |
| `Separator` | [src/components/ui/separator.tsx](src/components/ui/separator.tsx) |
| `Switch` | [src/components/ui/switch.tsx](src/components/ui/switch.tsx) |
| `Sonner` | [src/components/ui/sonner.tsx](src/components/ui/sonner.tsx) |

### Probablemente necesarios después

`form`, `drawer`, `tabs`, `select`.

### Botones

| Uso | Receta |
|-----|--------|
| Acción primaria | `<Button size="lg" className="w-full">` — `--primary` |
| Secundaria | `<Button variant="secondary">` |
| Terciaria / cancelar | `<Button variant="ghost">` |
| Destructiva | `<Button variant="ghost" className="text-destructive">` + confirmación |
| Solo icono | `<Button variant="ghost" size="icon" aria-label="…">` |

- Altura mínima **44px**; en el player, **56px**.
- Nunca dos primarios compitiendo en una pantalla.
- El CTA de un sheet va **fijo abajo**, ancho completo.

### Formularios

1. `Input` + `Label` de shadcn; no recrear campos con `div` + `bg-muted`.
2. Alto ≥ 44px, `text-base` (16px) en inputs — **iOS hace zoom en campos
   < 16px**.
3. Peso y reps: `inputMode="decimal"` / `inputMode="numeric"`. No es un detalle:
   es la interacción central de la app.
4. Error bajo el campo, `text-destructive`; decir qué corregir.
5. CTA con verbo activo: «Guardar serie», «Terminar sesión», «Entrar».

### Overlays

- **Móvil:** `Drawer` (bottom sheet) para acciones contextuales; `Dialog` solo
  para confirmaciones cortas.
- El contenido scrollea dentro del overlay; el CTA queda fijo abajo.
- Cierre por gesto siempre disponible, más un control explícito (`X` o
  «Cancelar»).

### Estados de página

| Estado | Cómo |
|--------|------|
| Carga | `Skeleton` con la forma real del contenido, no un spinner centrado |
| Vacío | Icono 28–32px + título + copy + (CTA si se puede actuar) |
| Error | Qué pasó + botón «Reintentar» |
| Offline | Banner persistente, no un toast que se va |

---

## 9. El player (`/sesion/$sesionId`) — pantalla crítica

Es la razón de existir de esta app. Reglas propias:

| Regla | Detalle |
|-------|---------|
| Inmersiva | Sin bottom nav. Salida explícita arriba a la izquierda, con confirmación si hay progreso sin guardar. |
| Un ejercicio a la vez | El foco es el ejercicio actual; el resto, colapsado o en un paso siguiente. |
| Demo del movimiento | Foto/ilustración de cómo se hace, nombre, descripción y 3 pasos. |
| Registro en la thumb zone | Campos de peso/reps y «Completar serie» en la mitad inferior. |
| Números grandes | `metric-xl`, `tabular-nums`. Se leen desde el suelo. |
| Progreso siempre visible | Serie X de Y, ejercicio N de M. Chips + anillo de descanso. |
| Descanso | Cronómetro circular, pausar/reanudar, saltar y +30 s. Botones ≥ 56px. |
| Prefill inteligente | Prellenar con lo prescrito o con la última sesión. Editar cuesta un toque. |
| Sin pérdida | Cualquier salida con series sin enviar pide confirmación. |
| Pantalla activa | Considerar Wake Lock durante la sesión (evaluar antes de implementar; requiere HTTPS). |

Anti-patrones del player: modales encima de modales; scroll horizontal para ver
series; un tap para abrir un menú y otro para completar una serie; animaciones
que retrasan el siguiente registro.

---

## 10. Copy y microcopy

- **Idioma:** español.
- **Tono:** directo y motivador, nunca condescendiente ni gamificado en exceso.
  La persona está cansada, no quiere confeti.
- **Segunda persona:** «Tu plan», «Hoy te toca», «Registraste 12 sesiones».
- **Botones:** verbo + objeto («Empezar sesión», «Completar serie», «Terminar
  entrenamiento»).
- **Errores:** qué pasó + qué hacer. Nunca culpar a la persona.
- **Toasts:** mismo verbo que el botón que los disparó.
- **No** usar vocabulario de gestión («asignar», «prescribir», «cliente») al
  hablarle a la persona: aquí es «tu entrenador», «tu plan», «tu sesión».

---

## 11. Responsive

Mobile-first; **100% responsive** en tablet y escritorio (`CLAUDE.md` C6, 2026-09-09).

| Breakpoint | Comportamiento |
|------------|----------------|
| `< md` | Una columna, bottom nav, overlays en sheet, CTAs full-width, player apilado. |
| `md+` | Top nav de 6 items. Contenido `max-w-6xl`. Dos columnas donde aporte (Hoy, Plan, Historial, Player, Progreso, Comunidades, Perfil). |
| `lg+` | Mismo layout `md+` con más aire; no un tercer breakpoint de producto. |

No hay sidebar de gestión ni layout de cockpit de entrenadores. Probar cada
pantalla en **375px y ~1280px**, en `.dark`.

---

## 12. Gráficas de progreso

`/` (Hoy) muestra un panel de progreso de prototipo (2026-09-14): volumen en
barras, carga media en línea, racha, meta y resumen. Los datos viven en
`lib/mock/datos.ts` hasta que exista el gateway.

- Usar `--chart-1…5` de `index.css`. **`--chart-1` es el verde de marca**;
  `--chart-2…5` son neutros para ejes y fondos.
- Una métrica por gráfica. Vocabulario de entrenamiento: volumen (kg), carga
  media, racha, meta semanal. No calorías ni macros.
- Etiquetar ejes con unidades (`kg`, `reps`, día/semana).
- Toda gráfica necesita su estado vacío y el de "aún no hay suficientes datos".
- SVG/CSS con tokens. No hex. Respetar `prefers-reduced-motion`.

---

## 13. Do / Don't

### Do

- `--primary` (verde) para **toda** acción primaria, y nada más.
- Componentes de shadcn agregados con el CLI y compuestos.
- Utilidades mapeadas a tokens (`bg-card`, `text-muted-foreground`).
- Escala de §4; un `display` por pantalla; `tabular-nums` en métricas.
- Radios derivados de `--radius` (`rounded-lg`, `rounded-xl`).
- Probar en **`.dark`** y a 375px antes de dar por hecho.
- Respetar safe areas en toda barra fija.
- Decir la verdad sobre el estado de guardado.

### Don't

- No importar clases, componentes ni recetas de otros repos, aunque sean del
  mismo dominio: otro stack, otro sistema.
- No crear un token `--brand` paralelo a `--primary`.
- No hex crudo ni `bg-[#…]` en componentes.
- No `text-muted-foreground` como cuerpo esencial.
- No objetivos táctiles < 44px (< 56px en el player).
- No inputs con `font-size` < 16px (zoom de iOS).
- No pantallas de gestión (crear rutinas, administrar personas, pagos).
- No `useMemo`/`useCallback` decorativos: el React Compiler está activo.
- No editar `src/routeTree.gen.ts` — es generado.
- No prometer guardado mientras el endpoint no exista.

---

## 14. Checklist — nueva pantalla

- [ ] Cabe en las rutas de `CLAUDE.md §7`; si no, revisar el alcance.
- [ ] `max-w-6xl` en `md+`, `px-4`, padding inferior por nav + safe area.
- [ ] Tokens/utilidades de shadcn — sin hex, sin `rounded-[…]`.
- [ ] Tipografía según §4; un `display`; métricas en `tabular-nums`.
- [ ] Acción primaria única, `--primary`, ancho completo, en la thumb zone.
- [ ] Destructivo ≠ primario, y con confirmación.
- [ ] Objetivos táctiles ≥ 44px (≥ 56px en el player).
- [ ] Inputs numéricos con `inputMode` y ≥ 16px.
- [ ] Estados: carga (skeleton), vacío, error, offline.
- [ ] `:focus-visible` intacto; `aria-label` en botones de solo icono.
- [ ] Probada en `.dark` y a 375px de ancho.
- [ ] Copy en español, segunda persona, sin prometer persistencia inexistente.

---

## 15. Anti-patrones

| No hacer | Por qué |
|----------|---------|
| Copiar clases o componentes de otro repo del dominio | Ese sistema no existe aquí; se rompe al primer token ausente |
| Escribir a mano un componente que shadcn tiene | Diverge del CLI y de los tokens |
| Densidad de panel de gestión en el player | Se toca con el pulgar, no con un mouse |
| Acción primaria arriba a la derecha | Inalcanzable con una mano |
| Spinner centrado en vez de skeleton | No comunica qué va a aparecer |
| Toast para el estado offline | Desaparece justo cuando importa |
| Confeti / gamificación pesada | Estorba entre serie y serie |
| Sidebar de gestión o cockpit de entrenadores | Esta app es para quien entrena, no para prescribir |
| Dar por guardado lo que no confirmó el servidor | Corrompe el log, que es el producto |

---

## 16. Referencias vivas

| Tipo | Archivo |
|------|---------|
| Tokens y base | [src/index.css](src/index.css) |
| Componentes UI | [src/components/ui/](src/components/ui/) |
| Config de shadcn | [components.json](components.json) |
| Hoy (progreso) | [src/routes/_authenticated/index.tsx](src/routes/_authenticated/index.tsx) |
| Detalle de sesión | [src/routes/_authenticated/sesion.$sesionId.detalle.tsx](src/routes/_authenticated/sesion.$sesionId.detalle.tsx) |
| Shell / nav | [src/components/AppShell.tsx](src/components/AppShell.tsx) |
| Player | [src/routes/_authenticated/sesion.$sesionId.tsx](src/routes/_authenticated/sesion.$sesionId.tsx) |
| Auth (login/register) | [src/routes/login.tsx](src/routes/login.tsx), [register.tsx](src/routes/register.tsx) |
| Formulario en sheet | [src/routes/_authenticated/progreso.tsx](src/routes/_authenticated/progreso.tsx) |

---

## 17. Mantenimiento

- Token nuevo o cambio de valor → `src/index.css` **y** las tablas de §3–§5.
- Componente de shadcn agregado → listarlo en §8.
- Primera pantalla de un patrón nuevo → registrarla en §16 como referencia.
- Decisión visual global (aplicar la marca a `--primary`, separar
  `--font-heading`, cambiar la nav) → anotarla en `CLAUDE.md §6` con fecha.
- **Código canónico: [`src/index.css`](src/index.css).** Si esta guía y el CSS
  divergen, **gana el CSS** y hay que actualizar este archivo — no al revés,
  salvo una decisión explícita de evolucionar el token.
