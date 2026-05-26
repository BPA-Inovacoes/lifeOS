import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DatabaseProperty, DatabaseRow } from "../src/types/database";

import {
  emptyTableFilters,
  filterTableRows,
  hasActiveFilters,
  normalizeTableFilters,
} from "../src/database/utils/filterRows";

const props: DatabaseProperty[] = [
  { id: "t1", name: "Título", type: "TEXT", sortOrder: 0, config: {} },
  { id: "s1", name: "Estado", type: "STATUS", sortOrder: 1, config: {} },
  { id: "d1", name: "Data limite", type: "DATE", sortOrder: 2, config: {} },
  { id: "p1", name: "Pontos", type: "NUMBER", sortOrder: 3, config: {} },
];

const rows: DatabaseRow[] = [
  {
    id: "r1",
    sortOrder: 0,
    properties: {
      t1: "Comprar leite",
      s1: "A fazer",
      d1: "2026-06-01",
      p1: 5,
    },
  },
  {
    id: "r2",
    sortOrder: 1,
    properties: {
      t1: "Reunião",
      s1: "Feito",
      d1: "2026-01-15",
      p1: 20,
    },
  },
  {
    id: "r3",
    sortOrder: 2,
    properties: { t1: "Ginásio", s1: "A fazer", d1: null, p1: null },
  },
];

describe("filterTableRows", () => {
  it("devolve todas as linhas sem filtros activos", () => {
    const f = emptyTableFilters();
    assert.equal(hasActiveFilters(f), false);
    assert.equal(filterTableRows(rows, props, f).length, 3);
  });

  it("filtra por pesquisa em texto (AND)", () => {
    const f = { search: "leite", logic: "and" as const, byProperty: {} };
    const out = filterTableRows(rows, props, f);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.id, "r1");
  });

  it("filtra por propriedade STATUS", () => {
    const f = { search: "", logic: "and" as const, byProperty: { s1: "Feito" } };
    const out = filterTableRows(rows, props, f);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.id, "r2");
  });

  it("modo OR — qualquer filtro de coluna", () => {
    const f = {
      search: "",
      logic: "or" as const,
      byProperty: { s1: "Feito", d1: "date:empty" },
    };
    const out = filterTableRows(rows, props, f);
    assert.equal(out.length, 2);
    assert.deepEqual(
      out.map((r) => r.id).sort(),
      ["r2", "r3"]
    );
  });

  it("filtro DATE before", () => {
    const f = {
      search: "",
      logic: "and" as const,
      byProperty: { d1: "date:before:2026-03-01" },
    };
    const out = filterTableRows(rows, props, f);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.id, "r2");
  });

  it("filtro NUMBER gt", () => {
    const f = {
      search: "",
      logic: "and" as const,
      byProperty: { p1: "num:gt:10" },
    };
    const out = filterTableRows(rows, props, f);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.id, "r2");
  });

  it("normalizeTableFilters — prefs antigas", () => {
    const n = normalizeTableFilters({ search: "x", byProperty: { s1: "Feito" } });
    assert.equal(n.logic, "and");
    assert.equal(n.search, "x");
  });
});
