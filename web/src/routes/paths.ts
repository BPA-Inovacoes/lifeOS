/** Rotas da app — Focus, Game e Finanças são interfaces separadas escolhidas em `/mode`. */

export type AppMode = "focus" | "game" | "finance";

const FOCUS = "/focus";
const FINANCE = "/finance";

export const paths = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  modeSelect: "/mode",
  account: "/conta",

  focus: {
    dashboard: `${FOCUS}/dashboard`,
    help: `${FOCUS}/ajuda`,
    workspace: (workspaceId: string) => `${FOCUS}/w/${workspaceId}`,
    page: (workspaceId: string, pageId: string) =>
      `${FOCUS}/w/${workspaceId}/p/${pageId}`,
    database: (workspaceId: string, databaseId: string) =>
      `${FOCUS}/w/${workspaceId}/db/${databaseId}`,
  },

  game: {
    home: "/game",
    missions: "/game/missoes",
    dungeons: "/game/dungeons",
    achievements: "/game/conquistas",
    stats: "/game/stats",
    manual: "/game/manual",
    shop: "/game/loja",
  },

  finance: {
    home: FINANCE,
    accounts: `${FINANCE}/contas`,
    account: (accountId: string) => `${FINANCE}/contas/${accountId}`,
    movements: `${FINANCE}/movimentos`,
    methods: `${FINANCE}/metodos`,
    method: (methodId: string) => `${FINANCE}/metodos/${methodId}`,
    learn: `${FINANCE}/aprender`,
    lesson: (lessonId: string) => `${FINANCE}/aprender/${lessonId}`,
    review: `${FINANCE}/revisao`,
    manual: `${FINANCE}/manual`,
  },
} as const;

export function homeForMode(mode: AppMode): string {
  if (mode === "game") return paths.game.home;
  if (mode === "finance") return paths.finance.home;
  return paths.focus.dashboard;
}
