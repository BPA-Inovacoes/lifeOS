# LifeOS — Plano de refinamento (histórico + estado)

**Versão:** 2026-05-21  
**Estado:** MVP concluído → **refinamento final** (ver `docs/REFINEMENT-PLAN.md`)

> O plano activo de execução está em **`REFINEMENT-PLAN.md`**.  
> Este ficheiro regista o polish já entregue (Fases A–E) e métricas históricas.

---

## Diagnóstico actualizado (Maio 2026)

| Dimensão | Nota | Observação |
|----------|------|------------|
| Funcionalidade core | 9/10 | Workspaces, editor, 4 views, dashboard, hábitos, XP |
| UX / polish | 7/10 | Toasts, modais, empty states, PT, ícones Lucide, hub |
| Database engine | 7/10 | Filtros/sort/resize ok; relações só Task→Project |
| Consistência visual | 8/10 | Design system + AppModal + ConfirmDialog |
| Produção | 8/10 | CI, logs pino, E2E Playwright, deploy docs |

---

## Entregue — Fases A a E (MVP polish) ✅

### Fase A — Polish crítico
- [x] Seed limpo (`SEED_DEMO`), título default vazio
- [x] `EmptyState`, skeletons
- [x] Editar workspace (nome, ícone, bases add/remove)
- [x] Mobile drawer sidebar
- [x] Toasts globais
- [x] Consistência visual base

### Fase B — Database engine (base)
- [x] Ordenação por coluna
- [x] Relação Task→Projeto
- [x] Filtros AND + persistência session
- [x] Resize / ocultar colunas
- [x] Revisão 4 views (MVP)

### Fase C — Experiência
- [x] Breadcrumbs, slash inline, subpáginas
- [x] Command palette + pesquisa global
- [x] Hub workspace `/w/:id`

### Fase D — Produtividade (parcial)
- [x] Templates Objetivos, Estudos, Planeamento semanal
- [x] Selecção de bases ao criar/editar espaço
- [x] **D2 Hábitos 2.0** → Fase 2 concluída (`REFINEMENT-PLAN.md`)

### Fase E — Produção
- [x] Erros API PT, headers segurança, testes unitários web, deploy docs
- [x] CI GitHub Actions, logs pino, E2E Playwright, a11y → Fase 4 concluída

### Extra (sessões recentes)
- [x] Ícones workspace (Lucide presets)
- [x] Ícones bases de dados (Lucide, sem emojis na UI)
- [x] Modais personalizados (`AppModal`, `ConfirmDialog`)
- [x] Sidebar só lista bases activas (sem auto-provision ao abrir)

---

## Métricas Sprint A — concluídas ✅

- [x] Utilizador novo não vê «Organizar inbox» após seed limpo
- [x] Nova linha aparece sem texto até o utilizador escrever
- [x] Mobile: menu abre navegação completa
- [x] Workspace editável na sidebar
- [x] Acções críticas mostram toast de confirmação

---

## Próximo foco

Produto refinado (Fases 1–4 concluídas). Evoluções opcionais: code-split, paginação server-side, PWA.

---

*Actualizado em 2026-05-21.*
