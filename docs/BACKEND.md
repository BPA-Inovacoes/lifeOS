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

## Versionamento API

Prefixo implícito v1. Breaking changes → `/v2` ou header `Accept-Version`.

## Scripts

```bash
npm run dev
npm run prisma:migrate
npm run prisma:seed
npm run prisma:deploy
```
