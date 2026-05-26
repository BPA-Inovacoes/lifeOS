import type { GamePhase } from "@prisma/client";

export type PhaseTheme =
  | "awakening"
  | "momentum"
  | "execution"
  | "mastery"
  | "evolution"
  | "transcendence"
  | "god-mode";

export type PhaseConfig = {
  key: GamePhase;
  label: string;
  theme: PhaseTheme;
  colorHint: string;
  startLevel: number;
  endLevel: number;
  narrative: string;
};

export const PHASES: PhaseConfig[] = [
  {
    key: "AWAKENING",
    label: "Awakening",
    theme: "awakening",
    colorHint: "azul escuro",
    startLevel: 1,
    endLevel: 10,
    narrative: "Despertar, organização e início da evolução.",
  },
  {
    key: "MOMENTUM",
    label: "Momentum",
    theme: "momentum",
    colorHint: "azul neon",
    startLevel: 11,
    endLevel: 20,
    narrative: "Consistência, ritmo e produtividade crescente.",
  },
  {
    key: "EXECUTION",
    label: "Execution",
    theme: "execution",
    colorHint: "roxo",
    startLevel: 21,
    endLevel: 35,
    narrative: "Execução intensa e produtividade de elite.",
  },
  {
    key: "MASTERY",
    label: "Mastery",
    theme: "mastery",
    colorHint: "dourado escuro",
    startLevel: 36,
    endLevel: 50,
    narrative: "Domínio pessoal, clareza extrema e precisão.",
  },
  {
    key: "EVOLUTION",
    label: "Evolution",
    theme: "evolution",
    colorHint: "cyan + roxo",
    startLevel: 51,
    endLevel: 65,
    narrative: "Transformação profunda e elite absoluta.",
  },
  {
    key: "TRANSCENDENCE",
    label: "Transcendence",
    theme: "transcendence",
    colorHint: "branco neon",
    startLevel: 66,
    endLevel: 80,
    narrative: "Transcendência mental e performance absurda.",
  },
  {
    key: "GOD_MODE",
    label: "God Mode",
    theme: "god-mode",
    colorHint: "preto + dourado + neon",
    startLevel: 81,
    endLevel: 100,
    narrative: "Executor lendário e status absoluto.",
  },
];

export function phaseForLevel(level: number): PhaseConfig {
  return (
    PHASES.find((phase) => level >= phase.startLevel && level <= phase.endLevel) ??
    PHASES[0]
  )!;
}

export function phaseProgress(level: number) {
  const phase = phaseForLevel(level);
  const span = phase.endLevel - phase.startLevel + 1;
  const completed = Math.max(0, Math.min(span, level - phase.startLevel + 1));
  return {
    phase,
    completedLevels: completed,
    totalLevels: span,
    percent: Math.round((completed / span) * 100),
  };
}
