import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
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

  it("rankTitleForLevel maps milestones", () => {
    assert.equal(rankTitleForLevel(1), "Wanderer");
    assert.equal(rankTitleForLevel(10), "Awakened");
    assert.equal(rankTitleForLevel(50), "LifeOS Master");
  });

  it("levelProgress returns bounded percent", () => {
    const p = levelProgress(250);
    assert.ok(p.percent >= 0 && p.percent <= 100);
    assert.ok(p.level >= 1);
  });
});
