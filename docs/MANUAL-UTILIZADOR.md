# LifeOS — Manual de utilizador

Guia para usar a aplicação web do **LifeOS**: workspaces, páginas, databases (tarefas, hábitos, objetivos, estudos, projetos), dashboard e pontos/XP.

**Na app:** abre **Manual** na barra lateral ou **⌘K** → «Manual de utilizador» (`/ajuda`).

Para instalação e desenvolvimento, vê o [README](../README.md). Para evolução técnica, vê o [ROADMAP](ROADMAP.md).

---

## 1. O que é o LifeOS

O LifeOS é um espaço de trabalho pessoal de produtividade. Organizas a vida em:

- **Workspaces** — contextos separados (ex.: Pessoal, Trabalho).
- **Páginas** — notas com blocos (texto, tarefas inline, código, etc.).
- **Databases** — tabelas estruturadas por **template** (Tarefas, Hábitos, Objetivos, Estudos, Projetos, …).
- **Dashboard** — visão do dia: foco, inbox, XP, hábitos e workspaces.

---

## 2. Primeiro acesso

### 2.1 Entrar na conta

1. Abre a app (em desenvolvimento: `http://localhost:5173`).
2. Na página **Entrar**, usa email e palavra-passe.
3. Após login, entras no **Dashboard**.

**Conta de desenvolvimento** (após `npm run prisma:seed` no servidor):

| Campo | Valor |
|-------|--------|
| Email | `xavier@bpa.com` |
| Palavra-passe | `xavier123` |

### 2.2 Criar conta nova

1. Na página de login, segue o link para **Registar**.
2. Preenche nome, email e palavra-passe.
3. Após registo, és autenticado automaticamente.

> A recuperação de palavra-passe existe na API; a interface completa pode ainda não estar disponível no frontend.

### 2.3 Dados iniciais (seed)

Se o administrador correu `npm run prisma:seed`, o workspace **Pessoal** inclui tipicamente:

| Conteúdo | Descrição |
|----------|-----------|
| Página **Início** | Página de boas-vindas com blocos |
| **Tarefas** | Estados, prioridades, data limite, pontos, «Foco hoje», relação **Projeto** |
| **Hábitos** | Feito hoje, frequência, pontos |
| **Objetivos** | Metas com área, prazo e progresso % |
| **Estudos** | Disciplinas, tópicos, data de exame |
| **Projetos** | Lista de projetos (ligada às tarefas) |

O seed pode ainda criar **linhas de exemplo** (ex.: uma tarefa «Revisar objetivos da semana», hábitos «Meditar», «Treino») e **histórico de XP dos últimos 7 dias** para o gráfico do dashboard parecer preenchido. São dados reais na base de dados, não ecrãs fictícios — podes apagá-los ou ignorá-los.

Workspaces **antigos** (criados antes de Objetivos/Estudos) ganham essas databases ao **reabrir o workspace** na app.

---

## 3. Navegação geral

### 3.1 Barra lateral (sidebar)

| Item | Função |
|------|--------|
| **Dashboard** | Resumo do dia e lista de workspaces |
| **Manual** | Este guia (`/ajuda`) |
| **Workspaces** | Lista de espaços; o activo mostra lápis para editar |
| **Árvore de páginas** | Abre páginas do workspace activo (+ subpáginas) |
| **Nova página** | Cria página no workspace actual |
| **Databases** | Atalhos para todas as databases do workspace |
| **Pesquisar** | Abre a paleta de comandos (⌘K) |
| **Terminar sessão** | Sai da conta |

**Desktop:** a sidebar fica fixa à esquerda; o conteúdo principal faz scroll à direita.

**Telemóvel / ecrã estreito:** usa o botão **Menu** (ícone ☰) no cabeçalho para abrir a mesma navegação em **drawer** (painel deslizante). O cabeçalho tem também **Comandos** com atalho **⌘K**.

### 3.2 Rotas principais

| URL | Conteúdo |
|-----|----------|
| `/dashboard` | Dashboard |
| `/ajuda` | Manual de utilizador |
| `/w/:workspaceId` | Página inicial do workspace |
| `/w/:workspaceId/p/:pageId` | Editor de página |
| `/w/:workspaceId/db/:databaseId` | Database (tabela, quadro, calendário, lista) |

### 3.3 Paleta de comandos (⌘K / Ctrl+K)

Atalho global (**⌘K** / **Ctrl+K**) para criar e navegar rapidamente. Os resultados aparecem em secções:

| Secção | Exemplos |
|--------|----------|
| **Criar** | Nova página, Nova tarefa, Novo hábito, Novo objetivo, Novo tópico de estudo |
| **Ir para** | Dashboard, databases, outros workspaces, Manual |
| **Resultados** | Páginas, tarefas e databases (pesquisa com 2+ caracteres) |

