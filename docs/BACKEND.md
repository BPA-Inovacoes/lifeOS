# LifeOS — Estratégia backend

## Stack (fixa)

Node.js 20+, Express, TypeScript, Prisma, Neon PostgreSQL, Zod, JWT, bcrypt.

## Estrutura `server/`

```
server/
├── index.ts           # Bootstrap
├── routes/
├── controllers/       # HTTP fino
├── services/          # Regras de negócio + Prisma
├── middlewares/
├── prisma/
├── utils/
└── types/
```

## Padrão por feature

1. **Zod schemas** no service (`parseCreate`, `parseUpdate`)
2. **Service** com `AppError` para 4xx
3. **Controller** try/catch → `next(e)`
4. **Routes** + `requireAuth()` onde aplicável

## Autorização workspace

Função interna `assertWorkspaceAccess(userId, workspaceId, minRole?)`:

- `OWNER` / `ADMIN` — escrita total
- `MEMBER` — CRUD páginas/blocos
- `VIEWER` — leitura (futuro)

## JSON flexível

- `Block.content` — payload por tipo de bloco
- `DatabaseProperty.config` — opções de select, fórmulas, etc.
- `DatabaseView.config` — filtros, groupBy, sort
- `DatabaseRow.properties` — valores por property id

Validação Zod por operação, não no Prisma.

## Bases de dados

- **Default** — ao criar/editar o espaço, `provisionWorkspaceDatabases` garante templates (`TASKS`, `HABITS`, …) uma vez por tipo.
- **Personalizadas** — `POST /workspaces/:workspaceId/databases` com `{ name, icon? }` cria `template: CUSTOM` (Título + Estado, vistas Tabela/Quadro). Não substitui as default.

## Modo Finanças (F1.0)

Módulo em `server/finance/` + `FinanceService`. Migração `20260530200000_finance_f1`.

| Rota | Descrição |
|------|-----------|
| `GET /finance/dashboard` | Património, contas, resumo |
| `GET/POST /finance/accounts` | Contas (corrente, poupança, cartão, investimento, empréstimo) |
| `PATCH /finance/accounts/:id` | Editar/arquivar conta |
| `GET/POST /finance/movements` | Receitas, despesas, transferências |
| `GET /finance/categories` | Categorias seed por utilizador |
| `GET /finance/methods` | Catálogo + progresso |
| `POST /finance/methods/:methodId/start` | Activar método |
| `POST /finance/methods/active/advance` | Avançar passo |
| `GET /finance/reviews/current` | Revisão semanal da semana |
| `POST /finance/reviews` | Registar revisão |
| `GET /finance/profile` | Moeda e preferências |
| `PATCH /finance/profile` | Alterar moeda (`{ currency: "USD" }`) — actualiza também todas as contas |
| Moeda inicial | Detectada no **primeiro acesso** via `Accept-Language` + header `X-Timezone` (browser) |

Todas as rotas exigem `requireAuth()`. Saldos calculados em `finance-balance.ts` (sem double-entry).


Prefixo implícito v1. Breaking changes → `/v2` ou header `Accept-Version`.

## Case (assistente)

Módulo em `server/case/` + `CaseService`. Rotas `/case/*`.

| Área | Ficheiros |
|------|-----------|
| Chat | `case.service.ts`, `case-llm.ts`, `case-fallback.ts` |
| Acções C1+ | `case-action-intent.ts`, `case-action-tools.ts`, store in-memory |
| C2 | `case-insights.ts`, streaming em `case.controller.ts`, `case-llm-tools.ts` |

Variáveis: `CASE_LLM_*` (opcional). Spec: [`CASE.md`](CASE.md)

## Scripts

```bash
npm run dev
npm run prisma:migrate
npm run prisma:seed
npm run prisma:deploy
```
