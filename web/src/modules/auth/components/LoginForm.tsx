import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AuthInput } from "@/modules/auth/components/AuthInput";
import { loginRequest } from "@/services/authApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import { useAuthStore } from "@/store/authStore";
import { useAppModeStore } from "@/store/appModeStore";
import { paths } from "@/routes/paths";
import type { LoginFormValues } from "@/utils/schemas/login";
import { loginSchema } from "@/utils/schemas/login";
import {
  authCardAccent,
  authCardClass,
  authPrimaryBtnClass,
} from "@/modules/auth/authStyles";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "xavier@bpa.com", password: "xavier123" },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    setFormError(null);
    try {
      const { token, user } = await loginRequest(values.email, values.password);
      setSession({ token, user });
      clearActiveMode();
      navigate(paths.modeSelect, { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        setFormError(flattenApiErrors(e.body) ?? e.message);
      } else {
        setFormError("Não foi possível ligar ao servidor.");
      }
    } finally {
      setBusy(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className={authCardClass}>
      <div className={authCardAccent} aria-hidden />
      <div className="mb-5 border-b border-border pb-4 sm:mb-6 sm:pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/90">
          // autenticar
        </p>
        <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
          Bem-vindo de volta
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Entra no teu espaço de trabalho</p>
      </div>

      <div className="space-y-4">
        <AuthInput
          id="email"
          label="e-mail"
          type="email"
          icon={Mail}
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          id="password"
          label="palavra-passe"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          trailing={
            <button
              type="button"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
          {...register("password")}
        />

        <p className="text-right">
          <Link
            to="/forgot-password"
            className="font-mono text-xs uppercase tracking-wide text-muted-foreground hover:text-emerald-500"
          >
            Esqueceste a palavra-passe?
          </Link>
        </p>
      </div>

      {formError ? (
        <p className="mt-4 rounded-none border border-red-900/80 bg-red-950 px-3 py-2 text-center text-sm text-red-300">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className={cn(authPrimaryBtnClass, "inline-flex items-center justify-center gap-2")}
      >
        <LogIn className="size-4" aria-hidden />
        {busy ? "A AUTENTICAR…" : "ENTRAR"}
      </button>

      <p className="mt-5 text-center text-sm text-muted-foreground sm:mt-6">
        Não tens conta?{" "}
        <Link
          to="/register"
          className="font-medium text-foreground hover:text-emerald-500 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
