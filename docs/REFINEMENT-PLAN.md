# LifeOS — Plano de refinamento final

**Versão:** 2026-05-21  
**Papel:** Product Lead + Senior Full Stack Engineer  
**Estado:** MVP sólido → produto refinado e profissional  
**Documentos relacionados:** `ROADMAP.md` · `POLISH-PLAN.md` · `ARCHITECTURE.md`

---

## Princípios de produto

O LifeOS **não** compete como clone genérico do Notion.

| Diferencial | Implicação técnica |
|-------------|-------------------|
| **Execução** | Dashboard «Agora», inbox, foco hoje, menos cliques |
| **Clareza** | Estados vazios claros, PT consistente, ícones Lucide |
| **Rapidez** | ⌘K, keyboard-first, optimistic updates |
| **Foco diário** | Hábitos, streaks, XP, planeamento semanal |
| **Profundidade** | Database engine robusto antes de features novas |

**Regra de ouro:** refinar profundamente o que existe inicia; não aumentar complexidade desnecessária.

---

## Baseline técnico (Maio 2026)

### Já entregue ✅

Auth completo · orquestração workspace (criar/editar bases), editor, 4 views, filtros AND + persistência `sessionStorage`, sort, resize/ocultar colunas, relação **Tarefa → Projeto** (hardcoded), hábitos + XP + streaks via `PointsEvent`, toasts, modais LifeOS, ícones Lucide, hub `/w/:id`, deploy docs, testes unitários mínimos.

Game Mode Premium entregue em camada desacoplada: `ActivityEvent`, progressão `1–100`, phases, attributes, achievements/missions v2 e prestige.

### Lacunas conhecidas (da auditoria de código)

| Área | Gap |
|------|-----|
| **Relações** | Só Task→Project provisionado; sem validação servidor; sem sort por label de relação |
| **Filtros** | Só TableView; lógica AND; sem OR; `sessionStorage` (perde ao fechar tab) |
| **Tabela** | Multi-sort, reorder colunas, virtualização (>120 linhas) | Filtros Board/List |
| **Hábitos** | Streak optimista; `syncHabitCheckboxesForUser` ligado; heatmap 90d | ✅ |
| **Qualidade** | Sem CI, E2E, error boundaries, logs estruturados |

---

## Fase 1 — Database depth (PRIORIDADE MÁXIMA)

### 1.1 Sistema de relações genérico

**Objectivo:** motor reutilizável `DatabaseProperty RELATION` + provisionamento declarativo.

**Arquitectura proposta**

```
server/utils/database-relations.ts     ← registry de relações por template
  TASKS → [{ name: "Projeto", target: PROJECTS }, { name: "Objetivo", target: GOALS }, …populated on provision]
server/utils/ensure-workspace-databases.ts  ← syncRelationsForWorkspace()
server/services/database.service.ts    ← validateRelationValue(rowId, relatedDatabaseId)
web: RelationCell, RelationTableFilter   ← já genéricos; melhorar sort + link
```

**Entregáveis**

| # | Item | Critério de done |
|---|------|------------------|
| R1 | Registry declarativo de relações | Ficheiro único; templates → colunas RELATION | [x] |
| R2 | `syncWorkspaceRelations()` | Ao provisionar/remover bases, colunas criadas/removidas | [x] |
| R3 | Tarefa → Objetivo | Coluna «Objetivo» em Tarefas quando GOALS existe | [x] |
| R4 | Tarefa → Estudo | Coluna «Estudo» quando STUDIES existe | [x] |
| R5 | Validação PATCH linha | Rejeitar `rowId` inválido ou de outra base | [x] |
| R6 | Sort/filtro por label | Ordenar por título da linha relacionada | [x] |
| R7 | Célula com link | Abrir base relacionada a partir da célula | [x] |

**Fora deste sprint:** Página→Projeto (requer modelo Page↔Row), N-N, rollup, relação inversa automática.

**Estimativa:** 1,5–2 sprints

---

### 1.2 Filtros avançados

| # | Item | Estado actual | Alvo |
|---|------|---------------|------|
| F1 | Modo AND / OR | Só AND | Toggle global ou por grupo |
| F2 | Operadores DATE | Igualdade | antes/depois/intervalo |
| F3 | Operadores NUMBER | — | &gt;, &lt;, entre |
| F4 | Persistência | sessionStorage | localStorage + opcional API futura |
| F5 | Filtros em Board/List | — | Partilhar `filterRows` |
| F6 | UX rápida | Selects | Chips, clear all, atalho |