- Escreve **«nova tarefa»**, **«novo objetivo»** ou **«nov»** para priorizar acções de criação.
- As acções **Criar** abrem a database correspondente após criar a linha.
- A pesquisa global **combina-se** com navegação (melhor correspondência no topo).

Abre por: **⌘K**, **Pesquisar** na sidebar, ou **Comandos** no cabeçalho.

---

## 4. Dashboard

O dashboard lê dados **reais** da API (`GET /dashboard`): tarefas, hábitos, pontos e workspaces. Não há números inventados no frontend; após o **seed** podem aparecer exemplos e XP histórico (ver §2.3).

Secções (de cima para baixo):

### 4.1 Inbox rápido

Campo no topo para **capturar uma tarefa** sem abrir a database:

1. Escreve o título.
2. Enter ou botão de enviar.
3. A tarefa é criada na database **Tarefas** com estado **Por fazer**.

### 4.2 Agora (foco hoje)

Mostra até **3 tarefas** com **Foco hoje** activo na database Tarefas.

| Ação | Como |
|------|------|
| Concluir | Círculo à esquerda — passa o estado para **Concluído** |
| Remover do foco | Estrela — desmarca «Foco hoje» |
| Abrir tarefa | Clica no título — vai à database |

Para colocar tarefas no foco: na database **Tarefas**, activa **Foco hoje** (vista Tabela ou Lista).

### Case — Insights do dia

Widget **Case** (contorno verde) com sugestões proactivas baseadas nos teus dados: revisão financeira pendente, hábitos em falta, orçamento, etc.

- Clica num insight → abre o **Case** com uma pergunta sugerida.
- Disponível no Painel Agora (Modo Focus).

### 4.3 Cartões de métricas

Resumo de tarefas abertas/concluídas, hábitos do dia, **pontos/XP hoje** e meta diária.

### 4.4 Gráfico XP da semana

Barras com pontos ganhos por dia (tarefas concluídas + hábitos feitos). Com seed, os últimos dias podem incluir **pontos de demonstração**.

### 4.5 Streaks de hábitos

Hábitos com sequência de dias consecutivos marcados como feitos.

### 4.6 Listas do dia

- **Tarefas em aberto** — preview de tarefas não concluídas.
- **Hábitos de hoje** — pendentes ou já feitos, com pontos.

### 4.7 Os teus espaços (workspaces)

Grelha com todos os workspaces. Clica num card para entrar; **Novo** / **Workspace** cria um espaço.

---

## 5. Workspaces

### 5.1 Criar workspace

- Dashboard: botão **Workspace** no topo ou **Novo** na secção workspaces.

Diálogo com **nome** (obrigatório), **ícone** (emoji) e **descrição** (opcional). Ao confirmar, o espaço inclui:

- Página **Início**
- **Tarefas**, **Hábitos**, **Objetivos**, **Estudos** e **Projetos** (este último para a coluna Projeto nas tarefas)

### 5.2 Renomear workspace

**No dashboard**

1. Secção **Os teus espaços** → passa o rato no card.
2. Ícone **lápis** → altera nome e ícone → **Guardar**.

**Na sidebar**

1. Com o workspace activo, passa o rato na entrada do workspace na lista.
2. Ícone **lápis** à direita → mesmo diálogo de edição.

> Permissão **owner** ou **ADMIN**. O slug interno actualiza-se com o nome.

### 5.3 Apagar workspace

1. No card do workspace (dashboard), ícone **lixo** ao passar o rato.
2. Confirma no diálogo.

**Atenção:** apaga o workspace e todos os dados. Irreversível.

### 5.4 Entrar num workspace

Clica no card, na lista da sidebar, ou **⌘K** → nome do workspace. A sidebar mostra páginas e databases desse espaço.

---

## 6. Páginas e editor

### 6.1 Nova página

- Sidebar: **Nova página**, ou
- **⌘K** → «Nova página».
- **Subpágina:** na árvore, passa o rato sobre uma página e clica **+** à direita.

Título editável no topo. **Breadcrumbs:** Dashboard → workspace → páginas pai → página actual.

### 6.2 Renomear página

Clica no **título** no cabeçalho e edita inline; guarda ao sair do campo.

### 6.3 Apagar página

- Árvore na sidebar: ícone lixo ao passar o rato, ou
- Editor: **Apagar página** (com confirmação).

### 6.4 Blocos de conteúdo

Cada página é uma sequência de **blocos**.

**Inserir bloco (linha nova)**

1. Clica **+** entre blocos ou no fim.
2. Escreve **`/`** → menu slash.
3. Escolhe o tipo (↑↓, Enter).

**Slash dentro de bloco existente**

