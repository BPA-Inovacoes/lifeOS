# LifeOS — Frontend

## Stack

- React 19 + TypeScript (strict)
- Vite 7
- Tailwind CSS 3 + tema escuro
- Componentes estilo shadcn (Radix Slot, CVA, `cn`)
- TanStack Query, Zustand, React Hook Form + Zod
- React Router 7

## Estrutura `src/`

```
components/   # UI + CommandPalette
pages/        # Dashboard, Workspace, PageEditor, Login
modules/      # auth, …
editor/       # PageEditor, breadcrumbs
blocks/       # Registry + componentes por tipo
database/     # Engine (agrupamentos, views)
hooks/
services/
store/
types/
layouts/      # AppShell (sidebar)
routes/
constants/
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Vite — `http://localhost:5173` |
| `npm run build` | Build produção |
| `npm run lint` | ESLint |

## API

- **Dev:** prefixo `/api` + proxy → `localhost:3333`
- **Prod:** `VITE_API_BASE_URL`

## Atalhos

- **⌘K / Ctrl+K** — Command palette