**Estimativa:** 1 sprint

---

### 1.3 Experiência da tabela

| # | Item | Prioridade | Estado |
|---|------|------------|--------|
| T1 | Multi-sort (shift+click) | Alta | [x] |
| T2 | Reorder colunas (drag header) | Alta | [x] |
| T3 | Persistência layout → localStorage | Alta | [x] |
| T4 | Virtualização (&gt;120 linhas) | Média | [x] |
| T5 | Resize mais fluido | Baixa | [x] |

**Estimativa:** 1–1,5 sprints

---

### 1.4 Refino das 4 views

Revisão transversal: empty states, toasts, loading, ícones Lucide, filtros partilhados onde fizer sentido.

| View | Foco |
|------|------|
| Tabela | Fase 1.2 + 1.3 |
| Kanban | Filtros por estado; DnD feedback |
| Calendário | Criação rápida; navegação mês |
| Lista (hábitos) | Ver Fase 2 |

**Estimativa:** 0,5 sprint (paralelo)

---

## Fase 2 — Hábitos 2.0

| # | Item | Notas técnicas |
|---|------|----------------|
| H1 | Streaks visuais ricos | Flame + número; optimistic após PATCH | [x] |
| H2 | Heatmap estilo GitHub | `PointsEvent` agrupado por `date`; componente `HabitHeatmap` | [x] |
| H3 | Recorrência | Campo `Frequência` → lógica streak (diário vs semanal) | [x] |
| H4 | Histórico visual | Últimos 30/90 dias por hábito | [x] |
| H5 | Estatísticas | Consistência %, best streak, taxa conclusão | [x] |
| H6 | Reset diário | Ligar `syncHabitCheckboxesForUser` (cron ou on-load) | [x] |

**Estimativa:** 2 sprints

---

## Fase 3 — Experience layer

| # | Item |
|---|------|
| X1 | Command palette: quick actions explícitas (criar task/página/hábito) | [x] |
| X2 | Atalhos globais documentados (`?` ou `/ajuda`) | [x] |
| X3 | Microinterações (transitions 150–200ms, hover consistente) | [x] |
| X4 | Revisão estados: loading / empty / error / success / confirm | [x] |
| X5 | Error boundaries + fallback UI | [x] |

**Estimativa:** 1,5 sprints

---

## Fase 4 — Qualidade & produção

| # | Item | Entregável |
|---|------|------------|
| Q1 | CI GitHub Actions | lint + build + test (web + server) | [x] |
| Q2 | Logs estruturados | pino + request id + error middleware | [x] |
| Q3 | Testes E2E | Playwright: login → criar task → marcar hábito | [x] |
| Q4 | Auditoria performance | `docs/PERFORMANCE.md` | [x] |
| Q5 | Auditoria a11y | focus trap modais + `docs/A11Y.md` | [x] |
| Q6 | Docs actualizadas | ROADMAP, POLISH-PLAN, DEPLOY | [x] |

**Estimativa:** 1–2 sprints (paralelo com Fase 1)

---

## Sequência recomendada (8 semanas)

```
Semana 1–2   R1–R7  Relações genéricas + Task→Objetivo/Estudo
Semana 3     F1–F6  Filtros AND/OR + localStorage
Semana 4     T1–T3  Multi-sort, reorder colunas, persist layout
Semana 5–6   H1–H6  Hábitos 2.0
Semana 7     X1–X5  Experience layer
Semana 8     Q1–Q6  CI, logs, E2E, docs
```

**Quick wins paralelos (Semana 1):** Q1 CI · R3 Tarefa→Objetivo · localStorage prefs

---

## Métricas de sucesso

| Métrica | Alvo |
|---------|------|
| Tempo criar tarefa (dashboard → guardada) | &lt; 15 s |
| ⌘K → acção | &lt; 3 teclas após abrir |
| Tabela 500 linhas | Scroll fluido (virtualização) |
| Hábito marcado | Streak actualiza sem reload |
| CI | Verde em cada PR |
| Lighthouse a11y (app autenticada) | ≥ 90 |

---

## Fora de scope (explícito)

IA · realtime · React Native · offline sync · widgets · push · integrações externas · automações corporativas · clone Notion (páginas infinitas, bases arbitrárias sem template)

---

*Documento vivo — actualizar `[x]` por epic à medida que entregas fecham.*
