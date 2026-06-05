import { paths } from "@/routes/paths";

export type FinancePillar =
  | "awareness"
  | "budget"
  | "savings"
  | "debt"
  | "protection"
  | "growth";

export const FINANCE_PILLARS: Record<
  FinancePillar,
  { label: string; description: string }
> = {
  awareness: {
    label: "Consciência",
    description: "Saber quanto entra, sai e onde vai",
  },
  budget: {
    label: "Orçamento",
    description: "Planear antes de gastar",
  },
  savings: {
    label: "Poupança",
    description: "Reserva, metas e automatismo",
  },
  debt: {
    label: "Dívida",
    description: "Juros, priorização e negociação",
  },
  protection: {
    label: "Protecção",
    description: "Colchão, risco e imprevistos",
  },
  growth: {
    label: "Crescimento",
    description: "Investimento, inflação e tempo",
  },
};

export type FinanceAppLink = {
  label: string;
  to: string;
};

export type FinanceGlossaryTerm = {
  id: string;
  term: string;
  short: string;
  definition: string;
  example: string;
  pillar: FinancePillar;
  appLink?: FinanceAppLink;
};

export type FinanceMicroLesson = {
  id: string;
  title: string;
  pillar: FinancePillar;
  body: string;
  example: string;
  appLink?: FinanceAppLink;
  relatedTermIds?: string[];
};

