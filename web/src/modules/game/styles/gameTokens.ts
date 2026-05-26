/** Tokens visuais do Game Mode — premium / futurista / clean */

export const gamePanelClass =
  "relative overflow-hidden rounded-none border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm";

export const gamePanelGlowClass =
  "pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5";

export const gameAccentLineClass =
  "absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent";

export const gameNeonTextClass = "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]";

export const gameGlassClass =
  "border border-zinc-700/50 bg-zinc-900/40 backdrop-blur-md";

export const rarityClass: Record<string, string> = {
  COMMON: "border-zinc-600 text-zinc-400",
  RARE: "border-cyan-700/60 text-cyan-400",
  EPIC: "border-violet-700/60 text-violet-400",
  LEGENDARY: "border-amber-600/60 text-amber-400",
};

export const gameXpPopClass = "lifeos-xp-pop";

export const gameLevelUpClass = "lifeos-level-up";

export const phaseThemeClasses: Record<string, string> = {
  awakening: "from-sky-500/15 via-emerald-500/8 to-transparent",
  momentum: "from-cyan-500/15 via-sky-500/8 to-transparent",
  execution: "from-violet-500/15 via-fuchsia-500/8 to-transparent",
  mastery: "from-amber-500/18 via-emerald-500/8 to-transparent",
  evolution: "from-cyan-500/18 via-violet-500/8 to-transparent",
  transcendence: "from-zinc-200/12 via-cyan-500/8 to-transparent",
  "god-mode": "from-amber-400/18 via-violet-500/10 to-transparent",
};

export function gamePhaseGlow(theme?: string) {
  return (
    phaseThemeClasses[theme ?? "awakening"] ??
    phaseThemeClasses.awakening
  );
}
