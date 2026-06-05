import { paths } from "@/routes/paths";

import type { FinanceAppLink } from "@/modules/finance/content/financeLearnContent";
import type { MethodQuizQuestion } from "@/modules/finance/content/financeMethodEducation";

export type ClarStepId = "clarify" | "link" | "apply" | "repeat";

export const CLAR_STEPS: { id: ClarStepId; letter: string; label: string; hint: string }[] = [
  { id: "clarify", letter: "C", label: "Clarifica", hint: "Um conceito, uma frase-chave" },
  { id: "link", letter: "L", label: "Liga", hint: "Exemplo concreto ao teu mundo" },
  { id: "apply", letter: "A", label: "Aplica", hint: "Micro-acção na app" },
  { id: "repeat", letter: "R", label: "Repete", hint: "Quiz rápido para fixar" },
];

export type ClarLessonContent = {
  lessonId: string;
  clarify: {
    headline: string;
    keyPoint: string;
    definition: string;
  };
  link: {
    scenario: string;
    inYourCase: string;
    relatedTermIds: string[];
  };
  apply: {
    instruction: string;
    appLink?: FinanceAppLink;
    methodPath?: string;
    methodLabel?: string;
  };
  repeat: {
    quiz: MethodQuizQuestion[];
    revisitHint: string;
  };
};

