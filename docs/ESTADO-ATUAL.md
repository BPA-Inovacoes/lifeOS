# LifeOS — O que temos até aqui

**Versão:** 2026-05-30  
**Objetivo:** inventário único do estado actual do produto, código e deploy.

Documentos relacionados:

| Documento | Conteúdo |
|----------|----------|
| [ROADMAP.md](./ROADMAP.md) | Visão de fases e backlog |
| [MODULOS-FUTUROS.md](./MODULOS-FUTUROS.md) | Financeiro · Enterprise · Case (visão C3+) |
| [CASE.md](./CASE.md) | Case — assistente C1 + C1+ + C2 |
| [FINANCEIRO.md](./FINANCEIRO.md) | Módulo Financeiro — desenho (educação + métodos) |
| [MANUAL-FINANCEIRO.md](./MANUAL-FINANCEIRO.md) | Manual do utilizador — Modo Finanças |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura técnica |
| [LIFEOS-RPG.md](./LIFEOS-RPG.md) | Spec RPG v1 + roadmap técnico |
| [GAME-MODE.md](./GAME-MODE.md) | Game Mode em detalhe |
| [MANUAL-GAME-MODE.md](./MANUAL-GAME-MODE.md) | Manual in-app Game Mode v1.1 |
| [DEPLOY.md](./DEPLOY.md) | Vercel + Railway passo a passo |
| [REFINEMENT-PLAN.md](./REFINEMENT-PLAN.md) | Refinamento do core (concluído) |
| [FRONTEND.md](./FRONTEND.md) | Frontend |
| [BACKEND.md](./BACKEND.md) | Backend |

---

## Resumo executivo

O LifeOS é um **sistema operacional pessoal** de produtividade: workspaces, páginas em blocos, bases de dados (tarefas, hábitos, objectivos, estudos), dashboard “Agora”, pesquisa global, command palette e uma **camada opcional de Game Mode** (XP, níveis, fases, conquistas, missões, prestige).

Estado geral:

| Área | Estado |
|------|--------|
| Core LifeOS (auth, workspaces, editor, databases, dashboard) | ✅ MVP + refinamento concluído |
| Game Mode Premium + RPG v1.1 (Fase C + D) | ✅ Loja, toasts Focus, identidade Game |
| Modo Finanças (F1.0–F1.3) | ✅ Contas, movimentos, métodos, revisão, envelopes, metas, export Excel, dívidas, PDF, CLIENTS↔Finanças, paga-te primeiro, Game |
| Case C1 + C1+ + C2 | ✅ Chat, 5 acções com confirmação, insights Agora, streaming SSE, LLM tools |
| Deploy produção (Vercel + API) | 🔄 Configurado no repo; requer envs correctas no painel |
| Mobile / realtime | ❌ Fora de scope |

---

## Estrutura do repositório

```
task/
├── web/                 # Frontend React 19 + Vite + Tailwind
├── server/              # API Express + Prisma + PostgreSQL
├── api/                   # Proxy serverless Vercel (raiz) → API externa
├── docs/                  # Documentação
├── vercel.json            # Build/deploy quando root = repo
├── .gitignore             # Ignora .github/ e .vscode/
└── .github/workflows/     # CI (ignorado localmente se no .gitignore)
```

Não existe `package.json` na raiz: **web** e **server** são pacotes independentes.

---

## Core LifeOS — entregue

### Autenticação e utilizador

