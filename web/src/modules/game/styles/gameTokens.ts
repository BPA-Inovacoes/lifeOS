/** Tokens visuais do Game Mode — violeta / RPG / premium */

import { navItemClass, navItemIdleClass } from "@/styles/designTokens";

export const gamePanelClass =
  "relative overflow-hidden rounded-none border border-border/80 bg-background/90 backdrop-blur-sm";

export const gamePanelGlowClass =
  "pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5";

export const gameAccentLineClass =
  "absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent";

export const gameNeonTextClass =
  "text-violet-800 drop-shadow-none dark:text-violet-400 dark:drop-shadow-[0_0_8px_rgba(167,139,250,0.35)]";

export const gameGlassClass =
  "border border-border/50 bg-secondary/40 backdrop-blur-md";

export const gameSectionLabelClass =
  "font-mono text-sm uppercase tracking-[0.12em] text-violet-800 dark:text-violet-500/90";

export const gameMetaLabelClass =
  "font-mono text-sm uppercase tracking-wider text-muted-foreground";

export const gameBodyMutedClass = "text-sm leading-relaxed text-muted-foreground";

export const gameBodyClass = "text-base leading-relaxed text-foreground";

export const gameNavItemActiveClass =
  "border-violet-600 bg-secondary text-foreground";

export const gameTabItemActiveClass = "bg-secondary text-violet-800 dark:text-violet-400";

export const gameLinkClass =
  "text-sm text-violet-800 transition-colors hover:text-violet-950 dark:text-violet-400/90 dark:hover:text-violet-300";

export const gameFocusBridgeLinkClass =
  "text-xs uppercase text-emerald-800 transition-colors hover:text-emerald-700 dark:text-emerald-600 dark:hover:text-emerald-500";

export const gameXpTextClass = "text-amber-800 dark:text-amber-400";

export const gameProgressBarClass =
  "bg-gradient-to-r from-violet-700 via-violet-500 to-fuchsia-500";

export const gameProgressBarCompleteClass = "bg-violet-500";

export const gameBorderAccentClass = "border-violet-300/60 dark:border-violet-800/50";

export const gameIconAccentClass = "text-violet-800 dark:text-violet-500";

export const gameHudBorderClass =
  "border-violet-300/50 transition-colors hover:border-violet-500/60 dark:border-violet-900/40 dark:hover:border-violet-700/60";

export const gameMilestoneReachedClass =
  "border-violet-300/60 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-400";

export const gameHeatmapLevelClass: Record<number, string> = {
  0: "bg-muted",
  1: "bg-violet-100 dark:bg-violet-950",
  2: "bg-violet-200/80 dark:bg-violet-900/70",
  3: "bg-violet-300/80 dark:bg-violet-800/80",
  4: "bg-violet-500 shadow-none dark:shadow-[0_0_6px_rgba(139,92,246,0.35)]",
};

export const gameNavItemClass = navItemClass;
export const gameNavItemIdleClass = navItemIdleClass;

export const rarityClass: Record<string, string> = {
  COMMON: "border-border text-muted-foreground",
  RARE: "border-cyan-400/60 text-cyan-800 dark:border-cyan-700/60 dark:text-cyan-400",
  EPIC: "border-violet-400/60 text-violet-900 dark:border-violet-700/60 dark:text-violet-400",
  LEGENDARY: "border-amber-400/60 text-amber-900 dark:border-amber-600/60 dark:text-amber-400",
};

export const gameXpPopClass = "lifeos-xp-pop";

export const gameLevelUpClass = "lifeos-level-up";

export const phaseThemeClasses: Record<string, string> = {
  awakening: "from-sky-500/15 via-violet-500/8 to-transparent",
  momentum: "from-cyan-500/15 via-violet-500/8 to-transparent",
  execution: "from-violet-500/15 via-fuchsia-500/8 to-transparent",
  mastery: "from-amber-500/18 via-violet-500/8 to-transparent",
  evolution: "from-fuchsia-500/18 via-violet-500/8 to-transparent",
  transcendence: "from-zinc-400/12 via-violet-500/8 to-transparent",
  "god-mode": "from-amber-400/18 via-violet-500/10 to-transparent",
};

export function gamePhaseGlow(theme?: string) {
  return phaseThemeClasses[theme ?? "awakening"] ?? phaseThemeClasses.awakening;
}
