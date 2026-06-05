/** Design system LifeOS — tokens semânticos (claro / escuro via CSS vars) */

export const sectionLabelClass =
  "font-mono text-sm uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-600/90";

export const sectionLabelMutedClass =
  "font-mono text-sm uppercase tracking-wider text-muted-foreground";

/** Rótulos secundários (tabs, badges, metadados) */
export const metaLabelClass =
  "font-mono text-sm uppercase tracking-wider text-muted-foreground";

/** Texto secundário legível — descrições, legendas */
export const subtleTextClass = "text-sm text-muted-foreground";

/** Corpo legível */
export const bodyTextClass = "text-base leading-relaxed text-foreground";

export const bodyMutedClass = "text-sm leading-relaxed text-muted-foreground";

export const labelClass = "text-base text-muted-foreground";

export const transitionFastClass = "transition-all duration-150 ease-out";

export const transitionColorsClass = "transition-colors duration-150 ease-out";

export const fieldClass =
  "h-11 w-full rounded-none border border-input bg-card px-4 text-base text-foreground placeholder:font-mono placeholder:text-sm placeholder:text-muted-foreground outline-none transition-colors duration-150 ease-out focus:border-emerald-600 focus:ring-0";

export const fieldClassLg =
  "h-12 w-full rounded-none border border-input bg-card text-base text-foreground placeholder:font-mono placeholder:text-sm placeholder:text-muted-foreground outline-none transition-colors duration-150 ease-out focus:border-emerald-600 focus:ring-0";

export const dateInputClass = `${fieldClass} lifeos-date-input h-10 min-w-0 pr-11 font-mono text-sm`;

export const techCardClass =
  "relative rounded-none border border-border bg-background/85 text-foreground backdrop-blur-sm";

export const techCardAccentClass = "absolute left-0 top-0 h-0.5 w-full bg-emerald-600";

export const primaryBtnClass =
  "rounded-none bg-emerald-700 text-base font-semibold text-white transition-colors duration-150 ease-out hover:bg-emerald-600 disabled:opacity-60";

export const navItemClass =
  "flex items-center gap-2 rounded-none border-l-2 px-3 py-2.5 text-base transition-colors duration-150 ease-out";

export const navItemActiveClass = "border-emerald-600 bg-secondary text-foreground";

export const navItemIdleClass =
  "border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground";

export const listItemClass =
  "flex items-center gap-3 rounded-none border border-border bg-secondary/50 px-3 py-2.5 text-base text-foreground transition-colors duration-150 ease-out hover:border-border hover:bg-secondary";

export const errorBoxClass =
  "rounded-none border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900/80 dark:bg-red-950 dark:text-red-300";

export const kbdClass =
  "rounded-none border border-border bg-secondary px-1.5 font-mono text-sm text-muted-foreground";

export const tabBarClass = "flex rounded-none border border-border p-0";

export const tabItemClass =
  "rounded-none px-4 py-2 text-base transition-colors duration-150 ease-out";

export const tabItemActiveClass =
  "bg-secondary text-emerald-800 dark:text-emerald-500";

export const tabItemIdleClass =
  "text-muted-foreground hover:bg-secondary/80 hover:text-foreground";

export const pageShellClass = "mx-auto w-full max-w-6xl p-4 md:p-8 md:pb-12";

export const dataPanelClass =
  "relative overflow-hidden rounded-none border border-border bg-background";

export const dataPanelFooterClass =
  "flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground";

export const lifeosScrollbarThinClass = "lifeos-scrollbar-thin";

export const authFieldClass = `${fieldClass} px-4`;
export const authCardClass = `relative w-full ${techCardClass} p-5 sm:p-8`;
export const authCardAccent = "absolute left-0 top-0 h-1 w-full bg-emerald-600";
export const authPrimaryBtnClass = `mt-4 h-11 w-full sm:mt-5 sm:h-12 ${primaryBtnClass}`;
