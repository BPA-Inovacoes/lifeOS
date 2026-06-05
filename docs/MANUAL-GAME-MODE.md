# Manual — Game Mode (LifeOS RPG)

**Versão:** 1.2

---

## O que é o Game Mode

O Game Mode é a interface de **progressão RPG** do LifeOS. Transforma a tua actividade real — tarefas, hábitos, estudos, objectivos e clientes — em evolução de personagem: XP, nível, rank, atributos, LifeCoins, missões e conquistas.

**O personagem és tu.** Não ganhas XP por clicar botões; ganhas por **executar acções reais** no Focus Mode.

---

## Navegação

| Secção | Rota | Descrição |
|--------|------|-----------|
| Perfil | `/game` | Ficha de personagem, XP, LifeCoins, rank e classe |
| Missões | `/game/missoes` | Objectivos diários, semanais e mensais |
| Dungeons | `/game/dungeons` | Desafios activos (objectivos em curso) |
| Conquistas | `/game/conquistas` | Badges e marcos de sequência |
| Estatísticas | `/game/stats` | Atributos, heatmap, distribuição de XP e feed |
| Loja | `/game/loja` | Gastar LifeCoins em títulos e avatars |
| Manual | `/game/manual` | Este guia (dentro do Game Mode) |

Para trocar de interface, usa **Trocar modo** na barra lateral — voltas ao ecrã **`/mode`** (Focus · Game · Finanças).

---

## Perfil do jogador

No **Perfil** vês:

- **Nível (1–100)** — barra de XP e progresso até ao próximo nível
- **Rank (E → SSS)** — grau global derivado do nível (ex.: B · Executor)
- **Classe** — estilo de vida detectado pelos teus atributos (ex.: Académico, Empreendedor)
- **Phase** — capítulo narrativo da jornada (Awakening, Momentum, …)
- **LifeCoins** — moeda paralela ao XP; gasta na **Loja** (`/game/loja`)
- **Título equipado** — cosmético comprado na loja (ex.: «Recruta LifeOS»)
- **Prestígio** — disponível no nível 100 (ascensão)

---

## Como ganhar XP

Toda acção concluída no **Focus Mode** gera XP automaticamente:

| Acção | XP aproximado |
|-------|----------------|
| Tarefa simples | +10 |
| Tarefa média | +30 |
| Tarefa difícil (prioridade Alta) | +100 |
| Hábito diário | +5 |
| Hábito semanal | +12 |
| Sessão de estudo | +20 ou mais (conforme duração) |
| Objectivo atingido | +60 ou mais |
| Cliente fechado | +300 ou mais (conforme valor) |
| Semana perfeita (todos os hábitos 7 dias) | +100 |

Missões e conquistas desbloqueadas dão **XP bónus** extra.

---

## LifeCoins e Loja

As **LifeCoins** são a recompensa paralela ao XP. Acumulas por actividade real e gastas na **Loja** (`/game/loja`).

| Acção | LifeCoins |
|-------|-----------|
| Hábito concluído | +1 |
| Tarefa concluída | +2 a +5 (conforme XP) |
| Sessão de estudo | +2 |
| Objectivo atingido | +10 |
| Cliente fechado | +15 |
| Semana perfeita | +8 |
| Missão concluída | proporcional à recompensa XP |

### Como comprar

1. Abre **Loja** na sidebar do Game Mode ou clica no saldo LifeCoins no perfil.
2. Escolhe um **título** ou **avatar** desbloqueado (nível mínimo indicado no card).
3. Clica **Comprar** → **Comprar e equipar** ou **Guardar no inventário**.
4. Itens no inventário podem ser **Equipados** depois.

Vês o saldo actual no **Perfil** (`lifeCoins`) e o total histórico (`lifetimeCoins`).

---

## Rank E–SSS

| Rank | Níveis | Significado |
|------|--------|-------------|
| E | 1–9 | Iniciante |
| D | 10–19 | Aprendiz |
| C | 20–34 | Operador |
| B | 35–49 | Executor |
| A | 50–64 | Líder |
| S | 65–79 | Elite |
| SS | 80–94 | Mestre |
| SSS | 95–100 | Lendário |

---

## Atributos (7 eixos de vida)

Cada acção distribui XP pelos atributos certos. Vê o radar e os valores em **Estatísticas**.

| Atributo | Alimentado por |
|----------|----------------|
| Conhecimento | Estudos, hábitos com área «Conhecimento» |
| Finanças | Clientes fechados, objectivos na área «Finanças» |
| Liderança | Tarefas, objectivos, clientes fechados |
| Disciplina | Hábitos (todas as áreas), rotina, consistência |
| Relacionamentos | Hábitos com área «Relacionamentos», objectivos «Pessoal» |
| Espiritualidade | Hábitos com área «Espiritualidade» |
| Saúde | Hábitos com área «Saúde» |

