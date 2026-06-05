import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AppModal } from "@/components/AppModal";
import { FinanceGlossaryLink } from "@/modules/finance/components/FinanceGlossaryLink";
import {
  FinanceButton,
  FinanceInput,
  FinanceSelect,
} from "@/modules/finance/components/finance-ui";
import { getFinanceCurrency } from "@/modules/finance/financeCurrencies";
import {
  ACCOUNT_COLOR_PRESETS,
  ACCOUNT_NAME_PLACEHOLDERS,
  ACCOUNT_TYPE_HINTS,
  todayIsoDate,
} from "@/modules/finance/lib/accountFormCopy";
import {
  financeLabelClass,
  financeMetaLabelClass,
  financeModalClass,
} from "@/modules/finance/styles/financeTokens";
import { detectClientDefaultCurrency } from "@/modules/finance/financeLocale";
import {
  ACCOUNT_TYPE_LABELS,
  currencyAmountLabel,
  type FinanceAccount,
  type FinanceAccountType,
} from "@/services/financeApi";
import { cn } from "@/lib/utils";

const TYPES: FinanceAccountType[] = [
  "CHECKING",
  "SAVINGS",
  "CASH",
  "CREDIT_CARD",
  "INVESTMENT",
  "LOAN",
  "OTHER",
];

const STEP_COUNT = 2;

export type AccountFormValues = {
  name: string;
  type: FinanceAccountType;
  institution?: string;
  maskedIdentifier?: string;
  initialBalance?: number;
  initialBalanceDate?: string;
  includeInNetWorth?: boolean;
  color?: string;
  creditLimit?: number | null;
  billingCycleDay?: number | null;
  paymentDueDay?: number | null;
  aprPercent?: number | null;
  minimumPayment?: number | null;
  originalPrincipal?: number | null;
};

type Props = {
  open: boolean;
  loading?: boolean;
  currency?: string;
  account?: FinanceAccount | null;
  defaultType?: FinanceAccountType;
  onClose: () => void;
  onSubmit: (data: AccountFormValues) => void;
};

function FormSection({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <p className={financeMetaLabelClass}>{label}</p>
      {children}
    </section>
  );
}

