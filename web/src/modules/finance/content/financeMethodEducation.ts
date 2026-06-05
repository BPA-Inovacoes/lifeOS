/** Conteúdo educativo: guia, quiz e simulação por método */

export type MethodSimulatorKind =
  | "split-503020"
  | "emergency-fund"
  | "savings-rate"
  | "debt-snowball"
  | "debt-avalanche"
  | "pay-yourself-first"
  | "envelope-budget"
  | "variable-income";

export type MethodQuizOption = {
  id: string;
  text: string;
};

export type MethodQuizQuestion = {
  id: string;
  question: string;
  options: MethodQuizOption[];
  correctId: string;
  explanation: string;
};

export type MethodEducationSection = {
  title: string;
  body: string;
};

export type MethodEducationContent = {
  id: string;
  summary: string;
  sections: MethodEducationSection[];
  whenToUse: string[];
  avoidWhen: string[];
  quiz: MethodQuizQuestion[];
  simulator?: MethodSimulatorKind;
};

export const FINANCE_METHOD_EDUCATION: MethodEducationContent[] = [
  {
    id: "first-30-days",
    summary:
      "Trilho de onboarding de 30 dias para mapear contas, registar movimentos, formar hábito de revisão e escolher um método contínuo. Ideal para quem começa do zero ou quer reset organizacional.",
    sections: [
      {
        title: "O que é",
        body: "Um programa guiado em passos diários/semanais que te leva de «não sei onde está o meu dinheiro» a ter contas, histórico de gastos, primeira poupança e ritual de revisão. Não é um truque rápido — é construir fundações.",
      },
      {
        title: "Como funciona na prática",
        body: "Cada passo pede uma acção concreta na app: criar contas, registar receitas e despesas, fazer transferências, completar revisões semanais. O progresso guarda-se — podes retomar onde paraste.",
      },
      {
        title: "Resultado esperado",
        body: "Ao fim de ~30 dias deves ter: mapa financeiro completo, categorias úteis, taxa de poupança visível, meta de emergência definida e um método contínuo escolhido (50/30/20, fundo de emergência ou revisão semanal).",
      },
    ],
    whenToUse: [
      "Acabas de instalar a app ou nunca organizaste finanças",
      "Tens contas espalhadas e pouco registo de movimentos",
      "Queres um roteiro claro em vez de decidir sozinho",
    ],
    avoidWhen: [
      "Já tens sistema maduro e só queres optimizar investimentos",
      "Precisas de resolver dívida urgente — começa por bola de neve ou avalanche",
    ],
    quiz: [
      {
        id: "q1",
        question: "Qual é o objectivo principal dos Primeiros 30 dias?",
        options: [
          { id: "a", text: "Enriquecer rapidamente com investimentos" },
          { id: "b", text: "Mapear dinheiro e formar hábitos base" },
          { id: "c", text: "Eliminar todas as dívidas em um mês" },
        ],
        correctId: "b",
        explanation: "O trilho foca consciência, registo e hábitos — não enriquecimento rápido.",
      },
      {
        id: "q2",
        question: "Por que separar conta à ordem e poupança?",
        options: [
          { id: "a", text: "Para pagar menos impostos automaticamente" },
          { id: "b", text: "Para reduzir gastos por acidente no dia-a-dia" },
          { id: "c", text: "Porque o banco exige duas contas" },
        ],
        correctId: "b",
        explanation: "Separar reduz a tentação de gastar reservas no fluxo corrente.",
      },
      {
        id: "q3",
        question: "Quantas revisões semanais fazem parte do trilho?",
        options: [
          { id: "a", text: "Uma só, no fim" },
          { id: "b", text: "Duas" },
          { id: "c", text: "Quatro" },
        ],
        correctId: "c",
        explanation: "Quatro revisões semanais ajudam a formar o ritual fixo.",
      },
    ],
    simulator: "savings-rate",
  },
  {
    id: "rule-50-30-20",
    summary:
      "Framework simples: 50% da receita líquida para necessidades, 30% para desejos e 20% para futuro (poupança, investimento ou dívida extra). Fácil de memorizar e revisar mensalmente.",
    sections: [
      {
        title: "O que é",
        body: "Regra de repartição percentual criada por Elizabeth Warren. Divide o rendimento líquido em três blocos com tectos claros — evita micro-gestão de dezenas de categorias.",
      },
      {
        title: "Os três blocos",
        body: "Necessidades (50%): renda, alimentação base, transportes, utilities, seguros, mínimos de crédito. Desejos (30%): lazer, restaurantes, compras não essenciais. Futuro (20%): poupança, investimento ou pagamentos extra a dívidas.",
      },
      {
        title: "Flexibilidade",
        body: "Em cidades caras ou rendimento baixo, 50% de necessidades pode ser apertado — ajusta para 55/25/20 temporariamente. O valor está na consciência dos blocos, não na rigidez matemática.",
      },
    ],
    whenToUse: [
      "Tens receita relativamente estável",
      "Queres estrutura simples sem envelopes por categoria",
      "Já registaste despesas e queres tectos claros",
    ],
    avoidWhen: [
      "Rendimento muito irregular — preferir «Renda variável»",
      "Dívida crítica — priorizar avalanche ou bola de neve primeiro",
    ],
    quiz: [
      {
        id: "q1",
        question: "Os 20% «futuro» podem incluir…",
        options: [
          { id: "a", text: "Férias de luxo" },
          { id: "b", text: "Pagamento extra a dívida" },
          { id: "c", text: "Jantares fora" },
        ],
        correctId: "b",
        explanation: "Futuro = poupança, investimento ou reduzir dívida — não desejos.",
      },
      {
        id: "q2",
        question: "50/30/20 aplica-se sobre…",
        options: [
          { id: "a", text: "Salário bruto antes de impostos" },
          { id: "b", text: "Receita líquida que entra na conta" },
          { id: "c", text: "Património total" },
        ],
        correctId: "b",
        explanation: "Usa sempre o líquido mensal real como base.",
      },
    ],
    simulator: "split-503020",
  },
  {
    id: "emergency-fund",
    summary:
      "Reserva líquida para imprevistos — perda de rendimento, reparações, saúde. Meta típica: 3–6 meses de despesas antes de investir agressivamente.",
    sections: [
      {
        title: "O que é",
        body: "Dinheiro separado e acessível (poupança, não investido) para cobrir despesas se o rendimento falha ou surge um custo inesperado. Não é fundo de férias nem entrada para carro.",
      },
      {
        title: "Metas em degraus",
        body: "1 mês de despesas → protege imprevistos pequenos. 3 meses → perda de emprego curta. 6 meses → maior segurança para freelance ou sector volátil.",
      },
      {
        title: "Onde guardar",
        body: "Conta poupança separada do corrente, de baixo risco e liquidez imediata. Automatiza transferência mensal no dia após salário.",
      },
    ],
    whenToUse: [
      "Ainda não tens reserva ou tens menos de 3 meses de despesas",
      "Antes de aumentar investimentos ou assumir novo crédito",
    ],
    avoidWhen: [
      "Já tens colchão sólido e queres optimizar crescimento — ver Intro investimento",
    ],
    quiz: [
      {
        id: "q1",
        question: "O que NÃO é emergência financeira?",
        options: [
          { id: "a", text: "Franquia de hospital" },
          { id: "b", text: "Promoção de telemóvel" },
          { id: "c", text: "Atraso de salário" },
        ],
        correctId: "b",
        explanation: "Promoções e desejos não justificam usar o colchão.",
      },
      {
        id: "q2",
        question: "Primeira meta recomendada:",
        options: [
          { id: "a", text: "1 mês de despesas" },
          { id: "b", text: "1 ano de salário" },
          { id: "c", text: "500 Kz fixos para todos" },
        ],
        correctId: "a",
        explanation: "Um mês de despesas é o primeiro patamar realista e útil.",
      },
    ],
    simulator: "emergency-fund",
  },
  {
    id: "pay-yourself-first",
    summary:
      "Poupar um valor ou % fixo logo após receber rendimento — antes de pagar restantes despesas. Trata poupança como a primeira «conta» a pagar.",
    sections: [
      {
        title: "O que é",
        body: "Inverte a ordem mental: em vez de «sobra no fim do mês», decides quanto poupas no início. Automatiza transferência corrente → poupança no dia do salário.",
      },
      {
        title: "Por que funciona",
        body: "Gastos expandem-se ao espaço disponível (lei de Parkinson). Se poupança fica para o fim, raramente sobra. Pagar-te primeiro força adaptação dos gastos.",
      },
    ],
    whenToUse: [
      "Tens receita previsível e dificuldade em poupar o que «sobra»",
      "Queres hábito simples sem orçamento detalhado",
    ],
    avoidWhen: [
      "Rendimento irregular sem fundo mês fraco — combinar com Renda variável",
    ],
    quiz: [
      {
        id: "q1",
        question: "«Pagar-te a ti primeiro» significa…",
        options: [
          { id: "a", text: "Comprar o que queres antes das contas" },
          { id: "b", text: "Transferir poupança logo após receber" },
          { id: "c", text: "Investir todo o salário" },
        ],
        correctId: "b",
        explanation: "Poupança automática no início do mês — não consumo impulsivo.",
      },
    ],
    simulator: "pay-yourself-first",
  },
  {
    id: "envelope-budget",
    summary:
      "Orçamento por categorias com tecto mensal — cada «envelope» é um limite de gasto. Quando esgota, paras ou realocas conscientemente.",
    sections: [
      {
        title: "O que é",
        body: "Método clássico (cash envelopes) adaptado digitalmente: cada categoria (Alimentação, Lazer…) tem tecto. Registas despesas e vês saldo restante por envelope.",
      },
      {
        title: "Ritmo mensal",
        body: "Início do mês: define tectos. Meio do mês: confere % consumido. Fim do mês: sobras → poupança ou rollover modesto; analisa estouros.",
      },
    ],
    whenToUse: [
      "Gastas sem perceber onde vai o dinheiro",
      "Precisas de limites concretos por área da vida",
    ],
    avoidWhen: [
      "Rendimento imprevisível sem base mínima calculada",
    ],
    quiz: [
      {
        id: "q1",
        question: "Estourar um envelope significa…",
        options: [
          { id: "a", text: "Falha total — abandonar o método" },
          { id: "b", text: "Decidir conscientemente: cortar ou realocar" },
          { id: "c", text: "Pedir crédito automaticamente" },
        ],
        correctId: "b",
        explanation: "Flexibilidade planeada faz parte do método.",
      },
    ],
    simulator: "envelope-budget",
  },
  {
    id: "variable-income",
    summary:
      "Orçamento para freelance e rendimentos irregulares: base na média conservadora, fundo «mês fraco» e regras para meses bons vs maus.",
    sections: [
      {
        title: "O que é",
        body: "Quem não recebe o mesmo valor todo mês não pode orçamentar pelo melhor mês. Calcula média dos últimos 3 meses, define piso de despesas e reserva para quedas.",
      },
      {
        title: "Regra meses bons",
        body: "Quando recebes acima da média, divide o extra: parte para poupança longo prazo, parte para fundo mês fraco — não aumentes lifestyle permanentemente.",
      },
    ],
    whenToUse: [
      "Freelance, comissões, trabalho sazonal",
      "Variação mensal de receita > 15%",
    ],
    avoidWhen: [
      "Salário fixo estável — 50/30/20 ou paga-te primeiro bastam",
    ],
    quiz: [
      {
        id: "q1",
        question: "A base de orçamento deve ser…",
        options: [
          { id: "a", text: "O melhor mês dos últimos 12" },
          { id: "b", text: "A média conservadora dos últimos meses" },
          { id: "c", text: "Zero — gastar o que entrar" },
        ],
        correctId: "b",
        explanation: "Média conservadora protege meses fracos.",
      },
    ],
    simulator: "variable-income",
  },
  {
    id: "debt-snowball",
    summary:
      "Paga mínimos em todas as dívidas e concentra extra na de menor saldo. Vitórias rápidas geram motivação para continuar.",
    sections: [
      {
        title: "O que é",
        body: "Estratégia de Dave Ramsey: ordena dívidas do menor para o maior saldo (ignora juros inicialmente). Liquida a primeira, depois «rola» a prestação libertada para a seguinte.",
      },
      {
        title: "Psicologia vs matemática",
        body: "Podes pagar mais juros totais que na avalanche — troca-se eficiência por momentum emocional. Ideal se precisas de ver progresso rápido.",
      },
    ],
    whenToUse: [
      "Várias dívidas pequenas/médias e motivação baixa",
      "Precisas de vitórias visíveis para manter ritmo",
    ],
    avoidWhen: [
      "Uma dívida enorme com juro altíssimo — avalanche pode poupar mais",
    ],
    quiz: [
      {
        id: "q1",
        question: "Na bola de neve, o extra vai para…",
        options: [
          { id: "a", text: "A dívida com maior juro" },
          { id: "b", text: "A dívida com menor saldo" },
          { id: "c", text: "Dividido igualmente" },
        ],
        correctId: "b",
        explanation: "Menor saldo primeiro — vitória rápida, depois roll over.",
      },
    ],
    simulator: "debt-snowball",
  },
  {
    id: "debt-avalanche",
    summary:
      "Paga mínimos em todas e concentra extra na dívida com maior taxa de juro. Minimiza custo total pago ao banco.",
    sections: [
      {
        title: "O que é",
        body: "Abordagem matemática pura: ordena dívidas da TAEG mais alta para a mais baixa. Cada euro extra na dívida cara poupa mais juros futuros.",
      },
      {
        title: "Quando preferir",
        body: "Se tens disciplina sem precisar de «win rápido» e uma dívida com juro muito superior às outras (ex.: cartão 24% vs empréstimo 6%).",
      },
    ],
    whenToUse: [
      "Dívidas com taxas de juro muito diferentes",
      "Queres minimizar total pago a longo prazo",
    ],
    avoidWhen: [
      "Precisas de motivação emocional — considerar bola de neve",
    ],
    quiz: [
      {
        id: "q1",
        question: "Avalanche prioriza…",
        options: [
          { id: "a", text: "Menor saldo" },
          { id: "b", text: "Maior taxa de juro" },
          { id: "c", text: "Dívida mais antiga" },
        ],
        correctId: "b",
        explanation: "Maior juro = maior custo por dia — ataca primeiro.",
      },
    ],
    simulator: "debt-avalanche",
  },
  {
    id: "no-spend-challenge",
    summary:
      "Desafio temporal (7–30 dias) para cortar gastos discricionários, registar impulsos e resetar hábitos de consumo.",
    sections: [
      {
        title: "O que é",
        body: "Período fixo com regras claras: zero gastos não essenciais. Excepções planeadas (mercado, transportes, saúde). Objectivo é consciência, não punição.",
      },
      {
        title: "Depois do desafio",
        body: "Reflexão: o que aprendeste? Que hábito manténs? Um desafio bem feito deixa 1–2 mudanças permanentes (ex.: menos take-away).",
      },
    ],
    whenToUse: [
      "Gastos discricionários subiram sem controlo",
      "Queres experimentar mudança curta antes de orçamento longo",
    ],
    avoidWhen: [
      "Mês já está financeiramente apertado — pode aumentar stress",
    ],
    quiz: [
      {
        id: "q1",
        question: "Excepções no desafio devem ser…",
        options: [
          { id: "a", text: "Decididas no impulso quando aparece promoção" },
          { id: "b", text: "Listadas antes de começar" },
          { id: "c", text: "Proibidas — zero gastos de qualquer tipo" },
        ],
        correctId: "b",
        explanation: "Excepções planeadas tornam o desafio sustentável.",
      },
    ],
  },
  {
    id: "weekly-money-review",
    summary:
      "Ritual de 15 minutos por semana: saldos, movimentos, três perguntas honestas e uma melhoria concreta para a semana seguinte.",
    sections: [
      {
        title: "O que é",
        body: "Hábito de manutenção — não reestruturação completa. Mesmo dia e hora cada semana. Consistência importa mais que perfeição dos números.",
      },
      {
        title: "Estrutura",
        body: "Checklist: saldos → movimentos da semana → método activo → três perguntas (entrou? saiu? segui plano?) → uma acção → registar revisão na app.",
      },
    ],
    whenToUse: [
      "Já tens contas e algum registo — queres manter clareza",
      "Complemento a qualquer outro método",
    ],
    avoidWhen: [
      "Ainda não tens contas criadas — começar por Primeiros 30 dias",
    ],
    quiz: [
      {
        id: "q1",
        question: "Quantas melhorias deves definir por revisão?",
        options: [
          { id: "a", text: "Uma concreta" },
          { id: "b", text: "Cinco para cobrir tudo" },
          { id: "c", text: "Nenhuma — só olhar números" },
        ],
        correctId: "a",
        explanation: "Uma acção pequena por semana acumula sem overwhelm.",
      },
    ],
  },
  {
    id: "savings-rate-20",
    summary:
      "Meta explícita: poupar 20% da receita líquida (ou subir +2 p.p. por mês até lá). Métrica única, fácil de acompanhar no painel.",
    sections: [
      {
        title: "O que é",
        body: "Taxa de poupança = (receita − despesas) ÷ receita. 20% é ambicioso mas referência comum em finanças pessoais. Podes subir degraus se estás longe.",
      },
      {
        title: "Alavancas",
        body: "Cortar top categorias de despesa, aumentar receita, automatizar transferência poupança. Revisão mensal compara real vs meta.",
      },
    ],
    whenToUse: [
      "Bases estáveis e queres uma métrica clara de progresso",
      "Já poupas algo e queres escalar",
    ],
    avoidWhen: [
      "Dívida cara não controlada — priorizar pagamento extra primeiro",
    ],
    quiz: [
      {
        id: "q1",
        question: "Taxa de poupança de 20% significa…",
        options: [
          { id: "a", text: "Guardar 20% do património total" },
          { id: "b", text: "Poupar 20% da receita líquida do mês" },
          { id: "c", text: "Investir 20% em acções" },
        ],
        correctId: "b",
        explanation: "É percentagem da receita mensal líquida, não património.",
      },
    ],
    simulator: "savings-rate",
  },
  {
    id: "intro-investing",
    summary:
      "Introdução ao investimento depois do colchão: horizonte longo, veículos simples, aportes pequenos regulares e revisão trimestral sem pânico.",
    sections: [
      {
        title: "Pré-requisito",
        body: "Pelo menos 3 meses de despesas em fundo de emergência. Investir sem colchão obriga a vender em queda — o pior timing.",
      },
      {
        title: "Princípios",
        body: "Horizonte 5+ anos, diversificação, custos baixos, aportes regulares pequenos. Volatilidade diária é normal — olha tendência trimestral.",
      },
    ],
    whenToUse: [
      "Colchão ok e queres começar a fazer dinheiro trabalhar",
      "Metas a 5+ anos (reforma, independência)",
    ],
    avoidWhen: [
      "Sem emergência ou com dívida cara — priorizar protecção primeiro",
    ],
    quiz: [
      {
        id: "q1",
        question: "Antes de investir agressivamente deves ter…",
        options: [
          { id: "a", text: "Fundo de emergência sólido" },
          { id: "b", text: "Zero poupança para maximizar retorno" },
          { id: "c", text: "Apenas cripto" },
        ],
        correctId: "a",
        explanation: "Colchão primeiro — investimento é para horizonte longo.",
      },
    ],
    simulator: "emergency-fund",
  },
];

export function getMethodEducation(methodId: string): MethodEducationContent | undefined {
  return FINANCE_METHOD_EDUCATION.find((m) => m.id === methodId);
}
