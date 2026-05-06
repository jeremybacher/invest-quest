---
name: shadcn-component
description: Use this skill when adding a shadcn/ui component to the project, or when building a new feature component that needs standard primitives (Button, Card, Dialog, Form, Sheet, Toast, etc). Do NOT use for purely custom components with no shadcn dependency.
---

# Skill: Add and Use shadcn/ui Components

## Step 1 — Check if it's already installed

```bash
ls src/components/ui/
```

If the component exists, skip to Step 3.

## Step 2 — Install via CLI (never hand-write)

```bash
npx shadcn@latest add <component-name>
```

Common components you'll likely need in this project:
- Layout: `card`, `sheet`, `tabs`, `separator`, `scroll-area`
- Form: `form`, `input`, `label`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`
- Feedback: `toast` (via sonner), `alert`, `dialog`, `alert-dialog`, `skeleton`, `progress`
- Data: `table`, `badge`, `avatar`
- Nav: `dropdown-menu`, `navigation-menu`

If the CLI fails, check `components.json` exists and is valid. Don't hand-write shadcn primitives unless absolutely necessary — and document why in a top-of-file comment if you do.

## Step 3 — Use the component

1. Import from `@/components/ui/<component>`, not from a deep relative path.
2. Use shadcn tokens for styling (`bg-background`, `text-muted-foreground`, etc.) — see `.claude/rules/ui.md`.
3. For forms, always pair with `react-hook-form` + `zodResolver`:

```tsx
const form = useForm<z.infer<typeof SchemaName>>({
  resolver: zodResolver(SchemaName),
  defaultValues: { ... },
});

async function onSubmit(values: z.infer<typeof SchemaName>) {
  const result = await someServerAction(values);
  if (!result.ok) {
    toast.error(result.error);
    return;
  }
  toast.success("¡Listo!");
}
```

4. Keep Spanish copy in the JSX; keep variable names, schema names, and comments in English.

## Step 4 — Toasts

- Use `sonner` (installed via `npx shadcn@latest add sonner`).
- Import `toast` from `sonner`. Use `toast.success`, `toast.error`, `toast.info`.
- Messages in Spanish rioplatense: "¡Compra realizada!", "Error al procesar la operación".

## Step 5 — Theme

The project supports light + dark via `next-themes`. Don't hardcode colors that break in either mode. Stick to tokens.
