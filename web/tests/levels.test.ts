import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  globalRankFromLevel,
  levelFromTotalXp,
  levelProgress,
  rankTitleForLevel,
  xpRequiredForLevel,
} from "../../server/gamification/levels";

describe("gamification levels", () => {
  it("xpRequiredForLevel grows with level", () => {
    assert.ok(xpRequiredForLevel(5) > xpRequiredForLevel(1));
  });

  it("levelFromTotalXp starts at 1", () => {
    assert.equal(levelFromTotalXp(0), 1);
    assert.equal(levelFromTotalXp(50), 1);
  });

  it("globalRankFromLevel maps RPG ranks E–SSS", () => {
    assert.deepEqual(globalRankFromLevel(1), { rank: "E", label: "Iniciante" });
    assert.deepEqual(globalRankFromLevel(10), { rank: "D", label: "Aprendiz" });
    assert.deepEqual(globalRankFromLevel(37), { rank: "B", label: "Executor" });
    assert.deepEqual(globalRankFromLevel(95), { rank: "SSS", label: "Lendário" });
  });

  it("rankTitleForLevel uses Rank · Label", () => {
    assert.equal(rankTitleForLevel(37), "B · Executor");
  });

  it("levelProgress returns bounded percent", () => {
    const p = levelProgress(250);
    assert.ok(p.percent >= 0 && p.percent <= 100);
    assert.ok(p.level >= 1);
    assert.equal(p.rank, "E");
  });
});
