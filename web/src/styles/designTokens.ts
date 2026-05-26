/** Design system LifeOS — terminal / tech (login + app) */

export const sectionLabelClass =
  "font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600/90";

export const sectionLabelMutedClass =
  "font-mono text-[10px] uppercase tracking-wider text-zinc-500";

/** Transições padronizadas (Fase 3 — 150–200ms). */
export const transitionFastClass =
  "transition-all duration-150 ease-out";

export const transitionColorsClass =
  "transition-colors duration-150 ease-out";

export const fieldClass =
  "h-10 w-full rounded-none border border-zinc-700 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:font-mono placeholder:text-xs placeholder:text-zinc-600 outline-none transition-colors duration-150 ease-out focus:border-emerald-600 focus:ring-0";

export const fieldClassLg =
  "h-12 w-full rounded-none border border-zinc-700 bg-zinc-900 text-sm text-zinc-100 placeholder:font-mono placeholder:text-xs placeholder:text-zinc-600 outline-none transition-colors duration-150 ease-out focus:border-emerald-600 focus:ring-0";

/** Campo data — ícone do calendário verde e afastado do texto (ver index.css). */
export const dateInputClass = `${fieldClass} lifeos-date-input h-9 min-w-0 pr-11 font-mono text-xs`;

export const techCardClass =
  "relative rounded-none border border-zinc-800 bg-zinc-950 text-zinc-100";

export const techCardAccentClass = "absolute left-0 top-0 h-0.5 w-full bg-emerald-600";

export const primaryBtnClass =
  "rounded-none bg-emerald-700 font-semibold text-white transition-colors duration-150 ease-out hover:bg-emerald-600 disabled:opacity-60";

export const navItemClass =
  "flex items-center gap-2 rounded-none border-l-2 px-3 py-2 text-sm transition-colors duration-150 ease-out";

export const navItemActiveClass =
  "border-emerald-600 bg-zinc-900 text-zinc-100";

export const navItemIdleClass =
  "border-transparent text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-300";

export const listItemClass =
  "flex items-center gap-3 rounded-none border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm transition-colors duration-150 ease-out hover:border-zinc-700 hover:bg-zinc-900";

export const errorBoxClass =
  "rounded-none border border-red-900/80 bg-red-950 px-3 py-2 text-xs text-red-300";

export const kbdClass =
  "rounded-none border border-zinc-700 bg-zinc-900 px-1.5 font-mono text-[10px] text-zinc-500";

export const tabBarClass =
  "flex rounded-none border border-zinc-800 p-0";

export const tabItemClass =
  "rounded-none px-3 py-1.5 text-sm transition-colors duration-150 ease-out";

export const tabItemActiveClass = "bg-zinc-900 text-emerald-500";

export const tabItemIdleClass =
  "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-300";

export const pageShellClass = "mx-auto w-full max-w-6xl p-4 md:p-8 md:pb-12";

export const dataPanelClass =
  "relative overflow-hidden rounded-none border border-zinc-800 bg-zinc-950";

export const dataPanelFooterClass =
  "flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5";

/** Áreas com scroll — herdam estilos globais; classe opcional para barra mais fina. */
export const lifeosScrollbarThinClass = "lifeos-scrollbar-thin";

/** Re-exportes auth (compat) */
export const authFieldClass = `${fieldClassLg} px-4`;
export const authCardClass = `relative w-full ${techCardClass} p-8 sm:p-10`;
export const authCardAccent = "absolute left-0 top-0 h-1 w-full bg-emerald-600";
export const authPrimaryBtnClass = `mt-6 h-12 w-full ${primaryBtnClass}`;
export const authSocialBtnClass =
  "flex h-12 items-center justify-center rounded-none border border-zinc-700 bg-zinc-900 cursor-not-allowed opacity-80";