---

## Hábitos tipados (Área RPG)

Na base **Hábitos**, a coluna **Área RPG** define para que eixo de vida aquele hábito conta:

| Área RPG | Atributos principais |
|----------|----------------------|
| Saúde | Saúde + Disciplina |
| Espiritualidade | Espiritualidade + Disciplina |
| Relacionamentos | Relacionamentos + Disciplina |
| Conhecimento | Conhecimento + Disciplina |
| Disciplina | Disciplina + Saúde |
| Geral | Distribuição equilibrada |

**Como usar:** ao criar ou editar um hábito, escolhe a área que melhor o descreve. Marca **Feito hoje** no Focus Mode — o Game Mode reflecte o progresso nos atributos certos.

Bases de hábitos antigas recebem a coluna «Área RPG» automaticamente na primeira visita ao Game Mode.

---

## Base Clientes

A base **Clientes** liga o teu pipeline comercial ao atributo **Finanças**.

| Coluna | Função |
|--------|--------|
| Cliente | Nome do cliente ou deal |
| Estado | Lead → Negociação → **Fechado** |
| Valor (€) | Valor do contrato (influencia pontos) |
| Pontos | Calculados automaticamente pelo valor |
| Data fecho | Registo da data de fecho |

**Recompensa ao fechar:** quando o estado passa para **Fechado**, ganhas XP (+300 mín.), LifeCoins (+15) e progresso em **Finanças** e **Liderança**.

Para activar a base num espaço: ao criar ou editar o workspace, selecciona **Clientes** no picker de bases de dados.

---

## Objectivos e áreas

Na base **Objectivos**, a coluna **Área** orienta a distribuição de atributos ao atingir a meta:

| Área | Atributos principais |
|------|----------------------|
| Finanças | Finanças, Liderança, Disciplina |
| Saúde | Saúde, Disciplina, Liderança |
| Carreira | Liderança, Conhecimento, Finanças |
| Pessoal | Relacionamentos, Espiritualidade, Disciplina |
| Outro | Distribuição equilibrada |

---

## Classes

A classe **não se escolhe** — é **conquistada** quando os atributos atingem certos patamares. Exemplos:

- **Académico** — Conhecimento ≥ 60
- **Empreendedor** — Finanças ≥ 50 e Liderança ≥ 50
- **Estratega** — Liderança ≥ 80 e Conhecimento ≥ 70
- **Aventureiro** — classe inicial enquanto exploras o sistema

---

## Missões

### Diárias
Renovam à meia-noite. Exemplos: concluir 5 tarefas, estudar 60 min, completar todos os hábitos, deep work.

### Semanais
Reset à segunda-feira. Exemplos: 10 tarefas, 5 h de estudo, 1 objectivo, **fechar 1 cliente**, semana perfeita.

### Mensais
Reset no dia 1. Exemplos: 40 tarefas, meta principal do mês, sequência de 30 dias.

Completa missões no Focus Mode; o progresso actualiza-se aqui. Missões concluídas também dão **LifeCoins**.

---

## Dungeons e Bosses

**Dungeons** e **Bosses** vêm dos teus **Objectivos** (base GOALS) no Focus Mode:

- **Dungeon** — objectivo em progresso
- **Boss** — objectivo de prioridade **Alta** ou grande impacto

Cria e avança objectivos no Focus Mode; aparecem em **Dungeons** com barra de progresso e recompensa XP estimada.

---

## Conquistas e sequência

- **Conquistas** — badges por marcos (tarefas, estudo, streak, nível, …)
- **Sequência (streak)** — dias consecutivos com actividade; marcos em 7, 30, 100 e 365 dias

---

## Prestígio

Ao atingir **nível 100**, podes **prestigiar**:

- Reinicia nível e XP da run actual
- Mantém conquistas, histórico, LifeCoins lifetime e estatísticas
- Ganhas prestígio permanente e multiplicador de progressão

---

## Ligação ao Focus Mode

```
Focus Mode (executar)
  Tarefas ──────→ XP + Liderança / Disciplina
  Hábitos ──────→ XP + atributo da «Área RPG»
  Estudos ──────→ XP + Conhecimento
  Objectivos ───→ XP + atributos da «Área» + Dungeons
  Clientes ─────→ XP + Finanças (estado Fechado)
         ↓
Game Mode (evoluir)
  XP · LifeCoins · Nível · Rank · Atributos · Missões
```

Trabalha no Focus; observa e celebra a evolução no Game.

---

## Manual do Focus Mode

Para espaços, páginas, bases de dados e painel Agora, troca para **Focus Mode** e abre o manual em `/focus/ajuda`.

*Última atualização: 2026-05-30*
