import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { AuthBrand } from "@/modules/auth/components/AuthBrand";
import { AuthInput } from "@/modules/auth/components/AuthInput";
import { AuthTechShell } from "@/modules/auth/components/AuthTechShell";
import {
  authCardAccent,
  authCardClass,
  authPrimaryBtnClass,
} from "@/modules/auth/authStyles";
import { forgotPasswordRequest } from "@/services/authApi";
import { ApiError, flattenApiErrors } from "@/services/http";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Email inválido"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setBusy(true);
    setFormError(null);
    setDevToken(null);
    try {
      const res = await forgotPasswordRequest(email);
      setSent(true);
      if (res.devToken) setDevToken(res.devToken);
    } catch (e) {
      if (e instanceof ApiError) {
        setFormError(flattenApiErrors(e.body) ?? e.message);
      } else {
        setFormError("Não foi possível contactar o servidor.");
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
            // recuperar
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Recuperar palavra-passe
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enviaremos instruções se o email existir na conta.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Se o email estiver registado, receberás um link de redefinição
              (em produção). Podes fechar esta página.
            </p>
            {devToken ? (
              <div className="border border-amber-900/60 bg-amber-950/40 p-3 font-mono text-sm text-amber-200">
                <p className="mb-2 text-amber-900 dark:text-amber-400">// dev — token de teste</p>
                <Link
                  to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                  className="break-all text-emerald-800 dark:text-emerald-400 hover:underline"
                >
                  Abrir redefinição com token
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
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
        )}

        {formError ? (
          <p className="mt-4 border border-red-900/80 bg-red-950 px-3 py-2 text-center text-sm text-red-300">
            {formError}
          </p>
        ) : null}

        {!sent ? (
          <button
            type="submit"
            disabled={busy}
            className={cn(
              authPrimaryBtnClass,
              "mt-6 inline-flex w-full items-center justify-center gap-2"
            )}
          >
            {busy ? "A ENVIAR…" : "ENVIAR PEDIDO"}
          </button>
        ) : null}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-600 hover:underline dark:text-white dark:hover:text-emerald-500"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao login
          </Link>
        </p>
      </form>
    </AuthTechShell>
  );
}
