# LifeOS RPG System

**Versão:** 1.0  
**Estado:** Spec congelado · UI estruturada · backend em evolução  
**Inspirado em:** Solo Leveling · RPGs clássicos · progressão real · desenvolvimento pessoal

---

## Filosofia

O objectivo não é concluir tarefas. O objectivo é **evoluir o utilizador**.

| ❌ Não | ✅ Sim |
|--------|--------|
| XP por clicar botões | XP por acções reais concluídas |
| Badges decorativos | Progresso ligado a hábitos, estudos, projectos |
| Gamificação infantil | RPG premium sobre a vida real |

**O personagem és tu.** Cada tarefa, hábito, estudo ou conquista alimenta a tua ficha de personagem.

---

## Hierarquia de identidade (decisão v1.0)

Evitar sobreposição confusa entre Rank, Phase, Classe e Título:

```
Utilizador
  ├── Nível (1–100)          → barra XP principal
  ├── Rank (E → SSS)         → macro-identidade derivada do nível
  ├── Classe                 → conquistada por atributos dominantes
  ├── Título                 → desbloqueável / escolhido (narrativa)
  └── Phase (Act I–VII)      → arco narrativo Solo Leveling (opcional, UI)
```

| Camada | Função | Exemplo |
|--------|--------|---------|
| **Nível** | Progresso numérico | Lv. 37 |
| **Rank** | Grau global E–SSS | Rank B |
| **Classe** | Estilo de vida detectado | Empreendedor Estratégico |
| **Título** | Cosmético + story | CEO Aprendiz |
| **Phase** | Capítulo da jornada | Execution (Act III) |

Os ~100 rank titles por nível actuais (`Wanderer`, `Achiever`, …) serão **substituídos** pelo Rank E–SSS + títulos desbloqueáveis. A phase mantém-se como narrativa visual.

### Rank E–SSS (por nível)

| Rank | Níveis | Label PT |
|------|--------|----------|
| E | 1–9 | Iniciante |
| D | 10–19 | Aprendiz |
| C | 20–34 | Operador |
| B | 35–49 | Executor |
| A | 50–64 | Líder |
| S | 65–79 | Elite |
| SS | 80–94 | Mestre |
| SSS | 95–100 | Lendário |

---

## Perfil do jogador

```
Nome:        Emanuel Xavier
Título:      CEO Aprendiz
Nível:       37
Rank:        B · Executor
Classe:      Empreendedor Estratégico
XP:          7.250 / 8.000
Prestígio:   0
Sequência:   18 dias
```

**UI Game Mode:** `/game` (Perfil)

---

## Atributos (7 eixos de vida)

Representam áreas reais — não stats genéricos de produtividade.

| Atributo | Representa | Fonte LifeOS (actual / planeado) |
|----------|------------|-------------------------------------|
| **Conhecimento** | Estudos, leitura, cursos | Base STUDIES · hábitos «estudo» |
| **Finanças** | Riqueza, clientes, receita | Base **CLIENTS** · objectivos «Finanças» |
| **Liderança** | Gestão, projectos, equipas | Base GOALS · projectos · tarefas |
| **Disciplina** | Hábitos, rotina, consistência | Base HABITS · streak |
| **Relacionamentos** | Família, networking, social | Hábitos «Relacionamentos» · objectivos «Pessoal» |
| **Espiritualidade** | Crescimento espiritual | Hábitos «Espiritualidade» |
| **Saúde** | Exercício, sono, bem-estar | Hábitos «Saúde» |

### Migração desde atributos actuais (backend)

| Actual (v0) | → v1 |
|-------------|------|
| knowledge | Conhecimento |
| discipline | Disciplina |
| execution | Liderança (parcial) |
| strategy | Liderança (parcial) |
| focus | Disciplina (parcial) |
| consistency | Disciplina |
| creativity | Conhecimento (parcial) |
| energy | Saúde |

