import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Info, Sparkles, XCircle } from "lucide-react";

import type { AppMode } from "@/routes/paths";
import type { ToastVariant } from "@/store/toastStore";

export type ToastThemeEntry = {
  bar: string;
  border: string;
  icon: LucideIcon;
  iconClass: string;
};

type ToastTheme = Record<ToastVariant, ToastThemeEntry>;

const focusTheme: ToastTheme = {
  success: {
    bar: "bg-emerald-600",
    border: "border-emerald-300 dark:border-emerald-900/40",
    icon: CheckCircle2,
    iconClass: "text-emerald-700 dark:text-emerald-500",
  },
  error: {
    bar: "bg-red-600",
    border: "border-red-300 dark:border-red-900/50",
    icon: XCircle,
    iconClass: "text-red-700 dark:text-red-400",
  },
  info: {
    bar: "bg-emerald-600 dark:bg-emerald-700/80",
    border: "border-border",
    icon: Info,
    iconClass: "text-emerald-700 dark:text-emerald-400/90",
  },
  rpg: {
    bar: "bg-gradient-to-r from-emerald-600 to-cyan-600",
    border: "border-emerald-300 dark:border-emerald-900/40",
    icon: Sparkles,
    iconClass: "text-emerald-700 dark:text-emerald-400",
  },
};

const gameTheme: ToastTheme = {
  success: {
    bar: "bg-gradient-to-r from-violet-600 to-fuchsia-600",
    border: "border-violet-300 dark:border-violet-900/50",
    icon: CheckCircle2,
    iconClass: "text-violet-800 dark:text-violet-400",
  },
  error: {
    bar: "bg-red-600",
    border: "border-red-300 dark:border-violet-900/40",
    icon: XCircle,
    iconClass: "text-red-700 dark:text-red-400",
  },
  info: {
    bar: "bg-violet-600 dark:bg-violet-700/90",
    border: "border-violet-300 dark:border-violet-900/40",
    icon: Info,
    iconClass: "text-violet-800 dark:text-violet-300",
  },
  rpg: {
    bar: "bg-gradient-to-r from-violet-600 via-amber-500 to-fuchsia-500",
    border: "border-violet-300 dark:border-violet-900/50",
    icon: Sparkles,
    iconClass: "text-amber-800 dark:text-amber-400",
  },
};

const financeTheme: ToastTheme = {
  success: {
    bar: "bg-amber-600",
    border: "border-amber-300 dark:border-amber-900/45",
    icon: CheckCircle2,
    iconClass: "text-amber-900 dark:text-amber-400",
  },
  error: {
    bar: "bg-red-600",
    border: "border-red-300 dark:border-amber-900/35",
    icon: XCircle,
    iconClass: "text-red-700 dark:text-red-400",
  },
  info: {
    bar: "bg-amber-600 dark:bg-amber-700/90",
    border: "border-amber-300 dark:border-amber-900/35",
    icon: Info,
    iconClass: "text-amber-900 dark:text-amber-300/90",
  },
  rpg: {
    bar: "bg-gradient-to-r from-amber-600 to-yellow-500",
    border: "border-amber-300 dark:border-amber-900/45",
    icon: Sparkles,
    iconClass: "text-amber-900 dark:text-amber-300",
  },
};

const THEMES: Record<AppMode, ToastTheme> = {
  focus: focusTheme,
  game: gameTheme,
  finance: financeTheme,
};

export function getToastTheme(mode: AppMode): ToastTheme {
  return THEMES[mode] ?? focusTheme;
}

export function getToastThemeEntry(mode: AppMode, variant: ToastVariant): ToastThemeEntry {
  return getToastTheme(mode)[variant];
}