export function AccountFormDialog({
  open,
  loading,
  currency = detectClientDefaultCurrency(),
  account = null,
  defaultType = "CHECKING",
  onClose,
  onSubmit,
}: Props) {
  const isEdit = Boolean(account);
  const currencyMeta = getFinanceCurrency(currency);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [type, setType] = useState<FinanceAccountType>("CHECKING");
  const [balance, setBalance] = useState("");
  const [balanceDate, setBalanceDate] = useState(todayIsoDate());
  const [institution, setInstitution] = useState("");
  const [maskedIdentifier, setMaskedIdentifier] = useState("");
  const [includeInNetWorth, setIncludeInNetWorth] = useState(true);
  const [color, setColor] = useState<string | undefined>("amber");
  const [creditLimit, setCreditLimit] = useState("");
  const [billingCycleDay, setBillingCycleDay] = useState("");
  const [paymentDueDay, setPaymentDueDay] = useState("");
  const [aprPercent, setAprPercent] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [originalPrincipal, setOriginalPrincipal] = useState("");

  const isLiability = type === "CREDIT_CARD" || type === "LOAN";
  const isCreditCard = type === "CREDIT_CARD";
  const isLoan = type === "LOAN";

  const parseOptionalNumber = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = parseFloat(trimmed.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const parseOptionalDay = (raw: string) => {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 && n <= 28 ? n : null;
  };

  const liabilityPayload = () => ({
    creditLimit: isCreditCard ? parseOptionalNumber(creditLimit) : null,
    billingCycleDay: isCreditCard ? parseOptionalDay(billingCycleDay) : null,
    paymentDueDay: isCreditCard ? parseOptionalDay(paymentDueDay) : null,
    aprPercent: isLiability ? parseOptionalNumber(aprPercent) : null,
    minimumPayment: isLoan ? parseOptionalNumber(minimumPayment) : null,
    originalPrincipal: isLoan ? parseOptionalNumber(originalPrincipal) : null,
  });
  const typeHint = ACCOUNT_TYPE_HINTS[type];
  const namePlaceholder = ACCOUNT_NAME_PLACEHOLDERS[type];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (account) {
      setName(account.name);
      setType(account.type);
      setInstitution(account.institution ?? "");
      setMaskedIdentifier(account.maskedIdentifier ?? "");
      setIncludeInNetWorth(account.includeInNetWorth);
      setColor(account.color ?? undefined);
      setBalance("");
      setBalanceDate(account.initialBalanceDate?.slice(0, 10) ?? todayIsoDate());
      setCreditLimit(account.creditLimit != null ? String(account.creditLimit) : "");
      setBillingCycleDay(
        account.billingCycleDay != null ? String(account.billingCycleDay) : ""
      );
      setPaymentDueDay(account.paymentDueDay != null ? String(account.paymentDueDay) : "");
      setAprPercent(account.aprPercent != null ? String(account.aprPercent) : "");
      setMinimumPayment(account.minimumPayment != null ? String(account.minimumPayment) : "");
      setOriginalPrincipal(
        account.originalPrincipal != null ? String(account.originalPrincipal) : ""
      );
    } else {
      setName("");
      setType(defaultType);
      setBalance("");
      setBalanceDate(todayIsoDate());
      setInstitution("");
      setMaskedIdentifier("");
      setIncludeInNetWorth(true);
      setColor("amber");
      setCreditLimit("");
      setBillingCycleDay("");
      setPaymentDueDay("");
      setAprPercent("");
      setMinimumPayment("");
      setOriginalPrincipal("");
    }
  }, [open, account, defaultType]);

  const canAdvance = name.trim().length > 0;

  const canSubmit = useMemo(() => {
    if (!canAdvance) return false;
    if (isEdit) return true;
    const parsed = parseFloat(balance.replace(",", "."));
    return !Number.isNaN(parsed);
  }, [canAdvance, balance, isEdit]);

  const submit = () => {
    if (!canSubmit) return;
    if (isEdit && account) {
      onSubmit({
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        maskedIdentifier: maskedIdentifier.trim() || undefined,
        includeInNetWorth,
        color: color ?? undefined,
        ...liabilityPayload(),
      });
      return;
    }
    const parsed = parseFloat(balance.replace(",", "."));
    onSubmit({
      name: name.trim(),
      type,
      initialBalance: parsed,
      initialBalanceDate: balanceDate || todayIsoDate(),
      institution: institution.trim() || undefined,
      maskedIdentifier: maskedIdentifier.trim() || undefined,
      includeInNetWorth,
      color: color ?? undefined,
      ...liabilityPayload(),
    });
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      disabled={loading}
      ariaLabel={isEdit ? "Editar conta" : "Nova conta"}
      panelClassName={cn(financeModalClass, "max-w-lg")}
    >
      <p className="font-mono text-xs uppercase text-muted-foreground">
        Passo {step + 1} / {STEP_COUNT}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-foreground">
        {isEdit ? "Editar conta" : "Adicionar conta"}
        {step === 0 ? " — identificação" : isEdit ? " — opções" : " — saldo e opções"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 0
          ? isEdit
            ? "Tipo, nome e referência da conta."
            : "Que conta estás a mapear e como a queres chamar."
          : isEdit
            ? "Cor no painel e se entra no património líquido."
            : "Saldo de referência, cor e património."}
      </p>
      {step === 0 && currencyMeta ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Moeda: {currencyMeta.flag} {currencyMeta.code} · {currencyMeta.label}
        </p>
      ) : null}

      <div className="mt-5 space-y-6">
        {step === 0 ? (
          <>
            <FormSection label="// tipo de conta">
              <div>
                <label htmlFor="acc-type" className={financeLabelClass}>
                  Tipo
                </label>
                <FinanceSelect
                  id="acc-type"
                  className="mt-1"
                  value={type}
                  onChange={(e) => setType(e.target.value as FinanceAccountType)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ACCOUNT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </FinanceSelect>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{typeHint}</p>
              </div>
            </FormSection>

            <FormSection label="// identificação">
              <div>
                <label htmlFor="acc-name" className={financeLabelClass}>
                  Nome
                </label>
                <FinanceInput
                  id="acc-name"
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={namePlaceholder}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="acc-inst" className={financeLabelClass}>
                    Instituição
                  </label>
                  <FinanceInput
                    id="acc-inst"
                    className="mt-1"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="CGD, Millennium, Revolut…"
                  />
                </div>
                <div>
                  <label htmlFor="acc-mask" className={financeLabelClass}>
                    Referência (opcional)
                  </label>
                  <FinanceInput
                    id="acc-mask"
                    className="mt-1"
                    value={maskedIdentifier}
                    onChange={(e) => setMaskedIdentifier(e.target.value)}
                    placeholder="últimos dígitos · ****4521"
                    maxLength={32}
                  />
                </div>
              </div>
            </FormSection>
          </>
        ) : (
          <>
            {!isEdit ? (
              <FormSection label="// saldo de referência">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="acc-balance" className={financeLabelClass}>
                      {currencyAmountLabel(currency, isLiability)}
                    </label>
                    <FinanceInput
                      id="acc-balance"
                      className="mt-1"
                      inputMode="decimal"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder={isLiability ? "350,00" : "0,00"}
                    />
                  </div>
                  <div>
                    <label htmlFor="acc-balance-date" className={financeLabelClass}>
                      Data do saldo
                    </label>
                    <FinanceInput
                      id="acc-balance-date"
                      type="date"
                      className="mt-1"
                      value={balanceDate}
                      onChange={(e) => setBalanceDate(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alinha com o extrato ou app do banco nessa data — facilita reconciliação depois.
                </p>
              </FormSection>
            ) : null}

            {isLiability ? (
              <FormSection
                label={isCreditCard ? "// cartão — ciclo e limite" : "// empréstimo — condições"}
              >
                {isCreditCard ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="acc-limit" className={financeLabelClass}>
                        Limite de crédito
                      </label>
                      <FinanceInput
                        id="acc-limit"
                        className="mt-1"
                        inputMode="decimal"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        placeholder="1500"
                      />
                    </div>
                    <div>
                      <label htmlFor="acc-apr" className={financeLabelClass}>
                        TAEG (%)
                      </label>
                      <FinanceInput
                        id="acc-apr"
                        className="mt-1"
                        inputMode="decimal"
                        value={aprPercent}
                        onChange={(e) => setAprPercent(e.target.value)}
                        placeholder="22,5"
                      />
                    </div>
                    <div>
                      <label htmlFor="acc-cycle" className={financeLabelClass}>
                        Dia fecho ciclo (1–28)
                      </label>
                      <FinanceInput
                        id="acc-cycle"
                        className="mt-1"
                        inputMode="numeric"
                        value={billingCycleDay}
                        onChange={(e) => setBillingCycleDay(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label htmlFor="acc-due" className={financeLabelClass}>
                        Dia limite pagamento
                      </label>
                      <FinanceInput
                        id="acc-due"
                        className="mt-1"
                        inputMode="numeric"
                        value={paymentDueDay}
                        onChange={(e) => setPaymentDueDay(e.target.value)}
                        placeholder="20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="acc-principal" className={financeLabelClass}>
                        Capital inicial
                      </label>
                      <FinanceInput
                        id="acc-principal"
                        className="mt-1"
                        inputMode="decimal"
                        value={originalPrincipal}
                        onChange={(e) => setOriginalPrincipal(e.target.value)}
                        placeholder="12000"
                      />
                    </div>
                    <div>
                      <label htmlFor="acc-min" className={financeLabelClass}>
                        Prestação mínima
                      </label>
                      <FinanceInput
                        id="acc-min"
                        className="mt-1"
                        inputMode="decimal"
                        value={minimumPayment}
                        onChange={(e) => setMinimumPayment(e.target.value)}
                        placeholder="180"
                      />
                    </div>
                    <div>
                      <label htmlFor="acc-apr-loan" className={financeLabelClass}>
                        TAEG (%)
                      </label>
                      <FinanceInput
                        id="acc-apr-loan"
                        className="mt-1"
                        inputMode="decimal"
                        value={aprPercent}
                        onChange={(e) => setAprPercent(e.target.value)}
                        placeholder="6,5"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Opcional — ajuda os métodos Snowball e Avalanche a priorizar dívidas.
                </p>
              </FormSection>
            ) : null}

            <FormSection label="// aparência">
              <p className="text-xs text-muted-foreground">Cor no painel de contas (opcional)</p>
              <div className="flex flex-wrap gap-2">
                {ACCOUNT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    aria-label={preset.label}
                    aria-pressed={color === preset.id}
                    className={cn(
                      "size-8 border-2 transition-transform hover:scale-105",
                      preset.className,
                      color === preset.id
                        ? "border-foreground ring-2 ring-amber-500/40"
                        : "border-transparent opacity-80"
                    )}
                    onClick={() => setColor(color === preset.id ? undefined : preset.id)}
                  />
                ))}
              </div>
            </FormSection>

            <FormSection label="// património">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={includeInNetWorth}
                  onChange={(e) => setIncludeInNetWorth(e.target.checked)}
                  className="mt-0.5 size-4 rounded-none border-border bg-card text-amber-600 focus:ring-amber-600/50"
                />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Incluir no património líquido</span>
                  <span className="mt-1 block text-xs">
                    Desmarca para contas auxiliares que não queres somar ao total (ex.: conta de
                    projectos).
                  </span>
                  <span className="mt-2 block">
                    <FinanceGlossaryLink termId="net-worth" showShort />
                  </span>
                </span>
              </label>
            </FormSection>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {step === 0 ? (
          <>
            <FinanceButton
              className="min-w-[8rem] flex-1"
              disabled={loading || !canAdvance}
              onClick={() => setStep(1)}
            >
              Continuar
            </FinanceButton>
            <FinanceButton variant="outline" disabled={loading} onClick={handleClose}>
              Cancelar
            </FinanceButton>
          </>
        ) : (
          <>
            <FinanceButton
              className="min-w-[8rem] flex-1"
              disabled={loading || !canSubmit}
              onClick={submit}
            >
              {isEdit ? "Guardar" : "Criar conta"}
            </FinanceButton>
            <FinanceButton variant="outline" disabled={loading} onClick={() => setStep(0)}>
              Anterior
            </FinanceButton>
            <FinanceButton variant="ghost" disabled={loading} onClick={handleClose}>
              Cancelar
            </FinanceButton>
          </>
        )}
      </div>
    </AppModal>
  );
}