- Registo, login, JWT, sessão em Zustand
- Recuperação de password (forgot / reset)
- Perfil (`/users/me`)
- Papéis em workspace: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`

### Workspaces e páginas

- CRUD de workspaces
- Páginas em árvore, breadcrumbs, ícones
- Editor de blocos: parágrafo, títulos, checklist, todo, quote, callout, código, imagem, divider, embeds de database
- Slash commands no editor
- Drag-and-drop de blocos (onde aplicável)

### Database engine

Templates: **TASKS**, **HABITS**, **GOALS**, **STUDIES**, **CLIENTS**, **NOTES**, **PROJECTS**, **CUSTOM**

Views:

- Tabela (multi-sort, reorder colunas, resize, virtualização)
- Kanban
- Calendário
- Lista (hábitos com heatmap e stats)

Funcionalidades:

- Filtros AND/OR, persistência em `localStorage`
- Relações entre bases (ex.: tarefa → projecto, objectivo, estudo)
- Validação de relações no servidor
- Pontos por tarefa/hábito (`PointsEvent`)

### Produtividade

- Dashboard **Agora** (`/dashboard`): foco do dia, métricas, preview de tarefas/hábitos
- Inbox rápida de tarefas
- XP semanal no dashboard (ledger de produtividade)
- Seed opcional com demo (`SEED_DEMO`)

### Experiência

- Command palette (⌘K): navegação, criar página/tarefa/hábito, pesquisa
- Pesquisa global
- Manual in-app (`/ajuda`)
- Toasts, modais, empty states, loading branded (`LifeOSLoading`)
- Error boundaries
- Atalhos de teclado documentados

### Qualidade

- Erros da API em português
- Logs estruturados (pino + request id)
- Testes unitários no `web` (filtros, sort, hábitos, gamificação, etc.)
- Smoke E2E Playwright (login, paleta, 3 modos em `/mode`, game, RPG Fase C + D loja)
- CI GitHub Actions (workflow no repo; pasta `.github/` pode estar no `.gitignore` local)

---

## Game Mode Premium — entregue (RPG v1.1)

Camada **opcional** com escolha de interface após login (`/mode` → Focus, Game ou Modo Finanças).

### Backend (`server/gamification/`)

| Módulo | Função |
|--------|--------|
| `levels.ts` | Progressão 1–100, Rank E–SSS |
| `phases.ts` | 7 fases (Awakening → God Mode) |
| `attributes.ts` | 7 atributos de vida + tiers F→SSS |
| `classes.ts` | Classes derivadas dos atributos |
| `missions.ts` | Missões diárias, semanais e mensais |
| `challenges.ts` | Dungeons/Bosses derivados de GOALS |
| `habit-areas.ts` / `goal-areas.ts` | Deltas por área RPG |
| `life-coins.ts` | LifeCoins por actividade |
| `shop-catalog.ts` | Catálogo seed da loja (~13 itens) |
| `feedback.ts` | Payload de gamificação para toasts Focus |
| `achievements.ts` | Catálogo de conquistas |
| `prestige.ts` | Ascensão após nível 100 |
| `events.ts` | Mapeamento para `ActivityEvent` |
| `engine.ts` | XP, streak, missões, achievements, prestige, LifeCoins |

| Serviço | Função |
|---------|--------|
| `shop.service.ts` | `GET /game/shop`, compra, equipar títulos/avatars |

### Modelo de dados (Prisma)

- `UserGameProfile` — `lifeCoins`, `lifetimeCoins`, **`displayTitle`**
- `ShopItemDefinition`, `UserShopItem` — loja LifeCoins
- `UserAttribute`, `AchievementDefinition`, `UserAchievement`
- `ActivityEvent`, `GameActivityLog`, `DailyMissionProgress` + `MissionPeriod`
- `PrestigeReset`
- `PointsEvent`: `TASK`, `HABIT`, `GOAL`, `STUDY`, **`CLIENT`**
- `DatabaseTemplate.CLIENTS`

Migrações: `20250521160000_game_mode`, `20260525064000_game_mode_evolution`, `20260530120000_rpg_v1_missions`, `20260530140000_rpg_phase_c`, **`20260530160000_rpg_shop`**

### Frontend (`web/src/modules/game/`)

Rotas `/game/*`: Perfil, Missões, Dungeons, Conquistas, Estatísticas, **Loja** (`/game/loja`), Manual.

- LifeCoins no perfil (saldo clicável → loja) · título/avatar cosméticos equipados
- Toasts RPG no Focus ao concluir tarefas/hábitos (`toast.rpg`, `LevelUpOverlay`)
- Identidade visual Game (tokens violeta, `AppBrand accent="game"`)
- Manual: `docs/MANUAL-GAME-MODE.md`

### Integração com actividade real

- Templates: TASKS, HABITS, GOALS, STUDIES, **CLIENTS**
- Hábitos: coluna «Área RPG» (migração automática)
- Clientes: estado «Fechado» → XP + Finanças + LifeCoins
- Missão semanal «Closer da semana»
- PATCH/POST linhas → `{ row, gamification? }` com feedback XP/LC

### Testes

- Unitários: `web/tests/gamificationPremium.test.ts`
- E2E: `web/e2e/smoke.spec.ts`, `web/e2e/rpg-phase-c.spec.ts`, **`web/e2e/rpg-shop.spec.ts`**

---

## Modo Finanças — F1.0 + F1.1 + F1.2 + F1.3 ✅

- Escolha em **`/mode`** · rotas **`/finance/*`**
- **Backend:** `FinanceService`, migrações até `20260607120000_finance_f13_clients_payyourself`
- **API:** `/finance/dashboard`, `/accounts`, `/movements`, `/categories`, `/methods`, `/reviews`, `/debts`, `/reports/monthly`
- **12 métodos:** catálogo completo (Anexo A) — Primeiros 30 dias, 50/30/20, Paga-te a ti primeiro, Fundo emergência, Envelopes, Renda variável, Snowball, Avalanche, Zero gastos, Revisão semanal, Taxa 20%, Intro investimento
- Manual: [`MANUAL-FINANCEIRO.md`](MANUAL-FINANCEIRO.md) · in-app `/finance/manual`
- **F1.1:** envelopes, metas, export Excel, widget Agora, XP Game, CLIENTS fechado → sugerir receita, hábitos por método
- **F1.2:** cartões/empréstimos (ciclo, TAEG), painel dívidas, relatório PDF mensal
- **F1.3:** ligação CLIENTS bidireccional (`linkedClient` + badge Kanban), missão «Fundação», regra «paga-te a ti primeiro» (% + sugestão TRANSFER após receita)
- E2E: `web/e2e/finance-f1.spec.ts` (F1.0–F1.3)

---

## Case — C1 + C1+ + C2 ✅

- **Backend:** `CaseService`, `server/case/*`, migrações `20260608120000_case_c1`, `20260609120000_case_llm_opt_in`
- **API:** status, chat, stream, insights, conversas, acções (confirm/cancel/PATCH)
- **Motor:** coach local · LLM OpenAI-compat (Groq/OpenAI) com opt-in · tool calling · streaming SSE
- **Acções (C1+):** criar conta, movimento, meta, hábito, marcar hábito — confirmação humana
- **Insights (C2):** `GET /case/insights` + `CaseInsightsWidget` no Painel Agora
- **UI:** `CaseFab` (hexágono) + `CasePanel` + `CaseIcon` em Focus, Game e Finanças
- **E2E:** `web/e2e/case-c1.spec.ts`, `web/e2e/case-c2.spec.ts`
- Spec: [`CASE.md`](CASE.md)

---

## Deploy e produção

### Arquitectura de deploy

```
Browser (Vercel)
    → /api/*  →  proxy serverless (api/[...path].js ou web/api/)
    →  API_BASE_URL (Railway ou similar)
    →  Express + Prisma + Neon
```

Em desenvolvimento local, o Vite faz proxy de `/api` para `localhost:3333`.

### Ficheiros de deploy no repo

| Ficheiro | Uso |
|----------|-----|
| `vercel.json` (raiz) | Build `web/`, output `web/dist`, rewrites SPA + `/api` |
| `web/vercel.json` | Rewrites se Root Directory = `web` |
| `api/[...path].js` | Proxy `/api` quando deploy na raiz |
| `web/api/[...path].js` | Proxy `/api` quando deploy em `web/` |

### Variáveis — resumo rápido

#### Vercel (frontend)

| Variável | Obrigatória | Notas |
|----------|-------------|--------|
| `API_BASE_URL` | **Sim** (recomendado) | URL da API; proxy encaminha `/api/*` |
| `VITE_API_BASE_URL` | Não | Ligação directa browser → API (alternativa) |

#### Railway / servidor API (`server/`)

| Variável | Obrigatória |
|----------|-------------|
| `DATABASE_URL` | Sim |
| `JWT_SECRET` | Sim |
| `CLIENT_ORIGIN` | Sim (URL do front Vercel, sem `/` final) |
| `JWT_EXPIRES_IN` | Recomendado (`7d`) |
| `SEED_DEMO` | `false` em produção |
| `LOG_LEVEL` | `info` em produção |
| `CASE_LLM_API_KEY` | Opcional — activa motor LLM (Groq/OpenAI) |
| `CASE_LLM_PROVIDER` | Opcional — `groq` · `openai` · `custom` |
| `CASE_LLM_MODEL` | Opcional — modelo (default por provider) |
| `CASE_LLM_BASE_URL` | Opcional — URL OpenAI-compat |

Exemplo local: `server/.env.example`

### Problemas de deploy já tratados no código

| Sintoma | Causa | Correção no repo |
|--------|------|------------------|
| 404 na URL principal | Root/build/output errados | `vercel.json` na raiz |
| Build Vercel falha com `@prisma/client` | `tsc -b` incluía testes que importam `server/` | `web/tsconfig.json` sem `tsconfig.test.json` no build |
| `405` em `POST /api/auth/login` | `/api` ia para SPA em vez da API | Proxy + rewrite `/api/:path*` |
| Login sem API | Falta `API_BASE_URL` na Vercel | Definir env e redeploy |

Detalhe passo a passo: [DEPLOY.md](./DEPLOY.md)

---

## Rotas principais (frontend)

| Rota | Descrição |
|------|-----------|
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth |
| `/mode` | Escolha Focus vs Game (pós-login) |
| `/focus/dashboard` | Focus Mode — painel Agora |
| `/focus/ajuda` | Manual Focus |
| `/game`, `/game/*` | Game Mode — RPG (perfil, missões, stats, manual) |
| `/w/:workspaceId` | Hub do workspace |
| `/w/:workspaceId/p/:pageId` | Editor de página |
| `/w/:workspaceId/db/:databaseId` | Base de dados |
| `/ajuda` | Manual |

---

## API — áreas principais

| Prefixo | Área |
|---------|------|
| `/health` | Health check |
| `/auth` | Autenticação |
| `/users` | Utilizador |
| `/workspaces` | Workspaces, pages, databases |
| `/blocks` | Blocos |
| `/database-rows` | Linhas de database |
| `/search` | Pesquisa global |
| `/dashboard` | Resumo do painel Agora |
| `/game` | Perfil, dashboard gaming, modo, prestige, rebuild |

---

## Comandos úteis

### Desenvolvimento

```bash
# Terminal 1 — API
cd server
npm install
cp .env.example .env   # editar DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate deploy
npx prisma generate
npm run dev

# Terminal 2 — Web
cd web
npm install
npm run dev
```

Web: `http://localhost:5173` · API: `http://localhost:3333`

### Build e testes

```bash
cd server && npm run build
cd web && npm run build
cd web && npm test
cd web && npm run test:e2e -- smoke.spec.ts rpg-phase-c.spec.ts
```

### Produção (servidor)

```bash
cd server
npm ci
npm run prisma:generate
npm run build
npm run prisma:deploy
npm start
```

---

## O que ainda não está feito (produto)

### Deploy produção

- Validar envs Vercel/Railway e smoke pós-deploy (`migrate deploy` já aplicável localmente)

### Roadmap futuro — [`MODULOS-FUTUROS.md`](MODULOS-FUTUROS.md)

| Módulo | Resumo |
|--------|--------|
| **Financeiro F2** | Open Banking opt-in, insights financeiros avançados — [`FINANCEIRO.md`](FINANCEIRO.md) |
| **Case C3** | Mais acções PT-PT, Command Palette, insights LLM — [`CASE.md`](CASE.md) |
| **Enterprise** | Tarefas e equipas dentro de empresas |

### Backlog menor

- Leaderboard / social
- Replay avançado de eventos na UI (admin tooling)
- Notificações push
- App mobile nativo
- Integrações externas (Google Calendar, etc.)
- Polish Game Mode (remover título equipado, preview loja, itens por conquista)

---

## Checklist rápido “está tudo a funcionar?”

### Local

- [ ] `server` sobe e `/health` responde `{ "ok": true }`
- [ ] Login e escolher modo em `/mode` (Focus · Game · Finanças)
- [ ] Concluir tarefa/hábito e ver toast RPG no Focus (se Game activo)
- [ ] Game Mode: `/game/loja` — comprar item com LifeCoins

### Produção

- [ ] `API_BASE_URL` na Vercel aponta para a API pública
- [ ] `CLIENT_ORIGIN` no servidor inclui o domínio Vercel
- [ ] `prisma migrate deploy` na API
- [ ] Login sem `405` nem `404`

---

## Histórico recente desta linha de trabalho

1. Game Mode Premium (fundação, evolution, attributes, prestige, focus vs game, testes)
2. Deploy Vercel: `vercel.json`, proxy `/api`, fix build TypeScript
3. Documentação de deploy com variáveis explícitas (`DEPLOY.md`)
4. RPG Fase C (Clientes, hábitos tipados, LifeCoins, manual v1.1, E2E)
5. RPG Fase D (loja `/game/loja`, toasts Focus, identidade Game, E2E loja)
7. Modo Finanças — shell em `/mode` + `/finance` (desenho `FINANCEIRO.md`)
8. Este inventário (`ESTADO-ATUAL.md`)

---

*Documento de referência — actualizar quando houver novas features ou mudanças de deploy.*
