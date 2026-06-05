import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { SessionSync } from "@/components/SessionSync";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./index.css";
import { initThemeBeforeRender } from "@/lib/applyTheme";
import { ApiError } from "@/services/http";
import { toast } from "@/store/toastStore";

initThemeBeforeRender();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) return;
        const msg =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Erro inesperado.";
        toast.error(msg);
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionSync />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
