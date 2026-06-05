import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthInput } from "@/modules/auth/components/AuthInput";
import { registerRequest } from "@/services/authApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import { useAuthStore } from "@/store/authStore";
import { useAppModeStore } from "@/store/appModeStore";
import { paths } from "@/routes/paths";
import {
  authCardAccent,
  authCardClass,
  authPrimaryBtnClass,
} from "@/modules/auth/authStyles";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    setFormError(null);
    try {
      const { token, user } = await registerRequest(values);
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
      <div className="mb-8 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/90">
          // inicializar
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Criar conta
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Registo no LifeOS</p>
      </div>

      <div className="space-y-4">
        <AuthInput
          id="name"
          label="nome"
          type="text"
          icon={User}
          placeholder="O teu nome"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthInput
          id="reg-email"
          label="e-mail"
          type="email"
          icon={Mail}
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthInput
          id="reg-password"
          label="palavra-passe"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="Mín. 8 caracteres"
          autoComplete="new-password"
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
        <UserPlus className="size-4" aria-hidden />
        {busy ? "A criar…" : "CRIAR CONTA"}
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tens conta?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground hover:text-emerald-500 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
