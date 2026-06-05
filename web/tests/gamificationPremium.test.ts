import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { attributeTier, mergeLegacyAttributeValues } from "../../server/gamification/attributes";
import { resolvePlayerClass } from "../../server/gamification/classes";
import { attributeDeltasForHabit, normalizeHabitRpgArea } from "../../server/gamification/habit-areas";
import { lifeCoinsForActivity, lifeCoinsForMission } from "../../server/gamification/life-coins";
import { missionIncrement } from "../../server/gamification/missions";
import { isClientClosed, suggestClientPoints } from "../../server/utils/points";
import { baseXpForActivity } from "../../server/gamification/xp-rules";
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

  it("migra atributos v0 para v1", () => {
    const merged = mergeLegacyAttributeValues([
      { key: "focus", value: 40 },
      { key: "execution", value: 100 },
    ]);
    assert.ok(merged.discipline > 40);
    assert.ok(merged.leadership > 0);
  });

  it("resolve classe do jogador", () => {
    const academic = resolvePlayerClass({ knowledge: 65 });
    assert.equal(academic.key, "academic");

    const adventurer = resolvePlayerClass({ knowledge: 10 });
    assert.equal(adventurer.key, "adventurer");
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
    assert.equal(
      missionIncrement("tasks-10", { type: "task.completed" }, 10),
      1
    );
  });

  it("normaliza área RPG de hábitos", () => {
    assert.equal(normalizeHabitRpgArea("Saúde"), "Saúde");
    assert.equal(normalizeHabitRpgArea("espiritual"), "Espiritualidade");
  });

  it("distribui XP de hábitos por área", () => {
    const health = attributeDeltasForHabit(10, "Saúde");
    assert.ok((health.health ?? 0) > (health.discipline ?? 0));
  });

  it("reconhece cliente fechado e pontos", () => {
    assert.equal(isClientClosed("Fechado"), true);
    assert.equal(suggestClientPoints(6000), 400);
    assert.equal(baseXpForActivity({ type: "client.closed", points: 300 }), 300);
  });

  it("calcula LifeCoins por actividade", () => {
    assert.equal(lifeCoinsForActivity({ type: "client.closed" }, 300), 15);
    assert.equal(lifeCoinsForActivity({ type: "habit.completed" }, 5), 1);
    assert.equal(lifeCoinsForMission(120), 12);
  });

  it("incrementa missão semanal de clientes", () => {
    assert.equal(
      missionIncrement("clients-1", { type: "client.closed" }, 300),
      1
    );
  });
});
