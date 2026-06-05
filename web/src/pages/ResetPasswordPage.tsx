import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthBrand } from "@/modules/auth/components/AuthBrand";
import { AuthInput } from "@/modules/auth/components/AuthInput";
import { AuthTechShell } from "@/modules/auth/components/AuthTechShell";
import {
  authCardAccent,
  authCardClass,
  authPrimaryBtnClass,
} from "@/modules/auth/authStyles";
import { resetPasswordRequest } from "@/services/authApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As palavras-passe não coincidem",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) {
      setFormError("Token em falta. Usa o link recebido por email.");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await resetPasswordRequest(token, password);
      navigate("/login", {
        replace: true,
        state: { message: "Palavra-passe actualizada. Podes entrar." },
      });
    } catch (e) {
      if (e instanceof ApiError) {
        setFormError(flattenApiErrors(e.body) ?? e.message);
      } else {
        setFormError("Não foi possível actualizar a palavra-passe.");
      }
    } finally {
      setBusy(false);
    }
  });

  return (
    <AuthTechShell>
      <AuthBrand />
      <form onSubmit={onSubmit} className={authCardClass}>
        <div className={authCardAccent} aria-hidden />
        <div className="mb-8 border-b border-border pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/90">
            // redefinir
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Nova palavra-passe
          </h2>
          {!token ? (
            <p className="mt-2 text-sm text-amber-900 dark:text-amber-400">
              Token inválido ou em falta. Pede um novo link em{" "}
              <Link to="/forgot-password" className="underline">
                recuperar palavra-passe
              </Link>
              .
            </p>
          ) : null}
        </div>

        <div className="space-y-5">
          <AuthInput
            id="password"
            label="nova palavra-passe"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            autoComplete="new-password"
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar" : "Mostrar"}
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
          <AuthInput
            id="confirm"
            label="confirmar"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </div>

        {formError ? (
          <p className="mt-4 border border-red-900/80 bg-red-950 px-3 py-2 text-center text-sm text-red-300">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !token}
          className={cn(
            authPrimaryBtnClass,
            "mt-6 inline-flex w-full items-center justify-center"
          )}
        >
          {busy ? "A GUARDAR…" : "GUARDAR"}
        </button>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-emerald-800 hover:text-emerald-600 hover:underline dark:text-white dark:hover:text-emerald-500"
          >
            Voltar ao login
          </Link>
        </p>
      </form>
    </AuthTechShell>
  );
}
