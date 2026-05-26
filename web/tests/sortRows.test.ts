import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DatabaseProperty, DatabaseRow } from "../src/types/database";

import {
  nextTableSort,
  normalizeTableSort,
  sortTableRows,
} from "../src/database/utils/sortRows";

const props: DatabaseProperty[] = [
  { id: "t1", name: "Título", type: "TEXT", sortOrder: 0, config: {} },
  { id: "n1", name: "Pontos", type: "NUMBER", sortOrder: 1, config: {} },
];

const rows: DatabaseRow[] = [
  { id: "r1", sortOrder: 0, properties: { t1: "Zebra", n1: 1 } },
  { id: "r2", sortOrder: 1, properties: { t1: "Alpha", n1: 10 } },
  { id: "r3", sortOrder: 2, properties: { t1: "Beta", n1: 5 } },
];

describe("sortTableRows multi-sort", () => {
  it("normalizeTableSort — legacy single", () => {
    const s = normalizeTableSort({ propId: "t1", direction: "asc" });
    assert.equal(s.length, 1);
    assert.equal(s[0]!.propId, "t1");
  });

  it("ordena por uma coluna", () => {
    const out = sortTableRows(rows, props, [{ propId: "t1", direction: "asc" }]);
    assert.deepEqual(out.map((r) => r.id), ["r2", "r3", "r1"]);
  });

  it("multi-sort — título asc, depois pontos desc", () => {
    const data: DatabaseRow[] = [
      { id: "a", sortOrder: 0, properties: { t1: "X", n1: 1 } },
      { id: "b", sortOrder: 1, properties: { t1: "X", n1: 3 } },
      { id: "c", sortOrder: 2, properties: { t1: "Y", n1: 99 } },
    ];
    const out = sortTableRows(data, props, [
      { propId: "t1", direction: "asc" },
      { propId: "n1", direction: "desc" },
    ]);
    assert.deepEqual(out.map((r) => r.id), ["b", "a", "c"]);
  });

  it("nextTableSort — shift adiciona critério", () => {
    const s1 = nextTableSort([], "t1", { additive: false });
    assert.deepEqual(s1, [{ propId: "t1", direction: "asc" }]);
    const s2 = nextTableSort(s1, "n1", { additive: true });
    assert.equal(s2.length, 2);
  });
});
