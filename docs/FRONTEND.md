# LifeOS — Estratégia frontend

## Stack (fixa)

React 19, TypeScript, Vite, Tailwind, shadcn/ui, Zustand, TanStack Query, React Hook Form, Zod, React Router 7.

## Estrutura `web/src/`

```
src/
├── components/     # UI genérica (shadcn)
├── pages/          # Rotas de alto nível
├── modules/        # Domínios (auth, workspace, dashboard)
├── editor/         # PageEditor, slash, DnD (fases)
├── blocks/         # Registry + componentes por tipo
├── database/       # Engine UI (views, properties)
├── hooks/
├── services/       # Chamadas HTTP (sem JSX)
├── store/          # Zustand (sessão, workspace ativo, UI)
├── utils/
├── types/
├── layouts/        # AppShell, AuthLayout
├── routes/
└── constants/
```

## Fluxo de dados

1. **Server state** → TanStack Query (`useQuery` / `useMutation`)
2. **Client state** → Zustand (`authStore`, `workspaceStore`, `uiStore`)
3. **Formulários** → RHF + Zod schemas em `utils/schemas/`

## Rotas (v1)

| Rota | Página |
|------|--------|
| `/login` | Login |
| `/` | Redirect → dashboard |
| `/dashboard` | Resumo + workspaces |
| `/w/:workspaceId` | Home do workspace |
| `/w/:workspaceId/p/:pageId` | Editor de página |

## UI/UX

- Tema escuro por defeito
- Sidebar esquerda (páginas + workspaces)
- Command palette global (`⌘K` / `Ctrl+K`)
- Mobile-first: sidebar colapsável (fase seguinte)

## Editor (blocos)

- `blocks/registry.ts` mapeia `BlockType` → componente
- `editor/PageEditor.tsx` orquestra lista de blocos
- Conteúdo tipado em `types/block.ts`
- Persistência: debounce + `PATCH` por bloco (fase 3+)

## Case (assistente)

Módulo em `web/src/modules/case/` + `web/src/services/caseApi.ts`.

| Peça | Descrição |
|------|-----------|
| `CaseAssistant` | FAB + painel — montado em `AppShell`, `GameShell`, `FinanceShell` |
| `CasePanel` | Chat, streaming SSE, cartões de proposta |
| `CaseInsightsWidget` | Widget no Painel Agora (`DashboardPage`) |
| `caseStore` | Estado UI: aberto, conversa, prompt pendente (insights) |

Spec: [`CASE.md`](CASE.md)

## Android (futuro)

Reutilizar: `services/`, `types/`, `store/`, schemas Zod. Substituir apenas camada de navegação e componentes nativos.
