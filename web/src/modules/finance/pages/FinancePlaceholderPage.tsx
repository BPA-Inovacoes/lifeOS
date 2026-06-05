type Props = {
  title: string;
  description: string;
};

/** Página temporária até implementação F1.0. */
export function FinancePlaceholderPage({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <p className="mt-6 font-mono text-xs uppercase tracking-wider text-amber-500/60">
        Em breve · F1.0
      </p>
    </div>
  );
}
