import type { AttributeKey } from "./attributes";

/** Opções da coluna «Área RPG» na base Hábitos. */
export const HABIT_RPG_AREA_OPTIONS = [
  "Disciplina",
  "Saúde",
  "Espiritualidade",
  "Relacionamentos",
  "Conhecimento",
  "Finanças",
  "Geral",
] as const;

export type HabitRpgArea = (typeof HABIT_RPG_AREA_OPTIONS)[number];

export function normalizeHabitRpgArea(value: unknown): HabitRpgArea | "Geral" {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw.startsWith("saú") || raw.startsWith("sau")) return "Saúde";
  if (raw.startsWith("espirit")) return "Espiritualidade";
  if (raw.startsWith("relac")) return "Relacionamentos";
  if (raw.startsWith("conhec") || raw.startsWith("estud")) return "Conhecimento";
  if (raw.startsWith("discipl")) return "Disciplina";
  if (raw.startsWith("finan")) return "Finanças";
  return "Geral";
}

export function attributeDeltasForHabit(
  xp: number,
  area: unknown
): Partial<Record<AttributeKey, number>> {
  const key = normalizeHabitRpgArea(area);

  switch (key) {
    case "Saúde":
      return { health: xp * 0.75, discipline: xp * 0.25 };
    case "Espiritualidade":
      return { spirituality: xp * 0.75, discipline: xp * 0.25 };
    case "Relacionamentos":
      return { relationships: xp * 0.75, discipline: xp * 0.25 };
    case "Conhecimento":
      return { knowledge: xp * 0.75, discipline: xp * 0.25 };
    case "Disciplina":
      return { discipline: xp * 0.9, health: xp * 0.1 };
    case "Finanças":
      return { finance: xp * 0.75, discipline: xp * 0.25 };
    default:
      return {
        discipline: xp * 0.45,
        health: xp * 0.2,
        relationships: xp * 0.15,
        spirituality: xp * 0.1,
        knowledge: xp * 0.1,
      };
  }
}
