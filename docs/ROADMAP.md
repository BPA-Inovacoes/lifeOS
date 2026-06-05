# LifeOS — Roadmap técnico

Estado alinhado com o código (Maio 2026).  
**Inventário completo:** [`docs/ESTADO-ATUAL.md`](ESTADO-ATUAL.md) · **Refinamento:** [`docs/REFINEMENT-PLAN.md`](REFINEMENT-PLAN.md)

---

## Visão

MVP funcional ✅ → **Produto refinado e profissional** ✅ (refinamento + Game Mode Premium entregues)

Diferencial: execução diária, clareza, rapidez — não clone Notion.

**Próximo passo de produto:** **Finanças F2** ou **Enterprise E1** · Case **C2** ✅ · [`CASE.md`](CASE.md) · [`FINANCEIRO.md`](FINANCEIRO.md).

---

## Fases concluídas ✅

### Fase 1 — Fundação
Monorepo, Vite, Tailwind, Prisma/Neon, arquitectura documentada.

### Fase 2 — Auth
Login, Register, JWT, Zustand, reset password (API + UI).

### Fase 3 — Core
Workspaces, pages, blocks, editor, DnD, slash, breadcrumbs, command palette, hub `/w/:id`.

### Fase 4 — Database Engine (base)
Tabela, Kanban, Calendário, Lista · filtros · sort · resize · Task→Projeto.

### Fase 5 — Produtividade (base)
Templates, dashboard Agora, inbox, hábitos, XP semanal, seed `SEED_DEMO`.

### Fase 6 — Experiência (MVP)
Pesquisa global, manual in-app, polish UX (toasts, modais, empty states, PT).

### Fase 7 — Qualidade
Erros PT, headers segurança, testes unitários web, CI, E2E Playwright, error boundaries, logs estruturados, `DEPLOY.md` (Vercel + proxy `/api`).

---

## Refinamento final — concluído ✅

| Fase | Tema | Estado |
|------|------|--------|
| **1** | Database depth (relações, filtros, tabela, views) | ✅ Concluído |
| **2** | Hábitos 2.0 (heatmap, recorrência, stats) | ✅ Concluído |
| **3** | Experience layer (⌘K, atalhos, microinterações) | ✅ Concluído |
| **4** | Qualidade (CI, logs, E2E, a11y, docs) | ✅ Concluído |

Detalhe por epic: [`REFINEMENT-PLAN.md`](REFINEMENT-PLAN.md)

---

## Entregues no refinamento (referência)

1. **Relações genéricas** — registry + Task→Objetivo, Task→Estudo, validação ✅
2. **Filtros AND/OR** + localStorage ✅
3. **Tabela** — multi-sort, reorder colunas, virtualização ✅
4. **Hábitos 2.0** — heatmap, streak optimista, reset diário ✅
5. **CI GitHub Actions** ✅
6. **Logs estruturados + E2E Playwright** ✅

---

## Game Mode Premium — entregue ✅

Camada opcional de gamificação com pipeline `ActivityEvent`, progressão `1–100`, phases, 8 atributos, achievements/missões v2, prestige, `/game` lazy-loaded e UX separada entre Focus Mode e Game Mode.  
Detalhe: [`docs/GAME-MODE.md`](GAME-MODE.md)

---

## LifeOS RPG — Fase C ✅

Integrações de dados reais no Game Mode:

- Base **CLIENTS** → Finanças + missão semanal «Closer da semana»
- Hábitos com **Área RPG** → 7 eixos de vida
- **LifeCoins** acumuláveis · **Loja** (`/game/loja`) ✅ · toasts RPG no Focus ✅

Spec: [`LIFEOS-RPG.md`](LIFEOS-RPG.md) · Manual: [`MANUAL-GAME-MODE.md`](MANUAL-GAME-MODE.md)

---

## LifeOS RPG — Fase D ✅

- Loja LifeCoins (títulos, avatars, equipar/inventário)
- Toasts RPG + `LevelUpOverlay` no Focus Mode
- Identidade visual Game · E2E `rpg-shop.spec.ts`

---

## Case C1 — entregue ✅

Assistente **Case** com chat contextual (Focus, Game, Finanças), motor local + LLM opcional, rate limit.  
Detalhe: [`CASE.md`](CASE.md)

---

## Case C1+ — entregue ✅

Acções com confirmação humana (conta, movimento, meta, hábitos), formulário multi-Espaço, parser PT-PT.  
E2E: `web/e2e/case-c1.spec.ts`

---

## Case C2 — entregue ✅

- **Insights Agora** — widget no dashboard + `GET /case/insights`
- **Streaming SSE** — respostas LLM token-a-token
- **LLM tool calling** — modelo propõe acções com confirmação

E2E: `web/e2e/case-c2.spec.ts` · Detalhe: [`CASE.md`](CASE.md)

---

## Visão futura — módulos em curso / planeamento

| Módulo | Objetivo | Horizonte |
|--------|----------|-----------|
| **Módulo Financeiro** | F1.0–F1.3 ✅ · próximo **F2** (Open Banking, insights) — [`FINANCEIRO.md`](FINANCEIRO.md) | Fase F2 |
| **Case** | C1 ✅ · C1+ ✅ · **C2** ✅ · próximo **C3** (mais acções, ⌘K) — [`CASE.md`](CASE.md) | Fase C3 |
| **Módulo Enterprise** | Gestão de tarefas e equipas **dentro de empresas** (orgs, roles, atribuições) | Fase E1 |

Ordem macro sugerida: **F2 / C3** → Enterprise.

---

## Fora de scope (v1 / curto prazo)

Realtime · React Native · offline sync · widgets · push · integrações bancárias automáticas · SSO enterprise · leaderboard social

*(Case e módulos acima estão **no roadmap** — ver [`MODULOS-FUTUROS.md`](MODULOS-FUTUROS.md), não são «fora de scope» de produto.)*

---

## Critérios de “done” por entrega

Schema/API testável · UI funcional · tipos TS sem dívida · docs actualizadas · CI verde (quando aplicável).
