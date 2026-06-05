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
| `DATABASE_URL` | URL Neon **pooler** (`-pooler` no hostname) — runtime da API |
| `DIRECT_URL` | URL Neon **directa** (sem `-pooler`) — `prisma migrate deploy` |
| `JWT_SECRET` | segredo longo aleatório |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `3333` (Railway injecta `PORT` — usar o da plataforma) |
| `CLIENT_ORIGIN` | `https://teu-app.vercel.app` |
| `SEED_DEMO` | `false` em produção |
| `LOG_LEVEL` | `info` (prod) / `debug` (dev) |
| `CASE_LLM_API_KEY` | Opcional — motor LLM Case (Groq/OpenAI) |
| `CASE_LLM_PROVIDER` | Opcional — `groq` · `openai` · `custom` |
| `CASE_LLM_MODEL` | Opcional — ex. `llama-3.3-70b-versatile`, `gpt-4o-mini` |
| `CASE_LLM_BASE_URL` | Opcional — URL OpenAI-compat (default por provider) |

Sem `CASE_LLM_API_KEY`, o Case funciona só com **coach local** (insights e parser PT-PT). Ver [`CASE.md`](CASE.md).

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

### Variáveis na Vercel

#### Recomendado

Usar o proxy `/api` da própria Vercel e definir **só esta** variável:

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| `API_BASE_URL` | Sim | `https://lifeos-api-production.up.railway.app` |

Com esta opção:

- o frontend continua a chamar `/api/...`
- a Vercel encaminha para a tua API real
- não precisas de expor a URL da API no bundle do browser

#### Opcional

Se preferires que o frontend chame a API directamente, podes usar:

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Não | `https://lifeos-api-production.up.railway.app` |

Se definires `VITE_API_BASE_URL`, o frontend deixa de usar `/api` e passa a chamar a API directamente.

#### Não uses as duas ao mesmo tempo sem necessidade

- **Recomendado em produção:** `API_BASE_URL`
- **Só se quiseres ligação directa browser -> API:** `VITE_API_BASE_URL`

### Valores práticos para pôr na Vercel

Em `Project Settings -> Environment Variables`:

```bash
API_BASE_URL=https://URL-DA-TUA-API
```

Exemplo:

```bash
API_BASE_URL=https://lifeos-api-production.up.railway.app
```

Se preferires ligação directa:

```bash
VITE_API_BASE_URL=https://lifeos-api-production.up.railway.app
```

### Configuração recomendada na Vercel

Se o projecto estiver apontado para a raiz:

- Install Command: `cd web && npm ci`
- Build Command: `cd web && npm run build`
- Output Directory: `web/dist`

Se o projecto estiver com `Root Directory = web`:

- Install Command: automático da Vercel ou `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

SPA: `vercel.json` com rewrite para `index.html`, preservando `/api/*` para o proxy serverless.

### Depois do deploy

Abre o frontend e confirma no browser:

- o login não chama `https://teu-front.vercel.app/api/...` com `405`
- o request `/api/auth/login` responde da tua API
- a app entra normalmente após autenticação

## CORS

O servidor aceita origens listadas em `CLIENT_ORIGIN` (várias separadas por vírgula). Em produção inclui apenas o domínio do frontend.

## Seed (opcional, só dev/staging)

```bash
cd server && SEED_DEMO=false npx prisma db seed
```

Com `SEED_DEMO=false` não cria linhas de exemplo nem histórico XP demo.

## Checklist pós-deploy

- [ ] Login e criação de workspace (pode demorar ~10s na primeira vez — timeout Prisma aumentado)
- [ ] `API_BASE_URL` configurado na Vercel com a URL pública da API
- [ ] ou `VITE_API_BASE_URL` configurado se preferires ligação directa
- [ ] HTTPS em ambos os lados
- [ ] Migrates aplicadas (`prisma migrate deploy`)
