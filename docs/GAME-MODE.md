# LifeOS — Game Mode

**Versão:** 2026-05-30  
**Estado:** Game Mode Premium · RPG v1.1 (Fases C + D)  
**Spec RPG:** ver [`LIFEOS-RPG.md`](./LIFEOS-RPG.md) · Manual: [`MANUAL-GAME-MODE.md`](./MANUAL-GAME-MODE.md)

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
 XP · Levels 1–100 · Phases · Attributes · Missions · Prestige · LifeCoins
```

**Princípios:** elegante · opcional · desacoplado · premium · não infantil

---

## Arquitectura

### Backend (`server/gamification/`)

- `levels.ts` — curva 1–100 por faixas, ranks e progressão actual
- `phases.ts` — phases `Awakening → God Mode`
- `attributes.ts` — atributos canónicos + tiers `F → SSS`
- `missions.ts` — missões diárias, semanais e mensais
- `life-coins.ts` — recompensa paralela ao XP
- `habit-areas.ts` / `goal-areas.ts` — deltas por área
- `prestige.ts` — regras de ascensão / prestige
- `achievements.ts` — catálogo seed premium
- `events.ts` — mapeamento para `ActivityEvent`
- `engine.ts` — `GamificationEngine` como orchestrator

### Integração

- `ActivityService.applyRowActivity` emite eventos após `PointsEvent`
- Templates suportados: **TASKS**, **HABITS**, **GOALS**, **STUDIES**, **CLIENTS**
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
| GET | `/game/shop` | Catálogo da loja, saldo LifeCoins, inventário |
| POST | `/game/shop/purchase` | Comprar item `{ itemId, equip? }` |
| PATCH | `/game/shop/equip` | Equipar título ou avatar owned |

### Schema Prisma

- `UserGameProfile` — XP de run, XP lifetime, level, phase, prestige, streak, contadores, **LifeCoins**, **`displayTitle`**
- **`ShopItemDefinition`**, **`UserShopItem`** — loja LifeCoins
- `AchievementDefinition` + `UserAchievement`
- `UserAttribute` — 8 atributos premium com `lastDelta`
- `ActivityEvent` — append-only domain event para replay / backfill
- `GameActivityLog` — feed de actividade
- `DailyMissionProgress` — missões com reset diário
- `PrestigeReset` — histórico de ascensões
- `PointsEventSource`: `TASK`, `HABIT`, `GOAL`, `STUDY`, **`CLIENT`**

---

## Frontend (`web/src/modules/game/`)

### Componentes

- `XPBar`, `LevelBadge`, `AchievementCard`
- `StatsRadarChart`, `WeeklyProgressCard`, `StreakCard`
- `MissionCard`, `ActivityFeed`, `HeatmapCalendar`, `AttributeCard`
- `PlayerProfileCard`, `GameModeToggle`, `GameHud`
- `EvolutionProgress`, `RankCard`, `PrestigeBadge`

### Rotas Game Mode (`/game/*`)

| Rota | Página |
|------|--------|
| `/game` | Perfil do jogador |
| `/game/missoes` | Missões (diárias + placeholders) |
| `/game/dungeons` | Dungeons & Bosses (preview) |
| `/game/conquistas` | Conquistas + streak |
| `/game/stats` | Estatísticas e atributos |
| `/game/loja` | Loja LifeCoins (títulos, avatars) |
| `/game/manual` | Manual Game Mode (v1.1) |

Shell: `GameShell` + `GameSidebar` · dados: `useGameDashboard()`.

### Rotas (legado doc)

- `/game` — home RPG (substitui o dashboard monolítico)

### Toggle Focus / Game / Finanças

- Escolha em **`/mode`** após login (3 interfaces)
- Hook `useGameMode()` + `PATCH /game/mode` para Focus ↔ Game
- Focus Mode: execução + **toasts RPG** ao concluir actividade (quando perfil game activo)
- Game Mode: HUD + Command Center + **Loja**
- Modo Finanças: shell separada `/finance/*` (desenho — ver `FINANCEIRO.md`)

---

## Sistema de XP

| Acção | XP (base) |
|-------|-----------|
| Tarefa | 10 / 18 / 25 |
| Hábito diário | 5 |
| Hábito semanal | 12 |
| Sessão estudo | `max(20, minutos / 3)` |
| Objectivo atingido | 60+ |
| Cliente fechado | 300+ |
| Semana perfeita | +100 |

Níveis: `1–100` com curva configurável por faixas e cap em `100`.

Phases: `Awakening`, `Momentum`, `Execution`, `Mastery`, `Evolution`, `Transcendence`, `God Mode`.

---

## Missões

### Diárias
Concluir tarefas, estudar, hábitos do dia, momentum XP, deep work.

### Semanais
10 tarefas, 5 h estudo, 1 objectivo, **1 cliente fechado**, semana perfeita.

### Mensais
40 tarefas, meta do mês, sequência 30 dias.

Reset por `MissionPeriod` (`DAILY` / `WEEKLY` / `MONTHLY`).

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
- separação Focus vs Game vs Finanças (`/mode` → `/focus/*` | `/game/*` | `/finance/*`)
- Fase C: Clientes, hábitos «Área RPG», LifeCoins
- Fase D: loja `/game/loja`, toasts Focus, identidade Game, `displayTitle`/avatars
- loaders premium + testes unitários + E2E (`smoke`, `rpg-phase-c`, `rpg-shop`)

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
- `20260530120000_rpg_v1_missions`
- `20260530140000_rpg_phase_c` (CLIENTS, LifeCoins)
- **`20260530160000_rpg_shop`** (loja, `displayTitle`)

---

## Testes

```bash
cd server && npm run prisma:deploy && npm run prisma:generate && npm run build
cd web && npm run build
cd web && npm test
cd web && npm run test:e2e -- smoke.spec.ts rpg-phase-c.spec.ts rpg-shop.spec.ts
```

---

*Documento vivo — actualizar quando entrarem sistemas sazonais, social ou replay avançado.*