export const FINANCE_GLOSSARY: FinanceGlossaryTerm[] = [
  {
    id: "net-worth",
    term: "Património líquido",
    short: "O que possuis menos o que deves",
    definition:
      "Soma dos saldos de todas as contas incluídas no património, incluindo poupança e investimentos, menos dívidas como cartões e empréstimos. É uma fotografia do momento — não mede se este mês foi bom ou mau.",
    example:
      "Conta à ordem 800€ + poupança 2 000€ − cartão crédito 400€ = património líquido 2 400€.",
    pillar: "awareness",
    appLink: { label: "Ver património", to: paths.finance.home },
  },
  {
    id: "cash-flow",
    term: "Fluxo de caixa",
    short: "Entradas menos saídas num período",
    definition:
      "Quanto dinheiro entrou e saiu num mês ou semana. Diferente do património: podes ter património positivo e um mês de fluxo negativo. Transferências entre contas tuas não contam como despesa.",
    example: "Recebeste 1 500€ e gastaste 1 200€ — fluxo líquido do mês: +300€.",
    pillar: "awareness",
    appLink: { label: "Ver movimentos", to: paths.finance.movements },
  },
  {
    id: "savings-rate",
    term: "Taxa de poupança",
    short: "% do que entrou que guardaste",
    definition:
      "Percentagem da receita que foi para poupança no período. Na app, medimos transferências para contas de poupança face às receitas do mês. 10% já é um excelente começo.",
    example: "Entraram 2 000€ e transferiste 200€ para poupança — taxa de 10%.",
    pillar: "savings",
    appLink: { label: "Ver taxa no painel", to: paths.finance.home },
  },
  {
    id: "emergency-fund",
    term: "Fundo de emergência",
    short: "Reserva para perda de rendimento",
    definition:
      "Dinheiro separado para imprevistos graves: desemprego, reparações urgentes, saúde. Não é para férias nem oportunidades. Meta típica: 1 → 3 → 6 meses de despesas essenciais.",
    example: "Despesas mensais 1 000€ → primeiro alvo 1 000€ na conta poupança.",
    pillar: "protection",
    appLink: { label: "Método fundo emergência", to: paths.finance.methods },
  },
  {
    id: "rule-503020",
    term: "Regra 50/30/20",
    short: "Necessidades · desejos · futuro",
    definition:
      "Framework de orçamento: ~50% para necessidades (renda, comida, transportes), ~30% para desejos (lazer, compras não essenciais), ~20% para futuro (poupança, investimento, dívida extra). Ajusta à tua realidade.",
    example: "Com 1 800€ líquidos: 900€ necessidades, 540€ desejos, 360€ futuro.",
    pillar: "budget",
    appLink: { label: "Método 50/30/20", to: paths.finance.methods },
  },
  {
    id: "pay-yourself-first",
    term: "Paga-te a ti primeiro",
    short: "Poupar logo após receber",
    definition:
      "Decidir quanto poupar antes de gastar o resto — tratar a poupança como despesa fixa no dia do salário. Inverte a mentalidade «sobra no fim do mês», que raramente sobra.",
    example: "No dia 28, transferes 150€ para poupança antes de pagar o resto.",
    pillar: "savings",
    appLink: { label: "Registar transferência", to: paths.finance.movements },
  },
  {
    id: "envelope-budget",
    term: "Orçamento por envelopes",
    short: "Tecto por categoria",
    definition:
      "Atribuir um limite mensal a cada categoria de despesa (alimentação, lazer…). Quando o envelope esgota, ou paras ou transferes de outro — com consciência, não culpa.",
    example: "Envelope «Lazer» 120€/mês — a meio do mês já gastaste 95€.",
    pillar: "budget",
    appLink: { label: "Ver categorias", to: paths.finance.movements },
  },
  {
    id: "high-interest-debt",
    term: "Juro alto",
    short: "Crédito onde o custo mensal pesa",
    definition:
      "Dívida com taxa de juro elevada — tipicamente cartão de crédito revolving, crédito pessoal caro ou descoberto prolongado. Pagar só o mínimo prolonga anos de juros; por isso convém priorizar estes saldos.",
    example: "Cartão com 22% TAEG vs empréstimo automóvel a 5% — o cartão é «juro alto».",
    pillar: "debt",
    appLink: { label: "Método avalanche", to: paths.finance.methods },
  },
  {
    id: "debt-snowball",
    term: "Bola de neve (dívidas)",
    short: "Liquidar a dívida mais pequena primeiro",
    definition:
      "Pagar mínimos em todas as dívidas e atacar a de menor saldo com todo o extra disponível. Vitórias rápidas alimentam motivação; depois «rolas» a prestação libertada para a seguinte.",
    example: "Cartão A 200€ pago → prestação de 40€ passa para cartão B.",
    pillar: "debt",
    appLink: { label: "Método bola de neve", to: paths.finance.methods },
  },
  {
    id: "debt-avalanche",
    term: "Avalanche (dívidas)",
    short: "Atacar o juro mais alto primeiro",
    definition:
      "Priorizar matematicamente a dívida com maior taxa de juro. Poupa mais dinheiro total que a bola de neve, mas o progresso visual pode ser mais lento.",
    example: "Cartão a 22% TAEG recebe extra antes do empréstimo a 6%.",
    pillar: "debt",
    appLink: { label: "Método avalanche", to: paths.finance.methods },
  },
  {
    id: "reconciliation",
    term: "Reconciliação",
    short: "App alinhada com o banco real",
    definition:
      "Comparar os saldos na app com os extratos ou app bancária. Pequenos desvios são normais (movimentos pendentes, comissões). O objectivo é confiança nos números, não perfeição ao cêntimo.",
    example: "App mostra 842€, banco 840€ — verificas uma comissão de 2€ em falta.",
    pillar: "awareness",
    appLink: { label: "Ver contas", to: paths.finance.accounts },
  },
  {
    id: "transfer",
    term: "Transferência",
    short: "Mover dinheiro entre contas tuas",
    definition:
      "Movimento entre contas à ordem, poupança ou investimento. Não é despesa nem receita — o dinheiro continua teu. Transferir para poupança aumenta a taxa de poupança sem «gastar».",
    example: "Ordem → Poupança 100€ no dia do salário.",
    pillar: "savings",
    appLink: { label: "Registar transferência", to: paths.finance.movements },
  },
  {
    id: "inflation",
    term: "Inflação",
    short: "Poder de compra desce com o tempo",
    definition:
      "O mesmo euro compra menos ao longo dos anos. Dinheiro parado na poupança protege liquidez mas pode perder valor real. Investir introduz risco — por isso o colchão vem primeiro.",
    example: "Café a 0,80€ há 10 anos custa 1,20€ hoje.",
    pillar: "growth",
  },
  {
    id: "etf",
    term: "ETF indexado",
    short: "Cesto diversificado de activos",
    definition:
      "Fundo que replica um índice (ex.: mercado global) com custos baixos. Veículo introdutório comum para investimento a longo prazo — horizonte típico 5+ anos.",
    example: "25€/mês num ETF global durante 10+ anos — volatilidade no curto prazo.",
    pillar: "growth",
    appLink: { label: "Método intro investimento", to: paths.finance.methods },
  },
  {
    id: "weekly-review",
    term: "Revisão semanal",
    short: "15 minutos de ritual financeiro",
    definition:
      "Momento fixo para olhar receitas, despesas, método activo e uma melhoria concreta. Consistência importa mais que perfeição contabilística.",
    example: "Domingo 10h: 15 minutos com a app e um café.",
    pillar: "awareness",
    appLink: { label: "Fazer revisão", to: paths.finance.review },
  },
  {
    id: "variable-income",
    term: "Renda variável",
    short: "Receitas irregulares (freelance)",
    definition:
      "Quando o rendimento muda mês a mês, orçamenta com a média dos últimos meses — não o melhor mês. Mantém um fundo «mês fraco» separado.",
    example: "Média 1 400€, mês bom 2 200€, mês mau 900€ — base de despesas ~1 200€.",
    pillar: "budget",
    appLink: { label: "Método renda variável", to: paths.finance.methods },
  },
];

