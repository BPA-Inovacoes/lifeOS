# LifeOS — Game Mode

**Versão:** 2026-05-25  
**Estado:** Game Mode Premium entregue (camada opcional)

---

## Visão

O Game Mode transforma produtividade em **progressão, execução e consistência** sem alterar o core do LifeOS.

```
Core LifeOS (tarefas, hábitos, bases)
        ↓
 PointsEvent (ledger produtividade)
        ↓
 ActivityEvent (append-only, domínio game)
        ↓
 GamificationEngine (orchestrator)
        ↓
 XP · Levels 1–100 · Phases · Attributes · Missions · Prestige
```

**Princípios:** elegante · opcional · desacoplado · premium · não infantil

---

## Arquitectura

### Backend (`server/gamification/`)

- `levels.ts` — curva 1–100 por faixas, ranks e progressão actual
- `phases.ts` — phases `Awakening → God Mode`
- `attributes.ts` — atributos canónicos + tiers `F → SSS`
- `missions.ts` — missões diárias v2
- `prestige.ts` — regras de ascensão / prestige
- `achievements.ts` — catálogo seed premium
- `events.ts` — mapeamento para `ActivityEvent`
- `engine.ts` — `GamificationEngine` como orchestrator

### Integração

- `ActivityService.applyRowActivity` emite eventos após `PointsEvent`
- Templates suportados: **TASKS**, **HABITS**, **GOALS**, **STUDIES**
- Leituras deixaram de ter side effects escondidos
- O progresso continua a ser calculado mesmo com o Game Mode desligado; o toggle controla a UX

### API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/game/profile` | Perfil gaming (nível, XP, streak) |
| GET | `/game/dashboard` | Dashboard completo (stats, missões, feed) |
| PATCH | `/game/mode` | `{ "enabled": true/false }` — toggle Focus/Game |
| POST | `/game/prestige` | Faz ascensão quando o utilizador está em Lv.100 |
| POST | `/game/rebuild` | Rebuild/backfill do perfil gaming do utilizador |

### Schema Prisma

- `UserGameProfile` — XP de run, XP lifetime, level, phase, prestige, streak e contadores
- `AchievementDefinition` + `UserAchievement`
- `UserAttribute` — 8 atributos premium com `lastDelta`
- `ActivityEvent` — append-only domain event para replay / backfill
- `GameActivityLog` — feed de actividade
- `DailyMissionProgress` — missões com reset diário
- `PrestigeReset` — histórico de ascensões
- `PointsEventSource` estendido: `GOAL`, `STUDY`

---

## Frontend (`web/src/modules/game/`)

### Componentes

- `XPBar`, `LevelBadge`, `AchievementCard`
- `StatsRadarChart`, `WeeklyProgressCard`, `StreakCard`
- `MissionCard`, `ActivityFeed`, `HeatmapCalendar`, `AttributeCard`
- `PlayerProfileCard`, `GameModeToggle`, `GameHud`
- `EvolutionProgress`, `RankCard`, `PrestigeBadge`

### Rotas

- `/game` — **lazy-loaded** (`React.lazy`)
- rota sempre descobrível no sidebar e na command palette
- se desligado, abre landing premium clara e activável

### Toggle Focus / Game

- Hook único `useGameMode()`
- Persistido no servidor via `PATCH /game/mode`
- Focus Mode: dashboard actual com sinais gaming subtis
- Game Mode: HUD + Command Center denso e retrospetivo

---

## Sistema de XP

| Acção | XP (base) |
|-------|-----------|
| Tarefa | 10 / 18 / 25 |
| Hábito diário | 5 |
| Hábito semanal | 12 |
| Sessão estudo | `max(20, minutos / 3)` |
| Objectivo atingido | 60 |
| Semana perfeita | +100 |

Níveis: `1–100` com curva configurável por faixas e cap em `100`.

Phases: `Awakening`, `Momentum`, `Execution`, `Mastery`, `Evolution`, `Transcendence`, `God Mode`.

---

## Missões diárias

1. Concluir 5 tarefas (+30 XP)
2. Estudar 60 min (+25 XP)
3. Completar todos os hábitos do dia (+20 XP)
4. Ganhar 50 XP no dia (+15 XP)
5. Fechar 1 bloco deep work (+20 XP)

Reset automático à meia-noite (por `date` na BD).

---

## Achievements (seed)

- Semana de fogo (streak 7)
- Executor (100 tarefas)
- Estudioso (50h estudo)
- Semana perfeita
- Primeiro objectivo
- Sem falhar (30 dias activos)
- Deep Work (10 dias)
- Awakened (nível 10)
- Ascension I

---

## Performance

- Dashboard gaming **lazy** — zero impacto no Focus Mode
- Queries com `staleTime` 60s
- Leitura de hábitos sem writes escondidos
- Componentes isolados em `modules/game/`

---

## Estado actual

Entregue:

- foundation hardening
- evolution 1–100 + phases
- attributes v2
- achievements + missions v2
- prestige / ascension
- separação Focus vs Game
- loaders premium + testes unitários + smoke Playwright

---

## Migração

```bash
cd server
npx prisma migrate deploy   # ou migrate dev
npx prisma generate
```

Migrations:

- `20250521160000_game_mode`
- `20260525064000_game_mode_evolution`

---

## Testes

```bash
cd server && npm run prisma:deploy && npm run prisma:generate && npm run build
cd web && npm run build
cd web && npm test
cd web && npm run test:e2e -- smoke.spec.ts
```

---

*Documento vivo — actualizar quando entrarem sistemas sazonais, social ou replay avançado.*