Num **parágrafo**, **título**, **citação**, **destaque** ou **to-do** já escrito, escreve **`/`** no texto (ex.: `/titulo`) para transformar o bloco ou inserir outro tipo logo a seguir.

| Comando slash | Tipo |
|---------------|------|
| Texto | Parágrafo |
| Título 1 / 2 / 3 | Cabeçalhos |
| Tarefa | Checkbox TODO inline |
| Citação | Quote |
| Destaque | Callout |
| Divisor | Linha horizontal |
| Código | Bloco de código |

**Reordenar:** arrasta **⋮⋮** à esquerda do bloco.

**Apagar:** ícone de lixo no bloco.

### 6.5 Painel de dados (DataPanel)

Em algumas páginas, painel com atalhos às databases do workspace.

---

## 7. Databases

Abre pela **sidebar**, **⌘K** ou links no dashboard. No topo escolhes a **vista** (Tabela, Quadro, Calendário, Lista — conforme o template).

| Template | Nome usual | Vistas típicas |
|----------|------------|----------------|
| `TASKS` | Tarefas | Tabela, Quadro, Calendário |
| `HABITS` | Hábitos | Lista, Tabela |
| `GOALS` | Objetivos | Tabela, Quadro |
| `STUDIES` | Estudos | Tabela, Quadro, Calendário |
| `PROJECTS` | Projetos | Tabela |

Todas as vistas partilham o mesmo estilo de cabeçalho (`// tabela`, `// lista`, …) e rodapé com contador de linhas + **Nova linha** (ou **Novo hábito**).

### 7.1 Database Tarefas

| Propriedade | Uso |
|-------------|-----|
| Título | Nome da tarefa (placeholder «Nova tarefa» se vazio) |
| Estado | Por fazer, Em progresso, Concluído |
| Prioridade | Baixa, Média, Alta |
| Pontos | XP ao concluir (−/+) |
| Foco hoje | Secção **Agora** no dashboard |
| Data limite | Calendário e filtros |
| **Projeto** | Relação com a database **Projetos** |

**Vista Tabela**

- Edição directa nas células; **Nova linha** / apagar no rodapé ou ícone lixo.
- **Filtros:** pesquisa no título + Estado, Prioridade, **Projeto**, Data (com/sem), etc. — condições em **AND**.
- **Colunas:** ocultar/mostrar; **redimensionar** pela borda do cabeçalho.
- **Ordenação:** clica no cabeçalho (asc → desc → sem ordem).
- Preferências de filtros, ordem, larguras e colunas ocultas: **sessão do browser** (mesma tab).

**Vista Quadro (Kanban)**

- Colunas por **Estado**; **arrastar** cartões (⋮⋮); **Adicionar** por coluna.

**Vista Calendário**

- Por **data limite**.

**Vista Lista**

- Lista compacta com propriedades editáveis.

### 7.2 Database Hábitos

| Propriedade | Uso |
|-------------|-----|
| Hábito | Nome |
| Frequência | Diário / Semanal |
| Pontos | XP ao marcar feito |
| Feito hoje | Dashboard, streaks, XP |

**Vista Lista** — ideal para marcar **Feito hoje** (resposta rápida, optimista).

**Vista Tabela** — edição em grelha; filtros com **Feito hoje** (sim/não).

### 7.3 Database Objetivos

Metas de médio/longo prazo.

| Propriedade | Uso |
|-------------|-----|
| Objetivo | Nome |
| Estado | Não iniciado, Em progresso, Atingido |
| Área | Saúde, Carreira, Finanças, Pessoal, Outro |
| Prazo | Data-alvo |
| Prioridade | Alta, Média, Baixa |
| Progresso % | 0–100 manual |

**Vistas:** Tabela, Quadro. **⌘K** → «Novo objetivo».

### 7.4 Database Estudos

| Propriedade | Uso |
|-------------|-----|
| Disciplina | Matéria |
| Tópico | Capítulo / assunto |
| Estado | A estudar, Em revisão, Dominado |
| Data exame | Calendário |
| Prioridade | Alta, Média, Baixa |
| Minutos | Tempo planeado |

**Vistas:** Tabela, Quadro, Calendário. **⌘K** → «Novo tópico de estudo».

### 7.5 Database Projetos

Lista simples de projetos usada pela coluna **Projeto** em Tarefas. Cria linhas com nome e estado (Activo, Pausado, Concluído). Vista **Tabela**.

### 7.6 Operações comuns

| Tarefa | Onde |
|--------|------|
| Nova linha | Rodapé da vista ou ⌘K |
| Apagar linha | Ícone lixo + confirmação |
| Mudar estado | Tabela, Lista ou Quadro |
| Ajustar pontos | Coluna Pontos (Tarefas/Hábitos) |

