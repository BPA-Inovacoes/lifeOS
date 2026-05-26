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

1. Root: `web/`
2. Build: `npm run build` · Output: `dist`
3. Variável:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL pública da API (ex. `https://api.teu-dominio.railway.app`) |

4. SPA: ficheiro `web/vercel.json` com rewrite para `index.html`.

## CORS

O servidor aceita origens listadas em `CLIENT_ORIGIN` (várias separadas por vírgula). Em produção inclui apenas o domínio do frontend.

## Seed (opcional, só dev/staging)

```bash
cd server && SEED_DEMO=false npx prisma db seed
```

Com `SEED_DEMO=false` não cria linhas de exemplo nem histórico XP demo.

## Checklist pós-deploy

- [ ] Login e criação de workspace (pode demorar ~10s na primeira vez — timeout Prisma aumentado)
- [ ] `VITE_API_URL` correcto no build Vercel
- [ ] HTTPS em ambos os lados
- [ ] Migrates aplicadas (`prisma migrate deploy`)
