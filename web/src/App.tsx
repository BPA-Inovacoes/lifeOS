import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

import { AppShell } from "@/layouts/AppShell";
import { AccountShell } from "@/layouts/AccountShell";
import { FinanceShell } from "@/layouts/FinanceShell";
import { GameShell } from "@/layouts/GameShell";
import { LifeOSLoading } from "@/components/LifeOSLoading";
import { AccountSettingsPage } from "@/pages/AccountSettingsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DatabasePage } from "@/pages/DatabasePage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { ModeSelectPage } from "@/pages/ModeSelectPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { PageEditorPage } from "@/pages/PageEditorPage";
import { HelpPage } from "@/pages/HelpPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { FinanceAccountDetailPage } from "@/modules/finance/pages/FinanceAccountDetailPage";
import { FinanceAccountsPage } from "@/modules/finance/pages/FinanceAccountsPage";
import { FinanceHomePage } from "@/modules/finance/pages/FinanceHomePage";
import { FinanceLearnPage } from "@/modules/finance/pages/FinanceLearnPage";
import { FinanceLessonDetailPage } from "@/modules/finance/pages/FinanceLessonDetailPage";
import { FinanceManualPage } from "@/modules/finance/pages/FinanceManualPage";
import { FinanceMethodDetailPage } from "@/modules/finance/pages/FinanceMethodDetailPage";
import { FinanceMethodsPage } from "@/modules/finance/pages/FinanceMethodsPage";
import { FinanceMovementsPage } from "@/modules/finance/pages/FinanceMovementsPage";
import { FinanceReviewPage } from "@/modules/finance/pages/FinanceReviewPage";
import { ModeGuard } from "@/routes/ModeGuard";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { homeForMode, paths } from "@/routes/paths";
import { useAppModeStore } from "@/store/appModeStore";
import { useAuthStore } from "@/store/authStore";

const GameProfilePage = lazy(() =>
  import("@/modules/game/pages/GameProfilePage").then((m) => ({
    default: m.GameProfilePage,
  }))
);
const GameMissionsPage = lazy(() =>
  import("@/modules/game/pages/GameMissionsPage").then((m) => ({
    default: m.GameMissionsPage,
  }))
);
const GameDungeonsPage = lazy(() =>
  import("@/modules/game/pages/GameDungeonsPage").then((m) => ({
    default: m.GameDungeonsPage,
  }))
);
const GameAchievementsPage = lazy(() =>
  import("@/modules/game/pages/GameAchievementsPage").then((m) => ({
    default: m.GameAchievementsPage,
  }))
);
const GameStatsPage = lazy(() =>
  import("@/modules/game/pages/GameStatsPage").then((m) => ({
    default: m.GameStatsPage,
  }))
);
const GameManualPage = lazy(() =>
  import("@/modules/game/pages/GameManualPage").then((m) => ({
    default: m.GameManualPage,
  }))
);
const GameShopPage = lazy(() =>
  import("@/modules/game/pages/GameShopPage").then((m) => ({
    default: m.GameShopPage,
  }))
);

function GameRouteFallback() {
  return (
    <div className="p-10">
      <LifeOSLoading fullScreen size="lg" variant="game" message="A preparar Game Mode" />
    </div>
  );
}

function AuthenticatedHomeRedirect() {
  const activeMode = useAppModeStore((s) => s.activeMode);
  if (!activeMode) {
    return <Navigate to={paths.modeSelect} replace />;
  }
  return <Navigate to={homeForMode(activeMode)} replace />;
}

function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={paths.login}
          element={token ? <AuthenticatedHomeRedirect /> : <LoginPage />}
        />
        <Route
          path={paths.register}
          element={token ? <AuthenticatedHomeRedirect /> : <RegisterPage />}
        />
        <Route
          path={paths.forgotPassword}
          element={
            token ? <AuthenticatedHomeRedirect /> : <ForgotPasswordPage />
          }
        />
        <Route
          path={paths.resetPassword}
          element={
            token ? <AuthenticatedHomeRedirect /> : <ResetPasswordPage />
          }
        />

        <Route
          path={paths.modeSelect}
          element={
            <ProtectedRoute>
              <ModeSelectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={paths.account}
          element={
            <ProtectedRoute>
              <AccountShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountSettingsPage />} />
        </Route>

        {/* Focus Mode — interface de produtividade */}
        <Route
          path="/focus"
          element={
            <ProtectedRoute>
              <ModeGuard mode="focus">
                <AppShell />
              </ModeGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="ajuda" element={<HelpPage />} />
          <Route path="w/:workspaceId" element={<WorkspacePage />} />
          <Route path="w/:workspaceId/p/:pageId" element={<PageEditorPage />} />
          <Route
            path="w/:workspaceId/db/:databaseId"
            element={<DatabasePage />}
          />
        </Route>

        {/* Game Mode — interface separada */}
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <ModeGuard mode="game">
                <GameShell />
              </ModeGuard>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameProfilePage />
              </Suspense>
            }
          />
          <Route
            path="missoes"
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameMissionsPage />
              </Suspense>
            }
          />
          <Route
            path="dungeons"
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameDungeonsPage />
              </Suspense>
            }
          />
          <Route
            path="conquistas"
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameAchievementsPage />
              </Suspense>
            }
          />
          <Route
            path="stats"
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameStatsPage />
              </Suspense>
            }
          />
          <Route
            path="loja"
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameShopPage />
              </Suspense>
            }
          />
          <Route
            path="manual"
            element={
              <Suspense fallback={<GameRouteFallback />}>
                <GameManualPage />
              </Suspense>
            }
          />
        </Route>

        {/* Modo Finanças — interface separada (escolha em `/mode`) */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <ModeGuard mode="finance">
                <FinanceShell />
              </ModeGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<FinanceHomePage />} />
          <Route path="contas" element={<FinanceAccountsPage />} />
          <Route path="contas/:accountId" element={<FinanceAccountDetailPage />} />
          <Route path="movimentos" element={<FinanceMovementsPage />} />
          <Route path="metodos" element={<FinanceMethodsPage />} />
          <Route path="metodos/:methodId" element={<FinanceMethodDetailPage />} />
          <Route path="revisao" element={<FinanceReviewPage />} />
          <Route path="aprender" element={<FinanceLearnPage />} />
          <Route path="aprender/:lessonId" element={<FinanceLessonDetailPage />} />
          <Route path="manual" element={<FinanceManualPage />} />
        </Route>

        {/* Rotas antigas → novas */}
        <Route path="/dashboard" element={<Navigate to={paths.focus.dashboard} replace />} />
        <Route path="/ajuda" element={<Navigate to={paths.focus.help} replace />} />
        <Route path="/w/*" element={<LegacyFocusRedirect />} />

        <Route
          path="/"
          element={
            token ? <AuthenticatedHomeRedirect /> : <Navigate to={paths.login} replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/** Compatibilidade com bookmarks antigos `/w/...` */
function LegacyFocusRedirect() {
  const location = useLocation();
  const target = `/focus${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
}

export default App;
