import type { AttributeKey } from "./attributes";

export function normalizeGoalArea(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function attributeDeltasForGoal(
  xp: number,
  area: unknown
): Partial<Record<AttributeKey, number>> {
  const key = normalizeGoalArea(area);

  if (key.includes("finan")) {
    return { finance: xp * 0.5, leadership: xp * 0.3, discipline: xp * 0.2 };
  }
  if (key.includes("saú") || key.includes("sau")) {
    return { health: xp * 0.5, discipline: xp * 0.3, leadership: xp * 0.2 };
  }
  if (key.includes("carre")) {
    return { leadership: xp * 0.4, knowledge: xp * 0.35, finance: xp * 0.25 };
  }
  if (key.includes("pesso")) {
    return {
      relationships: xp * 0.45,
      spirituality: xp * 0.25,
      discipline: xp * 0.3,
    };
  }

  return {
    leadership: xp * 0.35,
    discipline: xp * 0.35,
    knowledge: xp * 0.15,
    finance: xp * 0.15,
  };
}