**Campos de data:** ícone de calendário verde, com espaço à direita do texto.

---

## 8. Case — assistente

O **Case** é o coach integrado no LifeOS (Focus, Game e Finanças).

| Elemento | Onde | Função |
|---------|------|--------|
| **Botão hexagonal** | Canto inferior direito | Abre o painel de chat |
| **Painel Case** | Sobre a app | Conversa, respostas e propostas de acção |
| **Insights do dia** | Dashboard Agora | Atalhos para perguntas úteis |

### Como usar

1. Clica no **botão Case** (hexágono verde).
2. Escreve em português — ex.: «Como está o meu património?» ou «Regista despesa 20 euros».
3. Se o Case **propor uma acção** (criar conta, hábito, movimento…), revê o resumo e carrega **Confirmar** — nada é executado sem o teu OK.
4. Ao **fechar** o painel, a conversa desta sessão é apagada.

### Activar IA (opcional)

Se o administrador configurou Groq/OpenAI no servidor, podes activar **Activar IA** no painel. Os teus dados agregados e a mensagem são enviados ao provider — lê o aviso de privacidade na UI. Podes revogar a qualquer momento.

Sem IA externa, o Case usa o **motor local** (dados ficam no servidor LifeOS).

Detalhe técnico: [`CASE.md`](CASE.md)

---

## 9. Pontos e XP

1. Tarefas e hábitos têm **Pontos**.
2. **Concluir tarefa** ou **Feito hoje** em hábito → pontos no dia.
3. Dashboard: XP hoje, meta, semana, gráfico.
4. **Streaks** = dias seguidos com hábito feito.

Pontos sugeridos por prioridade/frequência; podes ajustar na célula.

---

## 10. Atalhos e dicas

| Atalho | Ação |
|--------|------|
| **⌘K** / **Ctrl+K** | Paleta de comandos |
| **/** (editor, bloco novo ou texto existente) | Menu slash |
| **Enter** | Confirmar paleta / enviar inbox |
| **↑ / ↓** | Navegar em paletas e slash |
| **ESC** | Fechar paleta de comandos |

**Dicas**

- **Inbox rápido** para capturar; organiza em Tarefas depois.
- Máximo **~3 focos** com «Foco hoje».
- **⌘K** para saltar entre workspace, página e database sem só usar o rato.

---

## 11. Sessão e conta

- Sessão persistente (token local).
- **Terminar sessão** na sidebar.
- Não uses credenciais de dev em produção pública.

---

## 12. Resolução de problemas

| Problema | O que tentar |
|----------|----------------|
| Dashboard vazio ou erro | API (`server`) a correr; **Tentar novamente** |
| Sem workspace Pessoal | `npm run prisma:seed` no servidor |
| Falta Objetivos/Estudos | Reabre o workspace ou cria um novo |
| Não renomeio workspace | Lápis no dashboard ou na sidebar (workspace activo) |
| Tarefas estranhas no seed | Apaga linhas em Tarefas/Hábitos ou ignora |
| XP “inventado” na semana | Vem do seed de demo; desaparece ao usar só os teus dados |
| Hábitos lentos | Recarrega; há actualização optimista |
| Pesquisa ⌘K vazia | Mínimo 2 caracteres |
| Login falha | Email/palavra-passe; `JWT_SECRET` e `DATABASE_URL` no `.env` |

---

## 13. Funcionalidades ainda em evolução

Ver [ROADMAP](ROADMAP.md). Resumo para utilizador:

- Template **planeamento semanal**
- Recuperação de palavra-passe na interface
- Relação tarefa → objetivo (só **Projeto** existe hoje)
- App móvel nativa e colaboração em tempo real
- Deploy público documentado (ver README quando disponível)

---

## 14. Glossário

| Termo | Significado |
|-------|-------------|
| **Workspace** | Espaço com páginas e databases |
| **Página** | Documento com blocos |
| **Database** | Tabela com linhas e propriedades |
| **Template** | Tipo: `TASKS`, `HABITS`, `GOALS`, `STUDIES`, `PROJECTS`, … |
| **Vista** | Tabela, Quadro, Calendário ou Lista |
| **Relação** | Coluna que liga a outra database (ex.: Projeto) |
| **XP / Pontos** | Pontuação por tarefas/hábitos |
| **Streak** | Dias seguidos com hábito feito |
| **Foco hoje** | Tarefa na secção **Agora** |
| **Case** | Assistente IA / coach — chat, insights e acções com confirmação |
| **Seed** | Dados iniciais de desenvolvimento na base de dados |

---

*Última atualização: maio 2026 — polish UX, templates Objetivos/Estudos, command palette, tabela avançada, mobile sidebar, seed e dashboard reais.*
