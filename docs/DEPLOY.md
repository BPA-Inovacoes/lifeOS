# LifeOS — Deploy (Vercel + Railway)

Guia mínimo para colocar **web** (Vite/React) e **server** (Express/Prisma) em produção.

## Pré-requisitos

- Base de dados **PostgreSQL** (recomendado: [Neon](https://neon.tech))
- `JWT_SECRET` com ≥ 16 caracteres
- `CLIENT_ORIGIN` com o URL público do frontend (sem barra final)

## Server (Railway ou similar)

1. Novo serviço Node 20+, root: `server/`
2. Variáveis de ambiente:

| Variável | Exemplo |
|----------|---------|
| `DATABASE_URL` | URL Neon com `?sslmode=require` |
| `JWT_SECRET` | segredo longo aleatório |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `3333` (Railway injecta `PORT` — usar o da plataforma) |
| `CLIENT_ORIGIN` | `https://teu-app.vercel.app` |
| `SEED_DEMO` | `false` em produção |
| `LOG_LEVEL` | `info` (prod) / `debug` (dev) |

3. Comandos de build/start:

```bash
npm ci
npm run prisma:generate
npm run build
npm run prisma:deploy
npm start
```

4. Health: `GET /health` deve responder `{ "ok": true }`.

## Web (Vercel)

Opção A: definir **Root Directory** como `web/`  
Opção B: apontar a Vercel para a raiz do repo e usar o `vercel.json` da raiz.

Build: `npm run build` · Output: `dist` (ou `web/dist` se o projecto estiver na raiz)

Variáveis:

| Variável | Valor |
|----------|-------|
| `API_BASE_URL` | URL pública da API para o proxy `/api` da Vercel |
| `VITE_API_BASE_URL` | opcional; se definires, o frontend chama a API directamente |

SPA: `vercel.json` com rewrite para `index.html`, preservando `/api/*` para o proxy serverless.

## CORS

O servidor aceita origens listadas em `CLIENT_ORIGIN` (várias separadas por vírgula). Em produção inclui apenas o domínio do frontend.

## Seed (opcional, só dev/staging)

```bash
cd server && SEED_DEMO=false npx prisma db seed
```

Com `SEED_DEMO=false` não cria linhas de exemplo nem histórico XP demo.

## Checklist pós-deploy

- [ ] Login e criação de workspace (pode demorar ~10s na primeira vez — timeout Prisma aumentado)
- [ ] `API_BASE_URL` configurado na Vercel
- [ ] ou `VITE_API_BASE_URL` configurado se preferires ligação directa
- [ ] HTTPS em ambos os lados
- [ ] Migrates aplicadas (`prisma migrate deploy`)
