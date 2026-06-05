# LifeOS

Workspace modular de produtividade — inspirado em Notion, Linear e ClickUp.

| Pasta | Stack |
|-------|--------|
| `web/` | React 19, TypeScript, Vite, Tailwind, shadcn/ui, Zustand, TanStack Query |
| `server/` | Express, Prisma, Neon PostgreSQL, JWT, Zod |

Documentação: [`docs/ESTADO-ATUAL.md`](docs/ESTADO-ATUAL.md) (inventário) · [`docs/MANUAL-UTILIZADOR.md`](docs/MANUAL-UTILIZADOR.md) · [`docs/GAME-MODE.md`](docs/GAME-MODE.md) · [`docs/REFINEMENT-PLAN.md`](docs/REFINEMENT-PLAN.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/ROADMAP.md`](docs/ROADMAP.md) · [`docs/DEPLOY.md`](docs/DEPLOY.md)

## Requisitos

- Node.js 20+
- Conta [Neon](https://neon.tech) (PostgreSQL)

## API

```bash
cd server
cp .env.example .env   # DATABASE_URL, JWT_SECRET, …
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

API: `http://localhost:3333` · `GET /health`

## Web

```bash
cd web
npm install
npm run dev
npm run test   # testes unitários (filterRows, apiMessages)
```

App: `http://localhost:5173` · proxy `/api` → API local (ver `web/vite.config.ts`)

## Acesso de desenvolvimento

| Campo | Valor |
|-------|--------|
| Email | `xavier@bpa.com` |
| Senha | `xavier123` |

O seed cria o utilizador e o workspace **Pessoal** com página **Início** e database **Tarefas**.

## Manual de utilizador

Guia completo em português: [`docs/MANUAL-UTILIZADOR.md`](docs/MANUAL-UTILIZADOR.md). **Na app (com sessão iniciada):** barra lateral **Manual** ou **⌘K** → «Manual de utilizador» → `/ajuda`.

## Atalhos

- **⌘K / Ctrl+K** — Command palette
- **?** — Lista de atalhos

## Qualidade

```bash
cd web
npm run lint
npm run test          # unitários
npm run test:e2e      # Playwright (API + web via playwright.config)
```

CI: `.github/workflows/ci.yml` (lint, build, test, E2E com PostgreSQL).

Documentação técnica: [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) · [`docs/A11Y.md`](docs/A11Y.md)
