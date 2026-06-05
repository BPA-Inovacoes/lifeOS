import { phaseForLevel } from "./phases";

export const LEVEL_CAP = 100;

/** Rank global E–SSS (LifeOS RPG v1). */
export type GlobalRank = "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

const GLOBAL_RANKS: {
  rank: GlobalRank;
  minLevel: number;
  label: string;
}[] = [
  { rank: "SSS", minLevel: 95, label: "Lendário" },
  { rank: "SS", minLevel: 80, label: "Mestre" },
  { rank: "S", minLevel: 65, label: "Elite" },
  { rank: "A", minLevel: 50, label: "Líder" },
  { rank: "B", minLevel: 35, label: "Executor" },
  { rank: "C", minLevel: 20, label: "Operador" },
  { rank: "D", minLevel: 10, label: "Aprendiz" },
  { rank: "E", minLevel: 1, label: "Iniciante" },
];

type LevelAnchor = {
  level: number;
  xp: number;
};

const XP_ANCHORS: LevelAnchor[] = [
  { level: 1, xp: 100 },
  { level: 10, xp: 900 },
  { level: 25, xp: 4_000 },
  { level: 50, xp: 15_000 },
  { level: 80, xp: 40_000 },
  { level: 99, xp: 100_000 },
  { level: 100, xp: 120_000 },
];

function interpolate(anchorA: LevelAnchor, anchorB: LevelAnchor, level: number) {
  const span = anchorB.level - anchorA.level;
  if (span <= 0) return anchorA.xp;
  const ratio = (level - anchorA.level) / span;
  return Math.round(anchorA.xp + (anchorB.xp - anchorA.xp) * ratio);
}

export function xpRequiredForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(LEVEL_CAP, Math.floor(level)));

  for (let i = 0; i < XP_ANCHORS.length - 1; i++) {
    const current = XP_ANCHORS[i]!;
    const next = XP_ANCHORS[i + 1]!;
    if (clamped >= current.level && clamped <= next.level) {
      return interpolate(current, next, clamped);
    }
  }

  return XP_ANCHORS[XP_ANCHORS.length - 1]!.xp;
}

export function totalXpForLevel(level: number): number {
  const maxLevel = Math.max(1, Math.min(LEVEL_CAP, Math.floor(level)));
  let total = 0;
  for (let cursor = 1; cursor < maxLevel; cursor++) {
    total += xpRequiredForLevel(cursor);
  }
  return total;
}

export function levelFromProgressXp(progressXp: number): number {
  let level = 1;
  let remaining = Math.max(0, Math.floor(progressXp));

  while (level < LEVEL_CAP) {
    const needed = xpRequiredForLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level += 1;
  }

  return level;
}

export const levelFromTotalXp = levelFromProgressXp;

export function globalRankFromLevel(level: number): {
  rank: GlobalRank;
  label: string;
} {
  const clamped = Math.max(1, Math.min(LEVEL_CAP, Math.floor(level)));
  for (const entry of GLOBAL_RANKS) {
    if (clamped >= entry.minLevel) {
      return { rank: entry.rank, label: entry.label };
    }
  }
  return { rank: "E", label: "Iniciante" };
}

/** Título persistido no perfil — formato compacto Rank · Label. */
export function rankTitleForLevel(level: number): string {
  const { rank, label } = globalRankFromLevel(level);
  return `${rank} · ${label}`;
}

export function levelProgress(progressXp: number) {
  const level = levelFromProgressXp(progressXp);
  const xpAtLevelStart = totalXpForLevel(level);
  const xpInLevel = Math.max(0, progressXp - xpAtLevelStart);
  const xpNeeded = level >= LEVEL_CAP ? 0 : xpRequiredForLevel(level);
  const percent =
    level >= LEVEL_CAP || xpNeeded <= 0
      ? 100
      : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const phase = phaseForLevel(level);
  const globalRank = globalRankFromLevel(level);

  return {
    level,
    rank: globalRank.rank,
    rankLabel: globalRank.label,
    rankTitle: rankTitleForLevel(level),
    phase,
    xpInLevel,
    xpNeeded,
    xpToNextLevel: Math.max(0, xpNeeded - xpInLevel),
    percent,
    totalXp: progressXp,
    capped: level >= LEVEL_CAP,
  };
}