Atributos sem fonte de dados ficam visíveis a **0** com hint «Liga actividades no Focus Mode» — nunca inventar progresso.

---

## Sistema de XP

Toda acção real concluída gera XP via `GamificationEngine` → `ActivityEvent`.

| Acção | XP sugerido | Trigger actual |
|-------|-------------|----------------|
| Tarefa simples | +10 | TASKS · prioridade baixa |
| Tarefa média | +30 | TASKS · prioridade média |
| Tarefa difícil | +100 | TASKS · prioridade alta |
| Projecto concluído | +500 | GOALS · meta grande |
| Cliente fechado | +300 | CLIENTS · estado «Fechado» |
| Meta anual | +1000 | GOALS · template anual |
| Boss | +5000–10000 | GOALS · flag `boss: true` |

**Regra:** XP vem dos **pontos da base** ou de `xpReward` explícito no objectivo — nunca de navegação ou cliques.

Curva de níveis: **1–100**, anchors em `server/gamification/levels.ts` (cap Lv.100 → prestige).

---

## Classes (conquistadas)

Não são escolhidas no registo. São **derivadas** dos atributos.

| Classe | Requisitos |
|--------|------------|
| Empreendedor | Finanças ≥ 50 · Liderança ≥ 50 |
| Académico | Conhecimento ≥ 60 |
| Estratega | Liderança ≥ 80 · Conhecimento ≥ 70 |
| Construtor de Impérios | Finanças ≥ 90 · Liderança ≥ 90 |
| Monge Disciplinado | Disciplina ≥ 80 · Espiritualidade ≥ 50 |
| Atleta | Saúde ≥ 70 · Disciplina ≥ 60 |

Implementação: `server/gamification/classes.ts` (planeado) · exposto no perfil API.

---

## Missões

| Tipo | Reset | Exemplos | Estado |
|------|-------|----------|--------|
| **Diárias** | Meia-noite | 5 tarefas · 60 min estudo · hábitos do dia | ✅ Backend |
| **Semanais** | Segunda | 10 tarefas · 2 clientes · 100 páginas | 🔜 Fase B |
| **Mensais** | Dia 1 | Objectivo principal do mês | 🔜 Fase B |

**UI:** `/game/missoes`

---

## Dungeons & Bosses

Modelados sobre entidades LifeOS — **não** editor separado na v1.

| RPG | LifeOS | UI |
|-----|--------|-----|
| **Dungeon** | Projecto / meta com checklist | `/game/dungeons` |
| **Boss** | Objectivo grande com prazo + `xpReward` fixo | mesma página |

Exemplo Dungeon:

```
Exame de Física II
├── Estudar capítulos
├── Resolver exercícios
└── Revisão final
Recompensa: +1000 XP
```

Exemplo Boss:

```
Defesa da Monografia → +5000 XP
Primeiro Milhão      → +10000 XP
```

**Estado:** UI placeholder v1 · entidade `GameChallenge` planeado Fase B.

---

## Conquistas · Sequência · Prestígio

- **Conquistas:** catálogo seed em `achievements.ts` · UI `/game/conquistas`
- **Sequência:** `currentStreak` · marcos 7 / 30 / 100 / 365 dias
- **Prestígio:** Lv.100 → ascensão · mantém histórico · reinicia nível/XP · multiplicador XP

**LifeCoins:** moeda activa desde v1.1 · **Loja** em `/game/loja` (Fase D ✅).

| Acção | LifeCoins |
|-------|-----------|
| Hábito | +1 |
| Tarefa | +2 a +5 |
| Estudo | +2 |
| Objectivo | +10 |
| Cliente fechado | +15 |
| Semana perfeita | +8 |
| Missão | ~XP/10 |

---

## Integração LifeOS

