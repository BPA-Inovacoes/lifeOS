import { phaseForLevel } from "./phases";

export const LEVEL_CAP = 100;

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

const LEVEL_RANKS: string[] = [
  "Wanderer",
  "Initiate",
  "Seeker",
  "Focused",
  "Disciplined",
  "Organized",
  "Builder",
  "Achiever",
  "Consistent",
  "Awakened",
  "Runner",
  "Operator",
  "Producer",
  "Planner",
  "Executor",
  "Tracker",
  "Strategist",
  "Precision",
  "Vanguard",
  "Accelerated",
  "Deep Worker",
  "Specialist",
  "Elite",
  "Controller",
  "Commander",
  "Hyperfocus",
  "Peak Performer",
  "Relentless",
  "Titan",
  "Apex",
  "Prime",
  "Elite Executor",
  "Dominator",
  "Conqueror",
  "Ascended",
  "Architect",
  "Visionary",
  "Warborn",
  "Phantom",
  "Grandmaster",
  "Zenith",
  "Supreme",
  "Infinite",
  "Alpha",
  "Mythic",
  "Eternal",
  "Overlord",
  "Transcendent",
  "Omni",
  "LifeOS Master",
  "Nova",
  "Eclipse",
  "Void Walker",
  "Quantum",
  "Overmind",
  "Chronos",
  "Hyperion",
  "Nexus",
  "Tempest",
  "Oracle",
  "Catalyst",
  "Singularity",
  "Celestial",
  "Infinity Core",
  "Evolutionary",
  "Ethereal",
  "Astral",
  "Arcane",
  "Paragon",
  "Divine",
  "Monolith",
  "Empyrean",
  "Solaris",
  "Nemesis",
  "Oblivion",
  "Exodus",
  "Ragnarok",
  "Genesis",
  "Beyond",
  "Transcendent",
  "Sovereign",
  "Emperor",
  "Titanborn",
  "Dominion",
  "Ascendant",
  "Immortal",
  "Omniscient",
  "Ultra Mind",
  "Absolute",
  "Apex Prime",
  "Supreme Architect",
  "Cosmic",
  "Eternal Mind",
  "Omega",
  "Final Form",
  "OmniCore",
  "Godspeed",
  "Limitless",
  "The One",
  "LIFEOS LEGEND",
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

export function rankTitleForLevel(level: number): string {
  const index = Math.max(1, Math.min(LEVEL_CAP, Math.floor(level))) - 1;
  return LEVEL_RANKS[index] ?? LEVEL_RANKS[0]!;
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

  return {
    level,
    rank: rankTitleForLevel(level),
    phase,
    xpInLevel,
    xpNeeded,
    xpToNextLevel: Math.max(0, xpNeeded - xpInLevel),
    percent,
    totalXp: progressXp,
    capped: level >= LEVEL_CAP,
  };
}
