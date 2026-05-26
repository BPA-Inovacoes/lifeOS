import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AuthInput } from "@/modules/auth/components/AuthInput";
import { loginRequest } from "@/services/authApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import { useAuthStore } from "@/store/authStore";
import type { LoginFormValues } from "@/utils/schemas/login";
import { loginSchema } from "@/utils/schemas/login";
import {
  authCardAccent,
  authCardClass,
  authPrimaryBtnClass,
  authSocialBtnClass,
} from "@/modules/auth/authStyles";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-5 fill-white" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
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
      navigate("/dashboard", { replace: true });
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
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600/90">
          // autenticar
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">
          Bem-vindo de volta
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Entra no teu espaço de trabalho</p>
      </div>

      <div className="space-y-5">
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
              className="text-zinc-500 transition-colors hover:text-zinc-300"
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
            className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 hover:text-emerald-500"
          >
            Esqueceste a palavra-passe?
          </Link>
        </p>
      </div>

      {formError ? (
        <p className="mt-4 rounded-none border border-red-900/80 bg-red-950 px-3 py-2 text-center text-xs text-red-300">
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

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-zinc-950 px-3 font-mono text-zinc-600">ou</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "Google", icon: <GoogleIcon /> },
            { label: "Facebook", icon: <FacebookIcon /> },
            { label: "Apple", icon: <AppleIcon /> },
          ] as const
        ).map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            disabled
            title="Em breve"
            className={authSocialBtnClass}
          >
            {icon}
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Não tens conta?{" "}
        <Link
          to="/register"
          className="font-medium text-white hover:text-emerald-500 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
