# LifeOS — Roadmap técnico

Estado alinhado com o código (Maio 2026).  
**Plano de refinamento activo:** [`docs/REFINEMENT-PLAN.md`](REFINEMENT-PLAN.md)

---

## Visão

MVP funcional ✅ → **Produto refinado e profissional** (em curso)

Diferencial: execução diária, clareza, rapidez — não clone Notion.

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

### Fase 7 — Qualidade (parcial)
Erros PT, headers segurança, testes unitários web, `DEPLOY.md`.

---

## Refinamento final — em curso 🔄

| Fase | Tema | Estado |
|------|------|--------|
| **1** | Database depth (relações, filtros, tabela, views) | ✅ Concluído |
| **2** | Hábitos 2.0 (heatmap, recorrência, stats) | ✅ Concluído |
| **3** | Experience layer (⌘K, atalhos, microinterações) | ✅ Concluído |
| **4** | Qualidade (CI, logs, E2E, a11y, docs) | ✅ Concluído |

Detalhe por epic: [`REFINEMENT-PLAN.md`](REFINEMENT-PLAN.md)

---

## Backlog técnico (priorizado)

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

## Fora de scope

IA · realtime · React Native · offline sync · widgets · push · integrações gigantes

---

## Critérios de “done” por entrega

Schema/API testável · UI funcional · tipos TS sem dívida · docs actualizadas · CI verde (quando aplicável).
