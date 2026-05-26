# LifeOS — Arquitetura do Sistema

## Visão

LifeOS é um **workspace modular** de produtividade: páginas em blocos (estilo Notion), databases personalizáveis, tarefas, hábitos, objetivos e estudos — com UX minimalista inspirada em Notion, Linear e ClickUp.

**Não é** apenas um gestor de tarefas. É um sistema operacional pessoal focado em rapidez, fluidez e poucos cliques.

## Princípios

| Princípio | Implementação |
|-----------|----------------|
| Modularidade | Módulos `web/src/modules/*` + serviços isolados no backend |
| Blocos | Tudo editável é um `Block` tipado com `content` JSON |
| Escalabilidade | Schema relacional + JSON para propriedades flexíveis |
| Mobile futuro | Lógica em `services/` e `store/`, UI fina em `components/` |
| Performance | TanStack Query, listas virtuais (fases futuras), índices Prisma |

## Camadas

```
┌─────────────────────────────────────────────────────────┐
│  Web (React + Vite)                                     │
│  pages → layouts → modules → editor/blocks/database     │
│  services (HTTP) → store (Zustand) → TanStack Query     │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + JWT
┌──────────────────────────▼──────────────────────────────┐
│  API (Express + TypeScript)                             │
│  routes → controllers → services → Prisma               │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Neon PostgreSQL                                        │
└─────────────────────────────────────────────────────────┘
```

## Domínios principais

1. **Auth** — utilizador, JWT, sessão (concluído Fase 2)
2. **Workspace** — contentor multi-tenant por utilizador
3. **Page** — hierarquia infinita, breadcrumbs, nesting
4. **Block** — editor baseado em blocos
5. **Database** — propriedades, views, rows, filtros (engine)
6. **Produtividade** — tasks/hábitos/objetivos/estudos como templates de database
7. **Experiência** — dashboard, search global, command palette (⌘K)

## Modelo de dados (resumo)

- `User` → dono e membros de `Workspace`
- `Workspace` → `Page` (árvore) + `Database`
- `Page` → `Block` (árvore opcional para toggles)
- `Database` → `DatabaseProperty` + `DatabaseView` + `DatabaseRow`

Detalhe completo: `server/prisma/schema.prisma`.

## Contratos API (v1)

| Área | Prefixo | Auth |
|------|---------|------|
| Health | `GET /health` | — |
| Auth | `/auth/*` | parcial |
| Workspaces | `/workspaces` | JWT |
| Pages | `/workspaces/:id/pages` | JWT |
| Blocks | `/pages/:id/blocks` | JWT |

## Segurança

- JWT Bearer em rotas protegidas
- Cada operação valida membro do workspace (`OWNER` | `ADMIN` | `MEMBER`)
- Zod em todos os inputs
- Passwords com bcrypt (12 rounds)

## Preparação mobile (Expo)

- Tipos partilháveis em `types/` (futuro: pacote `@lifeos/types`)
- Sem lógica de negócio em componentes React
- API stateless — ideal para sync offline posterior

## Referências de produto

Notion (páginas/blocos), Linear (velocidade/⌘K), ClickUp (views), Todoist (tarefas rápidas).
