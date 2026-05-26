import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { attributeTier } from "../../server/gamification/attributes";
import { missionIncrement } from "../../server/gamification/missions";
import { phaseForLevel, phaseProgress } from "../../server/gamification/phases";
import { canPrestige, prestigeLabel } from "../../server/gamification/prestige";

describe("gamification premium helpers", () => {
  it("mapeia phases por intervalo de níveis", () => {
    assert.equal(phaseForLevel(1).label, "Awakening");
    assert.equal(phaseForLevel(18).label, "Momentum");
    assert.equal(phaseForLevel(72).label, "Transcendence");
    assert.equal(phaseForLevel(99).label, "God Mode");
  });

  it("expõe progresso dentro da phase actual", () => {
    const progress = phaseProgress(14);
    assert.equal(progress.phase.label, "Momentum");
    assert.ok(progress.completedLevels > 0);
    assert.ok(progress.percent > 0 && progress.percent <= 100);
  });

  it("classifica attributes em tiers", () => {
    assert.equal(attributeTier(10), "F");
    assert.equal(attributeTier(250), "B");
    assert.equal(attributeTier(980), "SSS");
  });

  it("reconhece disponibilidade de prestige", () => {
    assert.equal(canPrestige(99), false);
    assert.equal(canPrestige(100), true);
    assert.equal(prestigeLabel(2), "Prestige II");
  });

  it("calcula incremento de missão dinâmica", () => {
    assert.equal(
      missionIncrement(
        "habits-all",
        { type: "habit.completed", allHabitsCompletedToday: true },
        5
      ),
      1
    );
    assert.equal(
      missionIncrement(
        "study-60",
        { type: "study.session.completed", studyMinutesDelta: 30 },
        20
      ),
      30
    );
  });
});
