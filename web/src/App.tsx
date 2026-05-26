import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import { AppShell } from "@/layouts/AppShell";
import { LifeOSLoading } from "@/components/LifeOSLoading";
import { DashboardPage } from "@/pages/DashboardPage";
import { DatabasePage } from "@/pages/DatabasePage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { PageEditorPage } from "@/pages/PageEditorPage";
import { HelpPage } from "@/pages/HelpPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

const GameDashboardPage = lazy(() =>
  import("@/modules/game/pages/GameDashboardPage").then((m) => ({
    default: m.GameDashboardPage,
  }))
);

function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={
            token ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
          }
        />
        <Route
          path="/reset-password"
          element={
            token ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="game"
            element={
              <Suspense
                fallback={
                  <div className="p-10">
                    <LifeOSLoading
                      fullScreen
                      size="lg"
                      message="A preparar command center"
                    />
                  </div>
                }
              >
                <GameDashboardPage />
              </Suspense>
            }
          />
          <Route path="ajuda" element={<HelpPage />} />
          <Route path="w/:workspaceId" element={<WorkspacePage />} />
          <Route path="w/:workspaceId/p/:pageId" element={<PageEditorPage />} />
          <Route
            path="w/:workspaceId/db/:databaseId"
            element={<DatabasePage />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
