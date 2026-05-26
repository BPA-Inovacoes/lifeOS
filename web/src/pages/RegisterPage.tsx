import { AuthBrand } from "@/modules/auth/components/AuthBrand";
import { AuthTechShell } from "@/modules/auth/components/AuthTechShell";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthTechShell>
      <AuthBrand size="compact" />
      <RegisterForm />
    </AuthTechShell>
  );
}