export const FINANCE_MICRO_LESSONS: FinanceMicroLesson[] = [
  {
    id: "lesson-net-worth",
    title: "Património ≠ fluxo do mês",
    pillar: "awareness",
    body:
      "O património é uma fotografia: quanto vales hoje. O fluxo é um filme: quanto entrou e saiu este mês. Os dois contam histórias diferentes — confundir gera ansiedade desnecessária.",
    example: "Património 5 000€ positivo, mas mês de férias com fluxo −400€ — normal e temporário.",
    appLink: { label: "Abrir painel", to: paths.finance.home },
    relatedTermIds: ["net-worth", "cash-flow"],
  },
  {
    id: "lesson-first-transfer",
    title: "A primeira transferência para poupança",
    pillar: "savings",
    body:
      "Não precisa de ser grande. 10€ simbólicos criam o hábito de separar dinheiro. O acto importa mais que o montante inicial — podes aumentar depois.",
    example: "Dia 1: transferes 20€ ordem → poupança. Semanalmente aumentas 5€.",
    appLink: { label: "Registar transferência", to: paths.finance.movements },
    relatedTermIds: ["pay-yourself-first", "transfer"],
  },
  {
    id: "lesson-emergency-not-vacation",
    title: "Emergência não é férias",
    pillar: "protection",
    body:
      "Define por escrito o que conta como emergência antes de precisar. Perda de emprego, avaria do carro para trabalhar — sim. Promoção de voos — não.",
    example: "Lista: desemprego, saúde urgente, reparação casa. Fora: viagens, saldos.",
    appLink: { label: "Método fundo emergência", to: paths.finance.methods },
    relatedTermIds: ["emergency-fund"],
  },
  {
    id: "lesson-503020-flex",
    title: "50/30/20 é ponto de partida",
    pillar: "budget",
    body:
      "Em cidades caras ou com renda alta, 50% de necessidades pode ser apertado. Usa a regra como bússola, não como sentença — ajusta e revisa mensalmente.",
    example: "Necessidades 55%, desejos 25%, futuro 20% — válido se consciente.",
    appLink: { label: "Explorar métodos", to: paths.finance.methods },
    relatedTermIds: ["rule-503020"],
  },
  {
    id: "lesson-categories-habits",
    title: "Categorias revelam hábitos",
    pillar: "awareness",
    body:
      "Registar despesas por categoria não é para te julgar — é para ver padrões. Três semanas de dados já mostram onde o dinheiro «desaparece».",
    example: "Subscrições somam 47€/mês — cancelas uma que não usas.",
    appLink: { label: "Registar despesa", to: paths.finance.movements },
    relatedTermIds: ["cash-flow", "envelope-budget"],
  },
  {
    id: "lesson-snowball-vs-avalanche",
    title: "Snowball ou avalanche?",
    pillar: "debt",
    body:
      "Snowball: motivação emocional (dívida pequena primeiro). Avalanche: menos juros pagos (taxa alta primeiro). Ambos funcionam se mantiveres mínimos em todas.",
    example: "Precisas de vitórias rápidas? Snowball. Queres minimizar custo total? Avalanche.",
    appLink: { label: "Ver métodos de dívida", to: paths.finance.methods },
    relatedTermIds: ["debt-snowball", "debt-avalanche"],
  },
  {
    id: "lesson-review-ritual",
    title: "Ritual fixo vence «quando der»",
    pillar: "awareness",
    body:
      "Bloqueia 15 minutos na mesma hora todas as semanas. Estrutura reduz procrastinação — a revisão guiada na app dá-te as perguntas certas.",
    example: "Domingo 10h no calendário, telemóvel em silêncio, revisão na app.",
    appLink: { label: "Iniciar revisão", to: paths.finance.review },
    relatedTermIds: ["weekly-review"],
  },
  {
    id: "lesson-invest-after-cushion",
    title: "Colchão antes de investir",
    pillar: "growth",
    body:
      "Investir sem reserva obriga a vender em pânico numa crise. Três meses de despesas na poupança é o patamar mínimo recomendado antes de ETFs ou PPR.",
    example: "Poupança 3 000€ (3 meses) → só então 50€/mês em investimento.",
    appLink: { label: "Método intro investimento", to: paths.finance.methods },
    relatedTermIds: ["emergency-fund", "etf", "inflation"],
  },
];

export function getGlossaryTerm(id: string) {
  return FINANCE_GLOSSARY.find((t) => t.id === id);
}

/** URL para abrir o glossário num termo (Aprender → Glossário). */
export function financeGlossaryHref(termId: string) {
  const term = getGlossaryTerm(termId);
  const base = `${paths.finance.learn}?tab=glossary`;
  if (!term) return base;
  return `${base}&q=${encodeURIComponent(term.term)}`;
}

export function getMicroLesson(id: string) {
  return FINANCE_MICRO_LESSONS.find((l) => l.id === id);
}

export function filterLearnContent(
  query: string,
  pillar: FinancePillar | "all"
) {
  const q = query.trim().toLowerCase();
  const match = (text: string) => !q || text.toLowerCase().includes(q);
  const pillarOk = (p: FinancePillar) => pillar === "all" || p === pillar;

  const terms = FINANCE_GLOSSARY.filter(
    (t) =>
      pillarOk(t.pillar) &&
      (match(t.term) || match(t.short) || match(t.definition) || match(t.example))
  );

  const lessons = FINANCE_MICRO_LESSONS.filter(
    (l) =>
      pillarOk(l.pillar) &&
      (match(l.title) || match(l.body) || match(l.example))
  );

  return { terms, lessons };
}
