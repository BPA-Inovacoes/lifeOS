import { AuthBrand } from "@/modules/auth/components/AuthBrand";
import { AuthTechShell } from "@/modules/auth/components/AuthTechShell";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export function LoginPage() {
  return (
    <AuthTechShell>
      <AuthBrand size="compact" />
      <LoginForm />
    </AuthTechShell>
  );
}
