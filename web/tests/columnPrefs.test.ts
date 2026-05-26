import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DatabaseProperty } from "../src/types/database";

import {
  emptyColumnPrefs,
  orderedVisibleProperties,
  reorderColumn,
} from "../src/database/utils/columnPrefs";

const properties: DatabaseProperty[] = [
  { id: "a", name: "A", type: "TEXT", sortOrder: 0, config: {} },
  { id: "b", name: "B", type: "TEXT", sortOrder: 1, config: {} },
  { id: "c", name: "C", type: "TEXT", sortOrder: 2, config: {} },
];

describe("columnPrefs", () => {
  it("orderedVisibleProperties — ordem personalizada", () => {
    const prefs = { ...emptyColumnPrefs(), order: ["c", "a"] };
    const ids = orderedVisibleProperties(properties, prefs).map((p) => p.id);
    assert.deepEqual(ids, ["c", "a", "b"]);
  });

  it("reorderColumn — move B para início", () => {
    const next = reorderColumn(emptyColumnPrefs(), properties, "b", "a");
    const ids = orderedVisibleProperties(properties, next).map((p) => p.id);
    assert.deepEqual(ids, ["b", "a", "c"]);
  });
});