```
Focus Mode (execução)
  Tarefas ──────→ XP + Liderança / Disciplina
  Hábitos ──────→ XP + atributo da «Área RPG»
  Estudos ──────→ Conhecimento
  Objectivos ───→ XP massivo + Dungeons/Bosses
  Clientes ─────→ Finanças (estado Fechado)
        ↓
  PointsEvent → ActivityEvent
        ↓
  GamificationEngine (+ LifeCoins)
        ↓
Game Mode (retrospetiva + RPG)
```

---

## Arquitectura técnica

### Backend (`server/gamification/`)

| Ficheiro | Papel |
|----------|-------|
| `engine.ts` | Orchestrator principal |
| `levels.ts` | Curva 1–100 · migrar para Rank E–SSS |
| `phases.ts` | Acts narrativos |
| `attributes.ts` | Migrar para 7 eixos v1 |
| `xp-rules.ts` | Deltas por tipo de actividade |
| `missions.ts` | Diárias (expandir semanal/mensal) |
| `achievements.ts` | Catálogo |
| `prestige.ts` | Ascensão Lv.100 |
| `classes.ts` | *Novo* — classes derivadas |

### API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/game/profile` | HUD + perfil |
| GET | `/game/dashboard` | Dados agregados |
| PATCH | `/game/mode` | Toggle (escolha em `/mode`) |
| POST | `/game/prestige` | Ascensão |
| GET | `/game/shop` | Catálogo, saldo, inventário |
| POST | `/game/shop/purchase` | Comprar `{ itemId, equip? }` |
| PATCH | `/game/shop/equip` | Equipar item owned |

### Frontend Game Mode (`web/src/modules/game/`)

| Rota | Página | Conteúdo |
|------|--------|----------|
| `/game` | Perfil | Ficha, XP, rank, classe, resumo |
| `/game/missoes` | Missões | Diárias + placeholders semanal/mensal |
| `/game/dungeons` | Dungeons | Desafios activos (placeholder v1) |
| `/game/conquistas` | Conquistas | Badges + streak |
| `/game/stats` | Estatísticas | Radar, heatmap, atributos, distribuição XP |
| `/game/loja` | Loja | LifeCoins · títulos · avatars |
| `/game/manual` | Manual | Guia RPG in-app (v1.1) |

Shell: `GameShell` + `GameSidebar` · dados partilhados: `useGameDashboard()`.

---

## Roadmap de implementação

### Fase A — Spec + UI ✅ (actual)
- [x] `docs/LIFEOS-RPG.md`
- [x] Rotas `/game/*` e navegação
- [x] Páginas separadas no Command Center

### Fase B — Backend RPG v1 ✅ (actual)
- [x] Atributos 7 eixos + migração automática v0→v1
- [x] Rank E–SSS no API (`rank`, `rankLabel`, `rankTitle`)
- [x] Classes derivadas (`playerClass`, `playerClassLabel`)
- [x] Missões semanais/mensais (`MissionPeriod` + engine)
- [x] Dungeons/Bosses derivados de GOALS (`challenges` no dashboard)

### Fase C — Integrações ✅
- [x] Base Clientes → Finanças (`CLIENTS`, `client.closed`, atributos finance/leadership)
- [x] Hábitos tipados → coluna «Área RPG» + deltas por eixo de vida
- [x] LifeCoins acumuláveis (`lifeCoins`, `lifetimeCoins` no perfil)

### Fase D — Loja + polish Focus ✅
- [x] Loja LifeCoins (`/game/loja`, títulos, avatars, `displayTitle`)
- [x] Toasts RPG no Focus Mode (`gamification` em PATCH linhas, `LevelUpOverlay`)
- [x] Identidade visual Game Mode (tokens violeta)
- [x] E2E `rpg-shop.spec.ts`

**LifeCoins:** moeda activa · gastar na loja · equipar cosméticos no perfil.

---

## Objectivo final

Transformar o LifeOS num **Sistema Operacional Pessoal** onde evoluis na vida real como num RPG — com progresso digital que reflecte progresso real.

---

*Documento vivo. Actualizar em conjunto com `docs/GAME-MODE.md`.*
