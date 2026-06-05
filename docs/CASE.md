# Case — Assistente LifeOS

**Estado:** C1 + C1+ v1 + **C2** entregues — Maio 2026  
Relacionado: [`MODULOS-FUTUROS.md`](MODULOS-FUTUROS.md) · [`FINANCEIRO.md`](FINANCEIRO.md) · [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md)

---

## O que é

**Case** é o coach integrado no LifeOS. Lê dados reais do utilizador (finanças, foco, Game) e responde em PT-PT — sem inventar saldos ou XP.

| Superfície | Descrição |
|------------|-----------|
| **Case Chat** | Painel lateral + botão flutuante (hexágono) em Focus, Game e Finanças |
| **Case Insights** | Widget «Insights do dia» no Painel Agora (Focus) |
| **Contexto** | Dashboard finanças, dívidas, categorias, método activo, tarefas/hábitos, perfil Game |
| **Motor local** | Respostas e acções via parser PT-PT — sem API externa |
| **Motor LLM** | OpenAI-compatível (Groq/OpenAI) com opt-in, streaming e tool calling |
| **Sessão efémera** | Ao fechar o painel, histórico apagado (DELETE no servidor) |
| **Rate limit** | 40 mensagens/hora por utilizador |

---

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/case/status` | LLM disponível, opt-in, engine, acções, streaming, privacidade |
| GET | `/api/case/insights?mode=focus` | Insights proactivos (C2) |
| POST | `/api/case/chat` | Nova conversa + 1.ª mensagem |
| POST | `/api/case/chat/stream` | Chat com SSE (C2) |
| GET | `/api/case/conversations` | Listar conversas |
| POST | `/api/case/conversations` | Criar conversa |
| GET | `/api/case/conversations/:id` | Detalhe + mensagens |
| POST | `/api/case/conversations/:id/messages` | Enviar mensagem |
| POST | `/api/case/conversations/:id/messages/stream` | Mensagem com SSE (C2) |
| POST | `/api/case/actions/:proposalId/confirm` | Executar acção proposta |
| POST | `/api/case/actions/:proposalId/cancel` | Descartar proposta |
| PATCH | `/api/case/actions/:proposalId` | Formulário / avançar para resumo |
| PATCH | `/api/case/settings/llm-opt-in` | Activar/revogar IA externa |
| DELETE | `/api/case/conversations/:id` | Apagar conversa |

Todas as rotas exigem autenticação (`Bearer` JWT).

---

## C1+ v1 — acções com confirmação

O Case pode **propor** alterações reais; nada é executado até o utilizador carregar **Confirmar**.

| Acção | Modo | Exemplo de frase |
|-------|------|------------------|
| `finance.create_account` | Finanças | «Cria uma conta poupança chamada Reserva» |
| `finance.create_movement` | Finanças | «Regista despesa 25 euros» |
| `finance.create_goal` | Finanças | «Cria meta Férias 2000 euros» |
| `focus.create_habit` | Focus | «Cria um hábito Beber água» |
| `focus.complete_habit` | Focus | «Marca o hábito Meditar como feito» |

**Fluxo:**

1. Parser local (`case-action-intent.ts`) ou LLM tool calling (C2) detecta intenção.
2. Servidor cria proposta in-memory (TTL 15 min) e devolve `proposal` no chat.
3. Fase `form` se faltarem campos (vários Espaços, conta, etc.).
4. **Ver resumo** → `PATCH .../actions/:id` com `advanceToSummary`.
5. **Confirmar** executa via `FinanceService` / `DatabaseService`; **Cancelar** descarta.

Propostas expiram ao fim de 15 minutos. Funciona **sem LLM** (parser local).

**E2E:** `web/e2e/case-c1.spec.ts`

---

## C2 — insights, streaming e LLM tools

| Feature | Descrição |
|---------|-----------|
| **Insights Agora** | `GET /api/case/insights` — regras locais (revisão pendente, hábitos, orçamento, método activo, poupança baixa). Widget no dashboard com CTA «Perguntar ao Case». |
| **Streaming SSE** | Com IA activa, respostas LLM token-a-token. Acções e fallback local devolvem evento `done` imediato. |
| **LLM tool calling** | Modelo chama tools OpenAI (`finance_create_account`, …) → proposta com confirmação humana. |

**Precedência por mensagem:** parser PT-PT local → LLM tools → LLM texto (stream) → coach local.

**E2E:** `web/e2e/case-c2.spec.ts`

### Insights — resposta exemplo

```json
{
  "generatedAt": "2026-05-30T12:00:00.000Z",
  "mode": "focus",
  "items": [
    {
      "id": "finance-weekly-review",
      "priority": "high",
      "text": "Revisão semanal pendente — fecha o ritual em Finanças.",
      "prompt": "O que devo rever na minha revisão semanal desta semana?",
      "mode": "finance"
    }
  ]
}
```

Prioridades: `high` · `medium` · `low`. Máximo 5 items por pedido.

### Streaming SSE — eventos

Content-Type: `text/event-stream`

| Evento | Payload | Quando |
|--------|---------|--------|
| `token` | `{ "delta": "..." }` | Chunk de texto LLM |
| `done` | `{ "message", "engine", "proposal?", "conversationId?" }` | Fim (texto, acção ou fallback) |
| `error` | `{ "message": "..." }` | Erro recoverável |

O frontend usa `streamCaseMessage()` em `web/src/services/caseApi.ts`. Rotas JSON (`/chat`, `/messages`) mantêm-se para fallback e testes.

### LLM tools (schema)

| Tool LLM | Acção Case |
|----------|------------|
| `finance_create_account` | `finance.create_account` |
| `finance_create_movement` | `finance.create_movement` |
| `finance_create_goal` | `finance.create_goal` |
| `focus_create_habit` | `focus.create_habit` |
| `focus_complete_habit` | `focus.complete_habit` |

Implementação: `server/case/case-llm-tools.ts`, `case-llm-tool-bridge.ts`.

---

## UI

| Componente | Ficheiro | Função |
|------------|----------|--------|
| `CaseAssistant` | `web/src/modules/case/components/CaseAssistant.tsx` | Monta FAB + painel |
| `CaseFab` | `CaseFab.tsx` | Botão hexagonal flutuante, luz rotativa |
| `CasePanel` | `CasePanel.tsx` | Chat, streaming, propostas |
| `CaseInsightsWidget` | `web/src/modules/dashboard/components/CaseInsightsWidget.tsx` | Widget Agora |
| `CaseIcon` | `CaseIcon.tsx` | Octaedro verde animado |
| `CaseActionProposalCard` | `CaseActionProposalCard.tsx` | Formulário + resumo + confirmar |

Ícone estático: `web/public/case-icon.png`.

---

## Arquitectura backend

```
server/
├── services/case.service.ts      # Pipeline chat, stream, insights, acções
├── routes/case.routes.ts
├── controllers/case.controller.ts
└── case/
    ├── case-context.ts           # buildCaseContext
    ├── case-fallback.ts          # Coach local
    ├── case-llm.ts               # LLM, tools, stream
    ├── case-insights.ts          # buildCaseInsights (C2)
    ├── case-action-intent.ts     # Parser PT-PT
    ├── case-action-form.ts       # Formulários e previews
    ├── case-action-store.ts      # Propostas in-memory (TTL 15 min)
    ├── case-action-tools.ts      # Execução
    └── case-action-types.ts
