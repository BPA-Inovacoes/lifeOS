# LifeOS — Notas de performance (Fase 4)

Auditoria rápida (Maio 2026) após refinamento das Fases 1–3.

## Frontend (React / TanStack Query)

| Área | Estado | Notas |
|------|--------|-------|
| **staleTime global** | ✅ | `2 min` em `main.tsx` — menos refetch desnecessário |
| **gcTime** | ✅ | `10 min` — cache de queries inactivas |
| **refetchOnWindowFocus** | ✅ | Desactivado — evita picos ao mudar de tab |
| **Virtualização tabela** | ✅ | `useTableVirtualizer` quando >120 linhas |
| **Debounce pesquisa** | ✅ | Paleta 280ms, filtros locais |
| **Bundle** | ⚠️ | Chunk principal ~600kB — considerar code-split por rota no futuro |

## Backend (Express / Prisma)

| Área | Estado | Notas |
|------|--------|-------|
| **Batch streaks/hábitos** | ✅ | `getHabitRowActivityBatch` — uma query por lote |
| **Logs HTTP** | ✅ | `pino-http` ignora `/health` |
| **Índices Prisma** | ✅ | `PointsEvent` por `rowId` + `date` |

## Recomendações futuras

1. `React.lazy` para `DatabasePage`, editor e dashboard.
2. Paginação server-side quando bases >500 linhas.
3. Compressão `gzip` no reverse proxy (Vercel/Railway).
