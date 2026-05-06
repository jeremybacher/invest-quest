# UI Rules

Applies to `src/app/`, `src/components/`, and anything rendering JSX.

## Component organization

- **Primitives:** `src/components/ui/` — managed by shadcn CLI. Don't hand-edit unless customizing (document why in a comment).
- **Features:** `src/components/features/<domain>/` — business-aware components (e.g., `features/simulator/AssetCard.tsx`).
- **Layouts:** in `src/app/(dashboard)/layout.tsx` and friends.

## Server vs client components

- **Default to server components.** Add `"use client"` only when you need: state, effects, event handlers, browser APIs, or a client-only library.
- If a tree needs partial interactivity, push the `"use client"` boundary as deep as possible (e.g., just the button, not the whole page).
- Server components can call Prisma directly. Client components call server actions, never Prisma.

## Copy

- All user-facing strings are in **Spanish rioplatense**. Use "vos", not "tú".
- Examples:
  - ✅ "Cargá tu API key para empezar"
  - ❌ "Carga tu API key para empezar" (neutral)
  - ❌ "Carga tu API key para empezar" (peninsular "tú")
- Button labels are short and action-oriented: "Comprar", "Completar", "Probar conexión".
- Empty states are friendly, not apologetic: "Todavía no invertiste — ¡elegí tu primer activo!"

## Styling

- Use shadcn design tokens: `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, etc.
- Avoid raw color classes (`bg-blue-500`) unless it's for a semantic accent (e.g., gain=green-600, loss=red-600).
- Use `cn()` from `@/lib/utils` for conditional class merging.
- Responsive: mobile-first. Min viewport 375px. Tablet breakpoint `md:`, desktop `lg:`.

## Loading and error states

- Every screen that fetches data must show a `<Skeleton />` while loading.
- Every screen must handle the error case — either an error boundary or inline `<Alert variant="destructive">`.
- Every list must have an empty state with a clear call-to-action.

## Accessibility

- All interactive elements are keyboard-reachable and have visible focus rings (shadcn defaults handle this — don't override `outline-none` without replacing it).
- Icons used as the only content of a button need `aria-label` or `sr-only` text.
- Color is never the only signal (pair gain-green with ▲, loss-red with ▼).

## Forms

- Always `react-hook-form` + `zodResolver(SchemaName)`.
- Submit handler calls a server action and handles the `{ok, data|error}` return shape.
- Use `<FormField>` / `<FormMessage>` from shadcn for consistent error display.

## Charts

- `recharts` only. Import dynamically (`dynamic(() => import('...'), { ssr: false })`) to keep server bundle small.
- Currency formatting uses `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })` for consistency.
