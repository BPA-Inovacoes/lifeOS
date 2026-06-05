import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  collectRollupCategoryTotalsForMonth,
  rollupMatchesListFilters,
  type RollupTotalsStored,
} from "../finance/movement-rollup.js";

const rollupBase = {
  periodFrom: new Date("2026-05-01T12:00:00.000Z"),
  periodTo: new Date("2026-05-31T12:00:00.000Z"),
  lines: [
    { type: "EXPENSE" as const, accountId: "acc-1", transferDestAccountId: null, amount: 50 },
  ],
};

describe("rollupMatchesListFilters", () => {
  it("inclui resumo com filtro de tipo quando uma entry corresponde", () => {
    const totals: RollupTotalsStored = {
      income: 0,
      expense: 50,
      savingsTransfer: 0,
      byMonth: {},
      entries: [
        {
          id: "m1",
          type: "EXPENSE",
          accountId: "acc-1",
          accountName: "Conta",
          transferDestAccountId: null,
          transferDestAccountName: null,
          amount: 50,
          date: "2026-05-10",
          categoryId: "cat-food",
          categoryName: "Alimentação",
          note: "Mercado",
        },
      ],
    };

    assert.equal(
      rollupMatchesListFilters({ ...rollupBase, totals }, { type: "EXPENSE" }),
      true
    );
    assert.equal(
      rollupMatchesListFilters({ ...rollupBase, totals }, { type: "INCOME" }),
      false
    );
  });

  it("filtra por categoria e pesquisa nas entries", () => {
    const totals: RollupTotalsStored = {
      income: 0,
      expense: 12,
      savingsTransfer: 0,
      byMonth: {},
      entries: [
        {
          id: "m1",
          type: "EXPENSE",
          accountId: "acc-1",
          accountName: "Conta",
          transferDestAccountId: null,
          transferDestAccountName: null,
          amount: 12,
          date: "2026-05-04",
          categoryId: "cat-edu",
          categoryName: "Educação",
          note: "Livros",
        },
      ],
    };

    assert.equal(
      rollupMatchesListFilters({ ...rollupBase, totals }, { categoryId: "cat-edu" }),
      true
    );
    assert.equal(
      rollupMatchesListFilters({ ...rollupBase, totals }, { q: "educação" }),
      true
    );
    assert.equal(
      rollupMatchesListFilters({ ...rollupBase, totals }, { q: "transporte" }),
      false
    );
  });
});

describe("collectRollupCategoryTotalsForMonth", () => {
  it("soma despesas por categoria a partir das entries", () => {
    const totals: RollupTotalsStored = {
      income: 0,
      expense: 62,
      savingsTransfer: 0,
      byMonth: { "2026-05": { income: 0, expense: 62, savingsTransfer: 0 } },
      entries: [
        {
          id: "m1",
          type: "EXPENSE",
          accountId: "acc-1",
          accountName: "Conta",
          transferDestAccountId: null,
          transferDestAccountName: null,
          amount: 50,
          date: "2026-05-10",
          categoryId: "cat-food",
          categoryName: "Alimentação",
          note: null,
        },
        {
          id: "m2",
          type: "EXPENSE",
          accountId: "acc-1",
          accountName: "Conta",
          transferDestAccountId: null,
          transferDestAccountName: null,
          amount: 12,
          date: "2026-05-12",
          categoryId: "cat-edu",
          categoryName: "Educação",
          note: null,
        },
      ],
    };

    const map = collectRollupCategoryTotalsForMonth([{ totals }], "2026-05", "EXPENSE");
    assert.equal(map.get("cat-food")?.total, 50);
    assert.equal(map.get("cat-edu")?.total, 12);
  });
});
