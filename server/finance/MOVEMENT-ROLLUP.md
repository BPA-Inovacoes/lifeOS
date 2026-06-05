# Padrão de movimentos — detalhe + resumo

## Regra

1. Na base de dados ficam **no máximo 25** movimentos em **detalhe** (`FinanceMovement`).
2. Ao criar o **26.º**, os **25 mais antigos** são:
   - agregados num único **resumo** (`FinanceMovementRollup`);
   - **apagados** da tabela de detalhe.
3. O processo repete-se enquanto houver mais de 25 em detalhe (recursivo após cada lote).

## ID do resumo

```
fin-roll-{userId8}-{sequência 6 dígitos}
```

Exemplo: `fin-roll-clx9ab12-000001`, `fin-roll-clx9ab12-000002`.

- `sequência` é única por utilizador (1, 2, 3…).
- O prefixo `fin-roll` identifica sempre um lote compactado.

## Conteúdo do resumo

| Campo | Uso |
|--------|-----|
| `periodFrom` / `periodTo` | Datas do movimento mais antigo e mais recente do lote |
| `count` | Normalmente 25 |
| `totals` | Receitas, despesas, poupança + `byMonth` + **`entries`** (snapshot UI) |
| `lines` | Replay para **saldos** (património correcto) |

## Ver detalhe na app

- Clica num resumo na lista (`Ver 25 movimentos →`).
- API: `GET /api/finance/movement-rollups/:rollupId` → `{ rollup: { entries: [...] } }`.
- Resumos criados antes do campo `entries` mostram dados parciais reconstruídos a partir de `lines`.

Os saldos das contas usam: movimentos em detalhe **+** todas as `lines` dos resumos.

## API / UI

- A listagem devolve detalhe + resumos (`type: "SUMMARY"`, `isRollup: true`).
- Filtros (tipo, conta, categoria, datas, pesquisa) aplicam-se também aos resumos via `entries` (resumos legados só filtram tipo/conta/datas).
- Top categorias, envelopes e fluxo mensal incluem despesas/receitas compactadas.
- Export Excel: folhas separadas + `Movimentos` unificada.
- **Revisão semanal:** totais da semana incluem movimentos em detalhe + resumos: com `entries` datadas filtra por dia; resumos legados (sem data) usam overlap do `periodFrom`–`periodTo` com a semana (proporcional).

## Constante

`FINANCE_MOVEMENT_DETAIL_CAP = 25` em `server/finance/movement-rollup.ts`.