```

**Prisma:** `CaseConversation`, `CaseMessage` · migrações `20260608120000_case_c1`, `20260609120000_case_llm_opt_in`.

**Nota:** propostas de acção são **in-memory** — perdem-se no restart do servidor.

---

## Configuração LLM (opcional)

### Groq (recomendado)

```env
CASE_LLM_PROVIDER=groq
CASE_LLM_API_KEY=gsk_...
# Defaults: https://api.groq.com/openai/v1 + llama-3.3-70b-versatile
```

Chave: [console.groq.com/keys](https://console.groq.com/keys)

### OpenAI

```env
CASE_LLM_PROVIDER=openai
CASE_LLM_API_KEY=sk-proj-...
CASE_LLM_MODEL=gpt-4o-mini
CASE_LLM_BASE_URL=https://api.openai.com/v1
```

Sem chave → motor local apenas. Streaming e tool calling LLM requerem chave **e** opt-in do utilizador.

Ver também [`DEPLOY.md`](DEPLOY.md) (variáveis Railway).

---

## Privacidade

| Camada | Comportamento |
|--------|----------------|
| **Motor local + insights** | Nenhum dado sai do servidor |
| **LLM externo** | Só após opt-in (`caseLlmOptIn`) |
| **Contexto LLM** | Agregados — sem nomes de contas, emails, notas nem títulos de tarefas |
| **Mensagens do user** | Texto enviado ao provider — aviso na UI |
| **Histórico chat** | Apagado ao fechar o painel Case |

Revogar IA: PATCH `/api/case/settings/llm-opt-in` com `{ "optIn": false }` ou botão na UI.

---

## Fora de scope (C3+)

- Case no Command Palette
- Enterprise / equipas
- Agente autónomo multi-step sem confirmação
- Mais acções (tarefas, transferências, editar conta)
- Insights personalizados via LLM

---

## Testes

| Ficheiro | Cobertura |
|----------|-----------|
| `web/e2e/case-c1.spec.ts` | API chat, status, acções C1+ |
| `web/e2e/case-c2.spec.ts` | Insights, streaming, status C2, widget Agora |

```bash
cd web && npx playwright test case-c1.spec.ts case-c2.spec.ts
```

---

## Desenvolvimento local

```bash
npm run build   # server + web
npm run dev     # API :3333 + Vite :5173
```

Se acções C1+ devolverem 404, o servidor em execução está desactualizado — rebuild + restart.