export const FINANCE_CLAR_LESSONS: ClarLessonContent[] = [
  {
    lessonId: "lesson-net-worth",
    clarify: {
      headline: "Património e fluxo contam histórias diferentes",
      keyPoint: "Património = fotografia · Fluxo = filme do mês",
      definition:
        "O património líquido soma o que possuis menos o que deves hoje. O fluxo de caixa mede entradas menos saídas num período. Confundir os dois gera ansiedade: podes estar bem no longo prazo e ter um mês apertado — ou o contrário.",
    },
    link: {
      scenario:
        "Tens 5 000€ de património positivo mas gastaste 400€ a mais do que recebeste num mês de férias. Isso não apaga o património de imediato — é um mês de fluxo negativo, normal e temporário.",
      inYourCase:
        "Abre o painel e olha os dois números separadamente: património no topo, fluxo no resumo mensal. Anota mentalmente qual te preocupa mais — muitas vezes é só o fluxo.",
      relatedTermIds: ["net-worth", "cash-flow"],
    },
    apply: {
      instruction:
        "Compara património e fluxo do mês no painel — 30 segundos, sem julgar.",
      appLink: { label: "Abrir painel", to: paths.finance.home },
    },
    repeat: {
      revisitHint: "Rever daqui a 7 dias na revisão semanal — estes dois números voltam sempre.",
      quiz: [
        {
          id: "q1",
          question: "O que é o património líquido?",
          options: [
            { id: "a", text: "Receitas menos despesas deste mês" },
            { id: "b", text: "O que possuis menos o que deves, hoje" },
            { id: "c", text: "Só o saldo da conta à ordem" },
          ],
          correctId: "b",
          explanation: "Património é uma fotografia instantânea de todas as contas e dívidas.",
        },
        {
          id: "q2",
          question: "Fluxo negativo num mês significa sempre património negativo?",
          options: [
            { id: "a", text: "Sim, são a mesma coisa" },
            { id: "b", text: "Não — podes ter património positivo e um mês apertado" },
            { id: "c", text: "Só se tiveres dívida no cartão" },
          ],
          correctId: "b",
          explanation: "Um mês mau no fluxo não apaga anos de poupança — são métricas distintas.",
        },
      ],
    },
  },
  {
    lessonId: "lesson-first-transfer",
    clarify: {
      headline: "O hábito começa antes do montante",
      keyPoint: "10€ transferidos valem mais que 0€ planeados",
      definition:
        "Pagar-te a ti primeiro significa decidir quanto poupar no dia em que recebes — tratar a poupança como despesa fixa. O montante inicial pode ser simbólico; o acto de separar dinheiro é o que forma o circuito neural do hábito.",
    },
    link: {
      scenario:
        "No dia 28 transferes 20€ da ordem para poupança antes de pagar contas. Nas semanas seguintes aumentas 5€. Em três meses já são 50€ automáticos — sem «sobra no fim do mês».",
      inYourCase:
        "Escolhe um valor que não te aperta — mesmo 5€ ou 10€. O objectivo desta semana é uma transferência registada, não optimizar a taxa de poupança.",
      relatedTermIds: ["pay-yourself-first", "transfer", "savings-rate"],
    },
    apply: {
      instruction: "Regista uma transferência ordem → poupança (mesmo que pequena).",
      appLink: { label: "Registar transferência", to: paths.finance.movements },
    },
    repeat: {
      revisitHint: "Repete no próximo salário — consistência > montante.",
      quiz: [
        {
          id: "q1",
          question: "Por que «pagar-te a ti primeiro» funciona?",
          options: [
            { id: "a", text: "Porque o banco dá juros extra no dia 1" },
            { id: "b", text: "Porque poupar no fim do mês raramente sobra" },
            { id: "c", text: "Porque reduz impostos automaticamente" },
          ],
          correctId: "b",
          explanation: "Decidir poupança no início inverte a ordem habitual de gastar tudo e ver o que resta.",
        },
        {
          id: "q2",
          question: "Transferência ordem → poupança conta como despesa?",
          options: [
            { id: "a", text: "Sim, é saída de dinheiro" },
            { id: "b", text: "Não — o dinheiro continua teu, noutra conta" },
            { id: "c", text: "Só se for acima de 100€" },
          ],
          correctId: "b",
          explanation: "Transferências entre contas tuas não são despesas; aumentam a taxa de poupança sem «gastar».",
        },
      ],
    },
  },
  {
    lessonId: "lesson-emergency-not-vacation",
    clarify: {
      headline: "Emergência tem fronteiras — define-as antes de precisar",
      keyPoint: "Fundo de emergência ≠ fundo de férias",
      definition:
        "Reserva para perda de rendimento, saúde urgente ou reparações que impedem trabalhar. Não é para promoções, viagens ou «oportunidades». Escrever a lista antes evita racionalizar gastos emocionais como emergência.",
    },
    link: {
      scenario:
        "Lista escrita: desemprego, saúde urgente, avaria do carro para ir trabalhar. Fora da lista: viagens, saldos, gadgets. Quando surge um gasto grande, consultas a lista em 10 segundos.",
      inYourCase:
        "Se ainda não tens fundo, o primeiro alvo é 1 mês de despesas essenciais — não 6 meses de uma vez. Mete o número na meta do método de emergência.",
      relatedTermIds: ["emergency-fund"],
    },
    apply: {
      instruction: "Abre o método de fundo de emergência e define (ou revê) a tua meta.",
      methodPath: paths.finance.methods,
      methodLabel: "Método fundo de emergência",
      appLink: { label: "Ver métodos", to: paths.finance.methods },
    },
    repeat: {
      revisitHint: "Relembra a lista quando tentares usar a poupança para algo «especial».",
      quiz: [
        {
          id: "q1",
          question: "Qual destes é uso correcto do fundo de emergência?",
          options: [
            { id: "a", text: "Promoção de voos para férias" },
            { id: "b", text: "Desemprego inesperado sem outra reserva" },
            { id: "c", text: "Novo telemóvel porque saiu modelo" },
          ],
          correctId: "b",
          explanation: "Emergência cobre perda de rendimento ou imprevistos graves — não desejos planeados.",
        },
        {
          id: "q2",
          question: "Qual é um primeiro alvo realista?",
          options: [
            { id: "a", text: "6 meses de despesas no primeiro mês" },
            { id: "b", text: "1 mês de despesas essenciais" },
            { id: "c", text: "Não precisas de meta numérica" },
          ],
          correctId: "b",
          explanation: "1 → 3 → 6 meses é progressão típica; começa pelo primeiro degrau.",
        },
      ],
    },
  },
  {
    lessonId: "lesson-503020-flex",
    clarify: {
      headline: "50/30/20 é bússola, não sentença",
      keyPoint: "Ajusta percentagens — mantém a estrutura",
      definition:
        "Framework clássico: ~50% necessidades, ~30% desejos, ~20% futuro (poupança, investimento, dívida extra). Em rendas altas ou cidades caras, 50% de necessidades pode ser apertado. O valor está em separar consciente mente três «bolsos», não em bater percentagens exactas.",
    },
    link: {
      scenario:
        "Com 1 800€ líquidos o modelo dá 900/540/360. Na tua vida, necessidades podem ser 55% — válido se registares e revisares, não se fores por inércia.",
      inYourCase:
        "Estima os três blocos com os teus números reais do último mês. Não precisas de precisão ao cêntimo — precisas de ver onde o «futuro» ficou short.",
      relatedTermIds: ["rule-503020", "envelope-budget"],
    },
    apply: {
      instruction: "Explora o método 50/30/20 e activa-o se fizer sentido para ti.",
      appLink: { label: "Método 50/30/20", to: paths.finance.methods },
    },
    repeat: {
      revisitHint: "Revisa percentagens no fim do mês — uma vez por mês basta.",
      quiz: [
        {
          id: "q1",
          question: "O bloco «futuro» (20%) inclui…",
          options: [
            { id: "a", text: "Só investimentos em bolsa" },
            { id: "b", text: "Poupança, investimento e pagamentos extra de dívida" },
            { id: "c", text: "Restaurantes e lazer" },
          ],
          correctId: "b",
          explanation: "Futuro = tudo o que constrói segurança ou património a longo prazo.",
        },
        {
          id: "q2",
          question: "55/25/20 em vez de 50/30/20 é…",
          options: [
            { id: "a", text: "Errado — tens de seguir exactamente" },
            { id: "b", text: "Válido se consciente e revisto" },
            { id: "c", text: "Impossível de medir na app" },
          ],
          correctId: "b",
          explanation: "A regra é ponto de partida; a tua realidade manda nos números.",
        },
      ],
    },
  },
  {
    lessonId: "lesson-categories-habits",
    clarify: {
      headline: "Categorias são espelho, não tribunal",
      keyPoint: "Três semanas de dados já mostram padrões",
      definition:
        "Registar despesas por categoria serve para ver onde o dinheiro «desaparece» — subscrições esquecidas, delivery repetido, taxas pequenas que somam. Não é para culpa; é para decisão informada.",
    },
    link: {
      scenario:
        "Após três semanas, subscrições somam 47€/mês. Cancelas uma que não usas — 564€/ano recuperados sem cortar o essencial.",
      inYourCase:
        "Filtra despesas dos últimos 30 dias por categoria. Qual é a surpresa? Anota uma só acção (cancelar, limitar, ou «está ok»).",
      relatedTermIds: ["cash-flow", "envelope-budget"],
    },
    apply: {
      instruction: "Regista uma despesa com categoria ou revê as top 3 categorias do mês.",
      appLink: { label: "Ver movimentos", to: paths.finance.movements },
    },
    repeat: {
      revisitHint: "Na revisão semanal, olha sempre as top 3 categorias.",
      quiz: [
        {
          id: "q1",
          question: "Para que serve categorizar despesas?",
          options: [
            { id: "a", text: "Para a app calcular impostos" },
            { id: "b", text: "Para ver padrões e hábitos de gasto" },
            { id: "c", text: "Para bloquear compras automaticamente" },
          ],
          correctId: "b",
          explanation: "Categorias revelam comportamento — a decisão continua a ser tua.",
        },
        {
          id: "q2",
          question: "Quantos dias de registo já ajudam a ver padrões?",
          options: [
            { id: "a", text: "Pelo menos 1 ano" },
            { id: "b", text: "Cerca de 3 semanas com registo consistente" },
            { id: "c", text: "Só no fim do mês, nunca antes" },
          ],
          correctId: "b",
          explanation: "Não precisas de perfeição histórica — algumas semanas já contam história.",
        },
      ],
    },
  },
  {
    lessonId: "lesson-snowball-vs-avalanche",
    clarify: {
      headline: "Duas estratégias válidas — escolhe pela tua psicologia",
      keyPoint: "Snowball = motivação · Avalanche = menos juros",
      definition:
        "Bola de neve: mínimos em todas, extra na dívida menor — vitórias rápidas. Avalanche: extra na maior taxa de juro — menos custo total. Ambos exigem pagar mínimos em todas; a diferença é onde vai o dinheiro extra.",
    },
    link: {
      scenario:
        "Cartão A 200€ a 18% vs empréstimo 5 000€ a 6%. Avalanche ataca A primeiro. Se precisas de fechar uma conta pequena para respirar, snowball no cartão de 200€.",
      inYourCase:
        "Lista as tuas dívidas com saldo e taxa (estimada se não souberes). Precisas de vitória rápida ou de minimizar juros totais?",
      relatedTermIds: ["debt-snowball", "debt-avalanche"],
    },
    apply: {
      instruction: "Compara os métodos bola de neve e avalanche na app.",
      appLink: { label: "Métodos de dívida", to: paths.finance.methods },
    },
    repeat: {
      revisitHint: "Quando liquidares uma dívida, decide de novo — a ordem pode mudar.",
      quiz: [
        {
          id: "q1",
          question: "Avalanche prioriza…",
          options: [
            { id: "a", text: "A dívida com menor saldo" },
            { id: "b", text: "A dívida com maior taxa de juro" },
            { id: "c", text: "A dívida mais antiga" },
          ],
          correctId: "b",
          explanation: "Atacar juro alto minimiza o custo total pago ao banco.",
        },
        {
          id: "q2",
          question: "Em ambos os métodos deves…",
          options: [
            { id: "a", text: "Ignorar as outras dívidas" },
            { id: "b", text: "Pagar o mínimo em todas as dívidas" },
            { id: "c", text: "Só pagar uma de cada vez" },
          ],
          correctId: "b",
          explanation: "Mínimos em todas evitam penalizações; o extra vai para a prioridade escolhida.",
        },
      ],
    },
  },
  {
    lessonId: "lesson-review-ritual",
    clarify: {
      headline: "Horário fixo vence boa intenção",
      keyPoint: "15 minutos na agenda > «quando der»",
      definition:
        "Revisão financeira semanal: olhar entradas, saídas, método activo e uma melhoria concreta. Bloquear o mesmo slot reduz procrastinação. Consistência importa mais que perfeição contabilística.",
    },
    link: {
      scenario:
        "Domingo 10h, telemóvel em silêncio, 15 minutos com café. Quatro domingos seguidos e já é hábito — falhar um não apaga os três anteriores.",
      inYourCase:
        "Escolhe dia e hora realistas (não «domingo ideal» se sabes que viajas). Mete alarme ou evento recorrente no calendário externo.",
      relatedTermIds: ["weekly-review"],
    },
    apply: {
      instruction: "Inicia uma revisão semanal agora — mesmo parcial.",
      appLink: { label: "Iniciar revisão", to: paths.finance.review },
    },
    repeat: {
      revisitHint: "Marca no calendário a próxima revisão logo após concluir esta.",
      quiz: [
        {
          id: "q1",
          question: "Quanto tempo dura a revisão semanal recomendada?",
          options: [
            { id: "a", text: "Cerca de 15 minutos" },
            { id: "b", text: "Pelo menos 2 horas" },
            { id: "c", text: "Só no fim do ano" },
          ],
          correctId: "a",
          explanation: "Curta e regular — o objectivo é manter consciência, não auditoria fiscal.",
        },
        {
          id: "q2",
          question: "Falhar uma revisão significa…",
          options: [
            { id: "a", text: "Recomeçar tudo do zero" },
            { id: "b", text: "Retomar na semana seguinte — consistência > perfeição" },
            { id: "c", text: "Desactivar o método activo" },
          ],
          correctId: "b",
          explanation: "Um buraco não invalida o ritual; retomar é o comportamento que importa.",
        },
      ],
    },
  },
  {
    lessonId: "lesson-invest-after-cushion",
    clarify: {
      headline: "Colchão primeiro — investir sem reserva é risco emocional",
      keyPoint: "3 meses de despesas antes de ETFs",
      definition:
        "Investir sem fundo de emergência obriga a vender em pânico numa crise ou imprevisto. Três meses de despesas essenciais na poupança é patamar mínimo antes de canalizar para activos voláteis. Inflação erode poupança parada — mas liquidez protege psicologicamente.",
    },
    link: {
      scenario:
        "Poupança 3 000€ (3 meses de despesas de 1 000€) → só então 50€/mês em ETF. Mercado desce 20% — não precisas de vender para pagar renda.",
      inYourCase:
        "Calcula despesas essenciais mensais × 3. Estás lá? Se não, o «investimento» deste mês pode ser reforçar a poupança.",
      relatedTermIds: ["emergency-fund", "etf", "inflation"],
    },
    apply: {
      instruction: "Verifica saldo de poupança vs meta de emergência no painel.",
      appLink: { label: "Ver painel", to: paths.finance.home },
      methodLabel: "Método intro investimento",
    },
    repeat: {
      revisitHint: "Reavalia quando o fundo de emergência atingir cada marco (1, 3, 6 meses).",
      quiz: [
        {
          id: "q1",
          question: "Por que investir sem colchão é arriscado?",
          options: [
            { id: "a", text: "Porque ETFs são ilegais sem poupança" },
            { id: "b", text: "Porque imprevistos podem forçar venda em mau momento" },
            { id: "c", text: "Porque o banco cobra multa" },
          ],
          correctId: "b",
          explanation: "Sem reserva, uma queda do mercado coincide com necessidade de cash — duplo stress.",
        },
        {
          id: "q2",
          question: "Patamar mínimo de emergência antes de investir volátil?",
          options: [
            { id: "a", text: "1 semana de despesas" },
            { id: "b", text: "Cerca de 3 meses de despesas essenciais" },
            { id: "c", text: "Nenhum — investe sempre primeiro" },
          ],
          correctId: "b",
          explanation: "Três meses dão margem para desemprego curto ou reparações sem tocar no investimento.",
        },
      ],
    },
  },
];

export function getClarLesson(lessonId: string) {
  return FINANCE_CLAR_LESSONS.find((l) => l.lessonId === lessonId);
}

export function clarStepIndex(step: ClarStepId): number {
  return CLAR_STEPS.findIndex((s) => s.id === step);
}

export function nextClarStep(step: ClarStepId): ClarStepId | null {
  const idx = clarStepIndex(step);
  if (idx < 0 || idx >= CLAR_STEPS.length - 1) return null;
  return CLAR_STEPS[idx + 1]!.id;
}
