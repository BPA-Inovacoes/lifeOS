import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildHabitHeatmap,
  buildHabitRowStats,
  computeHabitConsistency,
  computeWeeklyHabitStreak,
  weekStartKey,
} from "../../server/utils/habit-stats";
import { addDays, toDayDate, toDayKey } from "../../server/utils/day";

describe("computeWeeklyHabitStreak", () => {
  it("conta semanas consecutivas com pelo menos um evento", () => {
    const today = toDayDate();
    const dates = [today, addDays(today, -7), addDays(today, -14)];
    assert.equal(computeWeeklyHabitStreak(dates), 3);
  });

  it("retorna 0 se a semana actual e anterior estão vazias", () => {
    const today = toDayDate();
    const dates = [addDays(today, -21)];
    assert.equal(computeWeeklyHabitStreak(dates), 0);
  });
});

describe("buildHabitRowStats", () => {
  it("usa streak semanal para frequência Semanal", () => {
    const today = toDayDate();
    const dates = [today, addDays(today, -7)];
    const stats = buildHabitRowStats(dates, "weekly", true);
    assert.equal(stats.frequency, "weekly");
    assert.equal(stats.streak, 2);
    assert.equal(stats.heatmap.length, 90);
  });

  it("calcula consistência diária nos últimos 30 dias", () => {
    const today = toDayDate();
    const keys = new Set<string>();
    for (let i = 0; i < 15; i++) {
      keys.add(toDayKey(addDays(today, -i)));
    }
    const { consistency } = computeHabitConsistency(keys, "daily", 30);
    assert.equal(consistency, 50);
  });
});

describe("buildHabitHeatmap", () => {
  it("gera 90 células", () => {
    assert.equal(buildHabitHeatmap(new Set(), 90).length, 90);
  });
});

describe("weekStartKey", () => {
  it("devolve segunda-feira da semana", () => {
    const wed = new Date(2026, 4, 21);
    assert.equal(weekStartKey(wed), "2026-05-18");
  });
});
