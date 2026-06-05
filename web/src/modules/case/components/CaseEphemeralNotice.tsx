type Props = {
  message?: string;
};

export function CaseEphemeralNotice({ message }: Props) {
  const text =
    message ??
    "As conversas não são guardadas. Ao fechar o Case, o histórico desta sessão desaparece.";

  return (
    <p className="border-b border-border bg-muted/30 px-4 py-2 text-[11px] leading-snug text-muted-foreground">
      {text}
    </p>
  );
}
