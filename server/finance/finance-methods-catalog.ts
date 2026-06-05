export type FinanceMethodLevel = "beginner" | "intermediate" | "advanced";
export type FinanceMethodDuration = "days" | "weeks" | "continuous";

export type FinanceMethodStep = {
  title: string;
  description: string;
  lesson?: string;
};

export type FinanceMethodDefinition = {
  id: string;
  name: string;
  tagline: string;
  level: FinanceMethodLevel;
  duration: FinanceMethodDuration;
  durationLabel: string;
  steps: FinanceMethodStep[];
};

export const F1_METHOD_IDS = [
  "first-30-days",
  "rule-50-30-20",
  "pay-yourself-first",
  "emergency-fund",
  "envelope-budget",
  "variable-income",
  "debt-snowball",
  "debt-avalanche",
  "no-spend-challenge",
  "weekly-money-review",
  "savings-rate-20",
  "intro-investing",
] as const;

export const FINANCE_METHODS: FinanceMethodDefinition[] = [
  {
    id: "first-30-days",
    name: "Primeiros 30 dias",
    tagline: "Mapa do teu dinheiro e hábitos base",
    level: "beginner",
    duration: "days",
    durationLabel: "30 dias",
    steps: [
      {
        title: "Criar conta à ordem",
        description:
          "Abre Contas → Nova conta e escolhe «Conta à ordem». Dá um nome claro (ex.: «Salário Millennium») e regista o saldo actual exactamente como vês no homebanking. Esta conta representa onde recebes rendimento e pagas despesas correntes.",
        lesson: "Património líquido = o que tens − o que deves. Começa pelo que é real hoje.",
      },
      {
        title: "Criar conta poupança",
        description:
          "Cria uma segunda conta do tipo «Poupança», separada da à ordem — pode ser subconta no banco, mas aqui fica distinta. Indica o saldo actual (mesmo que seja 0€). O objectivo é reservar dinheiro que não entra no fluxo diário de gastos.",
        lesson: "Separar contas reduz gastos por acidente: o que não vês, não gastas tão fácil.",
      },
      {
        title: "Registar saldo inicial",
        description:
          "Revê cada conta criada e confirma que o saldo inicial corresponde ao banco real. Se algo estiver desactualizado, edita a conta ou regista um movimento de ajuste. Só avança quando os totais baterem certo com a tua realidade.",
        lesson: "Números reais valem mais que estimativas optimistas — a app serve para clareza, não para ilusão.",
      },
      {
        title: "Registar receita mensal",
        description:
          "Em Movimentos → Nova receita, regista o valor líquido que entra por mês (salário, pensão, rendimentos principais). Usa a data de recebimento habitual e a conta à ordem correcta. Se recebes duas vezes no mês, regista ambos ou a soma mensal estimada.",
        lesson: "Todo o orçamento parte do que entra — sem receita registada, qualquer plano é chute.",
      },
      {
        title: "Listar despesas fixas",
        description:
          "Regista despesas que se repetem todo o mês: renda, crédito habitação, telecomunicações, seguros, subscrições. Categoriza cada uma (ex.: Habitação, Utilities). Estas despesas são prioritárias — saber o total fixo mostra quanto sobra para o resto.",
        lesson: "Fixas primeiro: são compromissos que não desaparecem porque «este mês apertou».",
      },
      {
        title: "Registar 7 dias de despesas",
        description:
          "Durante uma semana, regista cada despesa real em Movimentos — compras, refeições, transportes, pequenos extras. Escolhe a categoria correcta mesmo que não tenhas a certeza absoluta; podes refinar depois. O objectivo é capturar hábitos, não perfeição.",
        lesson: "Categorias revelam padrões de comportamento, não servem para te culpares.",
      },
      {
        title: "Revisão semana 1",
        description:
          "Vai a Finanças → Revisão e completa o assistente semanal. Responde com honestidade: quanto entrou, quanto saiu, onde gastaste mais. Reserva 15 minutos sem distracções — esta revisão fecha a primeira semana de dados.",
        lesson: "Consistência importa mais que ter tudo certo à primeira.",
      },
      {
        title: "Primeira transferência poupança",
        description:
          "Regista um movimento de transferência da conta à ordem para a poupança — começa simbólico (10€, 25€ ou 5% do que recebeste). A data deve ser real ou planeada para logo após receberes rendimento. Ver este movimento na app reforça o hábito de «pagar-te a ti primeiro».",
        lesson: "Poupar é uma acção concreta, não uma intenção vaga para o fim do mês.",
      },
      {
        title: "Calcular taxa de poupança",
        description:
          "No painel inicial, vê receita vs despesa do mês e a taxa de poupança (%). Compara: (receita − despesas) ÷ receita. Anota mentalmente o valor — 5% já é progresso; 10% é excelente para quem começa.",
        lesson: "A taxa de poupança é o termómetro mais simples da saúde financeira mensal.",
      },
      {
        title: "Definir meta emergência (1 mês)",
        description:
          "Soma despesas fixas + uma estimativa de variáveis (comida, transportes) para obter o custo de um mês. Esse total é a tua primeira meta de fundo de emergência. Escreve-o numa nota ou comentário na conta poupança para não esquecer.",
        lesson: "Emergência cobre perda de rendimento ou imprevisto — férias e saldos não contam.",
      },
      {
        title: "Aplicar 50/30/20",
        description:
          "Com a receita mensal registada, calcula três tectos: 50% necessidades (renda, comida base, transportes), 30% desejos (lazer, compras extra) e 20% futuro (poupança ou dívida extra). Compara com o que realmente gastaste — não precisas de acertar já, só de ver o desvio.",
        lesson: "50/30/20 é um mapa simples: necessidades, prazeres e futuro com limites claros.",
      },
      {
        title: "Registar 14 dias de despesas",
        description:
          "Continua a registar despesas durante mais uma semana, totalizando pelo menos 14 dias de histórico. Mantém categorias consistentes — «Alimentação» hoje deve ser «Alimentação» amanhã. Quanto mais dados, melhor consegues ver onde cortar ou manter.",
        lesson: "Duas semanas de registo já mostram padrões que um dia isolado esconde.",
      },
      {
        title: "Revisão semana 2",
        description:
          "Completa a segunda revisão semanal. Pergunta-te: mantive o registo? A transferência para poupança aconteceu? O que surpreendeu nos gastos? Regista uma acção concreta para a semana 3 (ex.: «cancelar subscrição X»).",
        lesson: "Um mês ou semana «mau» é informação útil — mostra onde o plano falhou na prática.",
      },
      {
        title: "Automatizar transferência",
        description:
          "No homebanking, agenda transferência automática corrente → poupança no dia seguinte ao salário (ou regista-a na app como movimento recorrente mental). Define valor fixo alinhado com a meta de emergência. Automatizar remove a decisão diária de poupar.",
        lesson: "Automatismo vence motivação: o sistema trabalha mesmo quando estás cansado.",
      },
      {
        title: "Conferir saldos",
        description:
          "Abre o homebanking e compara saldo real vs saldo na app, conta a conta. Pequenas diferenças são normais (movimentos pendentes, juros). Se o desvio for grande, regista ajuste ou movimentos em falta até reconciliar.",
        lesson: "Reconciliar semanalmente evita surpresas no fim do mês.",
      },
      {
        title: "Revisão semana 3",
        description:
          "Terceira revisão semanal: olha para top categorias de despesa no painel. Identifica a categoria que mais cresceu e decide se foi pontual ou hábito. Actualiza metas se a receita ou despesas fixas mudaram.",
        lesson: "Ritual fixo cria clareza — sabes onde estás sem reabrir todas as contas.",
      },
      {
        title: "Ajustar categorias",
        description:
          "Revê movimentos mal categorizados e corrige-os. Se uma categoria está sempre a estourar (ex.: Restauração), considera criar sub-hábito ou reduzir tecto. O orçamento deve reflectir a tua vida real, não um ideal imaginário.",
        lesson: "Orçamento vivo adapta-se a ti — estático demais é abandonado.",
      },
      {
        title: "Revisão semana 4",
        description:
          "Quarta revisão semanal — fecha o ciclo de 30 dias. Avalia: taxa de poupança subiu? Registo é hábito? Fundo de emergência avançou? Escolhe o que manténs nos próximos meses antes de passar ao passo final.",
        lesson: "Quatro semanas seguidas formam hábito — é o objectivo deste trilho.",
      },
      {
        title: "Reler glossário",
        description:
          "Visita Finanças → Aprender e relê termos como património líquido, taxa de poupança, fundo de emergência e fluxo de caixa. Se algo ainda confunde, anota a dúvida para a próxima revisão. Vocabulário claro reduz ansiedade nas decisões.",
        lesson: "Entender as palavras financeiras dá confiança para agir.",
      },
      {
        title: "Escolher método contínuo",
        description:
          "Com base no que aprendeste, escolhe um método contínuo: Regra 50/30/20 (se queres tectos simples), Fundo de emergência (se ainda falta colchão) ou Revisão semanal (se o ritual já te funciona). Inicia-o em Métodos e mantém só um activo de cada vez.",
        lesson: "Educar-se financeiramente é escolher um sistema e mantê-lo — não saltar de moda em moda.",
      },
    ],
  },
  {
    id: "rule-50-30-20",
    name: "Regra 50/30/20",
    tagline: "Necessidades · desejos · futuro",
    level: "beginner",
    duration: "continuous",
    durationLabel: "Contínuo",
    steps: [
      {
        title: "Calcular receita líquida",
        description:
          "Regista ou soma toda a receita líquida do mês (salário, freelance, pensões) em Movimentos. Usa o valor real que entra na conta, depois de impostos e descontos. Este número é a base de todos os percentuais — sem ele, 50/30/20 não funciona.",
        lesson: "50/30/20 parte sempre do líquido, nunca do bruto.",
      },
      {
        title: "Marcar 50% necessidades",
        description:
          "Calcula 50% da receita líquida. Atribui a esta fatia: renda/hipoteca, utilities, alimentação base, transportes obrigatórios, seguros, prestações mínimas de crédito. Soma o que já gastaste este mês nessas áreas e compara com o tecto — se passaste, identifica qual necessidade cresceu.",
        lesson: "Necessidades são sobrevivência e compromissos — não confundir com conforto extra.",
      },
      {
        title: "Marcar 30% desejos",
        description:
          "Calcula 30% da receita para desejos: restaurantes, entretenimento, compras não essenciais, hobbies, subscrições opcionais. Revisa movimentos recentes e marca quais são «desejo» vs «necessidade». Este tecto dá permissão consciente para gastar sem culpa — até ao limite.",
        lesson: "Desejos são legítimos — o problema é não ter tecto, não tê-los.",
      },
      {
        title: "Marcar 20% futuro",
        description:
          "Os restantes 20% destinam-se ao futuro: transferências para poupança, pagamentos extra a dívidas, investimentos ou fundo de emergência. Regista um plano concreto (ex.: «100€ poupança + 50€ crédito auto»). Se ainda não poupas 20%, define um alvo intermédio (+2% por mês).",
        lesson: "Futuro paga-se hoje — adiar poupança é pedir emprestado ao eu de amanhã.",
      },
      {
        title: "Revisão mensal 50/30/20",
        description:
          "No fim do mês, compara real vs plano nos três blocos. No painel ou em Movimentos, vê onde estouraste e onde sobrou. Ajusta percentuais do mês seguinte se a vida mudou (ex.: subida de renda) — o método é flexível, não rígido.",
        lesson: "Ajustar faz parte do método — o erro é ignorar os desvios mês após mês.",
      },
    ],
  },
  {
    id: "emergency-fund",
    name: "Fundo de emergência",
    tagline: "Colchão antes de investir",
    level: "beginner",
    duration: "weeks",
    durationLabel: "3–12 meses",
    steps: [
      {
        title: "Calcular despesas mensais",
        description:
          "Soma despesas fixas (renda, créditos, seguros, subscrições) com variáveis médias (alimentação, transportes, saúde). Usa movimentos dos últimos 30 dias ou uma estimativa honesta. O total é «quanto preciso por mês para viver» — base de todas as metas de emergência.",
        lesson: "Emergência cobre despesas reais, não um estilo de vida inflado.",
      },
      {
        title: "Meta: 1 mês",
        description:
          "Define como primeira meta o equivalente a 1 mês de despesas na conta poupança. Verifica o saldo actual — quanto falta? Divide o valor em parcelas mensais realistas (ex.: 200€/mês durante 5 meses). Regista a meta mentalmente ou numa nota na conta.",
        lesson: "Um mês de colchão já protege imprevistos pequenos (reparação, franquia, atraso de salário).",
      },
      {
        title: "Meta: 3 meses",
        description:
          "Quando atingires 1 mês, fixa o alvo seguinte: 3 meses de despesas na poupança dedicada. Mantém esta conta separada do corrente. Calcula data estimada de conclusão com base na transferência mensual que consegues sustentar.",
        lesson: "Três meses cobre uma perda de rendimento curta — standard mínimo antes de investir agressivamente.",
      },
      {
        title: "Transferência automática",
        description:
          "Agenda no banco (ou regista na app) uma transferência fixa mensal corrente → poupança, no dia após receberes rendimento. Trata este valor como despesa fixa inegociável — «aluguer do teu eu futuro». Começa pequeno se precisares e aumenta quando possível.",
        lesson: "Automatizar remove a tentação de gastar o que «sobra» — que raramente sobra.",
      },
      {
        title: "Não tocar excepto emergência",
        description:
          "Escreve uma lista do que conta como emergência (desemprego, hospital, reparação essencial) e do que não conta (férias, promoções, saldo). Compromete-te a não debitar da poupança excepto nesses casos. Se usares, regista o movimento e plano de reposição.",
        lesson: "Sem regras claras, «emergência» vira desculpa para qualquer desejo.",
      },
      {
        title: "Celebrar marcos",
        description:
          "Quando atingires 1 mês, 2 meses, 3 meses de despesas guardadas, regista um movimento simbólico ou nota de celebração. Reconhece o progresso — meses de poupança consistente merecem visibilidade. Revê no painel quanto falta para o próximo marco.",
        lesson: "Progresso visível sustenta meses em que poupar parece lento.",
      },
    ],
  },
  {
    id: "pay-yourself-first",
    name: "Paga-te a ti primeiro",
    tagline: "Poupar antes de gastar o resto",
    level: "beginner",
    duration: "continuous",
    durationLabel: "Contínuo",
    steps: [
      {
        title: "Definir valor ou % de poupança",
        description:
          "Decide quanto poupas por mês antes de ver despesas: valor fixo (ex.: 150€) ou percentagem (ex.: 10% da receita líquida). Calcula com base na receita real registada. Escreve o número — é o teu «salário para o futuro», pago antes de qualquer outra coisa.",
        lesson: "Decidir antes de gastar evita a armadilha de «sobra no fim do mês» — que quase nunca sobra.",
      },
      {
        title: "Agendar transferência no dia do salário",
        description:
          "No homebanking, agenda transferência automática da conta à ordem para poupança no dia do salário (ou +1 dia útil). Se não puderes automatizar, regista lembrete semanal. O timing importa: poupar logo após receber reduz a fricção mental.",
        lesson: "Quem espera pelo fim do mês para poupar raramente poupa — o dinheiro «desaparece» no meio.",
      },
      {
        title: "Tratar poupança como despesa fixa",
        description:
          "Inclui a transferência de poupança no teu mapa mental de «contas a pagar» — ao lado da renda e utilities. Quando planear o mês, subtrai poupança primeiro, depois vês o que resta para gastar. Na app, a transferência deve aparecer como movimento regular.",
        lesson: "Tu és a primeira «conta» a pagar — tratar poupança como opcional é sabotagem silenciosa.",
      },
      {
        title: "Registar primeira poupança",
        description:
          "Em Movimentos → Transferência, regista o valor da conta à ordem para poupança com a data real. Confirma que o saldo da poupança subiu. Este registo torna o hábito visível no histórico e no cálculo da taxa de poupança.",
        lesson: "Ver o movimento na app reforça identidade: «sou alguém que poupa».",
      },
      {
        title: "Ajustar se o mês apertar",
        description:
          "Se um mês for atípico (despesa extra, menos receita), reduz a poupança temporariamente — mas não a zeros. Mantém um mínimo simbólico (5€ ou 1%) para preservar o hábito. No mês seguinte, repõe o valor normal antes de aumentar desejos.",
        lesson: "Consistência mínima vale mais que parar completamente e recomeçar do zero.",
      },
      {
        title: "Revisão mensal",
        description:
          "No fim do mês, responde: transferiste no dia certo ou só o que sobrou? Compara taxa de poupança com o alvo. Se falhaste, identifica o motivo (timing, valor demasiado alto, falta de automatismo) e corrige um factor só no mês seguinte.",
        lesson: "A pergunta «poupei primeiro ou sobrou?» muda comportamento mais que qualquer planilha.",
      },
    ],
  },
  {
    id: "envelope-budget",
    name: "Orçamento por envelopes",
    tagline: "Tecto por categoria — bolso mental",
    level: "intermediate",
    duration: "continuous",
    durationLabel: "Mensal",
    steps: [
      {
        title: "Listar categorias de despesa",
        description:
          "Revê movimentos dos últimos 30 dias e identifica 5–8 categorias onde mais gastas: Alimentação, Transportes, Lazer, Restauração, etc. Usa categorias da app ou cria as que faltam. Cada categoria será um «envelope» com tecto próprio.",
        lesson: "Cada envelope é uma decisão consciente — gastar num é escolher não gastar noutro.",
      },
      {
        title: "Definir tecto mensal por categoria",
        description:
          "Para cada categoria, define quanto podes gastar este mês com base no histórico (média dos últimos 2–3 meses) ou no que queres gastar, o que for menor. Soma todos os tectos — deve caber dentro da receita menos poupança e fixas. Ajusta até fechar.",
        lesson: "Tecto claro evita «surpresa» no dia 28 — sabes quando estás a aproximar-te do limite.",
      },
      {
        title: "Registar despesas por envelope",
        description:
          "Cada nova despesa deve ter categoria correcta antes de concluir o registo. Ao longo do mês, consulta totais por categoria (painel ou filtros em Movimentos). Trata cada registo como «retirar» do envelope virtual — quando o tecto aproxima, desacelera.",
        lesson: "O que medes, geres — registo inconsistente quebra o método.",
      },
      {
        title: "Conferir saldo a meio do mês",
        description:
          "No dia 15 (ou metade do mês), revê cada envelope: quanto gastaste vs tecto. Identifica categorias a >70% do limite e decide se cortas ou realocas. Fazer isto a meio do mês dá tempo de corrigir — no fim do mês já é tarde.",
        lesson: "Ajustar cedo é escolher; remediar no fim é remediar.",
      },
      {
        title: "Decidir o que fazer se estourar",
        description:
          "Antes de estourar, define a regra: podes transferir de outro envelope (ex.: Lazer → Alimentação)? Ou cortas gastos até ao fim do mês? Escreve a regra — na crise do impulso, a decisão já está tomada. Evita «inventar» desculpas no momento.",
        lesson: "Flexibilidade planeada não é descontrolo — é saber de onde vem o extra.",
      },
      {
        title: "Ritual fim de mês",
        description:
          "No último dia do mês, fecha cada envelope: sobras podem ir para poupança ou rollover modesto para o mês seguinte. Envelopes estourados — analisa porquê (tecto irreal? impulso?) e ajusta tectos do mês novo. Regista aprendizagens numa revisão.",
        lesson: "Envelopes são ferramentas vivas — ajustar tectos é normal, não falhar.",
      },
    ],
  },
  {
    id: "variable-income",
    name: "Renda variável",
    tagline: "Freelance e receitas irregulares",
    level: "intermediate",
    duration: "continuous",
    durationLabel: "Contínuo",
    steps: [
      {
        title: "Calcular média dos últimos 3 meses",
        description:
          "Filtra receitas dos últimos 3 meses em Movimentos e calcula a média mensal líquida. Ignora o melhor mês se foi excepção (bónus, projecto único). Usa a média conservadora como base de orçamento — não o pico de rendimento.",
        lesson: "Orçamentar pelo melhor mês deixa-te descoberto nos meses normais.",
      },
      {
        title: "Definir base mensal mínima",
        description:
          "Soma todas as despesas fixas + margem pequena (10–15%) para imprevistos. Este total é o «piso» — o mínimo que precisas cobrir todo mês. A tua média de receita deve ser claramente superior a este piso; se não for, o fundo «mês fraco» é urgente.",
        lesson: "Vive abaixo da média, não no pico — meses bons não são o teu «normal».",
      },
      {
        title: "Criar fundo «mês fraco»",
        description:
          "Abre ou designa uma conta poupança só para cobrir meses abaixo da base (ex.: meta = 2–3× a diferença entre média e pior mês). Regista saldo inicial. Este fundo não é emergência geral — é colchão específico para irregularidade de rendimento.",
        lesson: "Freelancers precisam de dois colchões: emergência de vida + fundo de rendimento irregular.",
      },
      {
        title: "Regra para meses bons",
        description:
          "Define por escrito o que fazer quando recebes acima da média: ex. 50% do extra → poupança longo prazo, 50% → fundo mês fraco. Aplica na próxima receita acima do normal. Regista transferências para ver a regra em acção.",
        lesson: "Meses bons financiam meses maus — se gastares tudo no bom, o mau dói em dobro.",
      },
      {
        title: "Plano para mês abaixo da base",
        description:
          "Escreve ordem de cortes se um mês ficar abaixo do piso: 1) desejos, 2) variáveis flexíveis, 3) uso do fundo mês fraco. Decide agora, em calma — na crise não há energia para planear. Guarda o plano numa nota acessível.",
        lesson: "Decidir em calma e executar em crise — não o contrário.",
      },
      {
        title: "Revisão trimestral",
        description:
          "A cada 3 meses, recalcula média de receita, piso de despesas e saldo do fundo mês fraco. Ajusta transferências automáticas se a receita subiu ou desceu de forma sustentada. Renda variável exige calibragem — não «set and forget».",
        lesson: "Trimestral é o ritmo mínimo para rendimento irregular — anual é tarde demais.",
      },
    ],
  },
  {
    id: "debt-snowball",
    name: "Bola de neve (dívidas)",
    tagline: "Menor saldo primeiro — vitórias rápidas",
    level: "intermediate",
    duration: "weeks",
    durationLabel: "Até liquidar",
    steps: [
      {
        title: "Listar todas as dívidas",
        description:
          "Em Contas, regista cada dívida: cartão de crédito, crédito pessoal, carro, etc. (tipo passivo ou cartão). Indica saldo actual e, se souberes, prestação mínima mensal na nota. Não escondas dívidas pequenas — o mapa tem de ser completo.",
        lesson: "Estratégia só funciona com mapa honesto — omitir uma dívida sabota o plano.",
      },
      {
        title: "Ordenar da menor para a maior",
        description:
          "Ordena dívidas por saldo em dívida, da mais pequena para a maior. Ignora taxas de juro nesta fase — o foco é momentum emocional. A primeira da lista é o teu alvo #1 até estar a zero. Anota a ordem numa lista visível.",
        lesson: "Bola de neve troca eficiência matemática por vitórias rápidas que mantêm motivação.",
      },
      {
        title: "Pagar mínimos em todas",
        description:
          "Garante que pagas pelo menos a prestação mínima de cada dívida todos os meses — regista esses pagamentos como despesas. Nunca falhes mínimos: penalizações e juros atrasados destroem o plano. Só o «extra» vai para a dívida alvo.",
        lesson: "Pontualidade é base inegociável — estratégia não substitui pagar a tempo.",
      },
      {
        title: "Extra na dívida mais pequena",
        description:
          "Todo o dinheiro disponível para dívidas (além dos mínimos) vai para a primeira da lista — a de menor saldo. Regista pagamentos extra como despesas na conta correcta. Repete até essa dívida chegar a zero antes de mudar de alvo.",
        lesson: "Concentração de fogo — dispersar extra por várias dívidas atrasa todas as vitórias.",
      },
      {
        title: "Celebrar cada dívida paga",
        description:
          "Quando liquidares uma dívida, regista o marco (nota ou movimento simbólico) e reconhece o progresso. Actualiza saldo da conta para zero ou arquiva a conta. Celebra de forma proporcional — vitórias visíveis alimentam meses difíceis.",
        lesson: "Progresso visível sustenta disciplina quando o fim ainda parece longe.",
      },
      {
        title: "Roll over para a seguinte",
        description:
          "A prestação que pagavas à dívida liquidada + todo o extra passam agora para a segunda da lista. A «bola» cresce — cada dívida paga liberta cash flow para a seguinte. Mantém a ordem até a última dívida estar a zero.",
        lesson: "Daí «bola de neve»: quanto mais eliminas, mais rápido rola.",
      },
    ],
  },
  {
    id: "debt-avalanche",
    name: "Avalanche (dívidas)",
    tagline: "Maior juro primeiro — menos custo total",
    level: "intermediate",
    duration: "weeks",
    durationLabel: "Até liquidar",
    steps: [
      {
        title: "Listar dívidas com taxa de juro",
        description:
          "Para cada dívida registada, anota a TAEG ou taxa anual na descrição/nota da conta. Se não souberes, consulta extracto ou app do banco. Lista saldo, prestação mínima e taxa — precisas dos três para ordenar correctamente.",
        lesson: "Juro alto custa mais a cada dia — cada euro parado na dívida cara é juro futuro.",
      },
      {
        title: "Ordenar do maior para o menor juro",
        description:
          "Ordena dívidas pela taxa de juro, da mais cara para a mais barata. Em empate de taxa, escolhe menor saldo. A primeira da lista recebe todo o extra — prioridade matemática pura para minimizar total pago ao banco.",
        lesson: "Avalanche optimiza dinheiro total poupado — ideal se tens disciplina sem vitórias rápidas.",
      },
      {
        title: "Pagar mínimos em todas",
        description:
          "Como na bola de neve: mínimos em todas, sempre a tempo. Regista cada prestação. O extra disponível vai exclusivamente para a dívida com maior juro — nunca distribuas por «sentido justo».",
        lesson: "Estratégia falha se falhas pagamentos — juros de atraso anulam a vantagem.",
      },
      {
        title: "Extra na dívida mais cara",
        description:
          "Canaliza todo o disponível para a dívida #1 (maior juro). Regista pagamentos extra e actualiza saldo. Mesmo 20€ extra por mês num cartão a 20% TAEG poupa dezenas ou centenas a longo prazo.",
        lesson: "Cada euro extra na dívida cara é um euro que não pagas de juro amanhã.",
      },
      {
        title: "Estimar juros poupados",
        description:
          "Usa calculadora online ou estimativa simples: compara pagar só mínimos vs avalanche durante 12 meses. Anota quanto juro evitas — números concretos motivam quando o saldo desce lentamente. Revê estimativa a cada dívida paga.",
        lesson: "Quando o progresso visual é lento, os números de juro poupado mantêm foco.",
      },
      {
        title: "Manter até zero",
        description:
          "Repete o ciclo: mínimos em todas, extra na mais cara, celebrar marco, passar à seguinte. Não mudes para bola de neve a meio por impulso — escolheste avalanche pela eficiência. Mantém até a última dívida estar liquidada.",
        lesson: "Disciplina > impulso de trocar método quando a primeira vitória demora.",
      },
    ],
  },
  {
    id: "no-spend-challenge",
    name: "Desafio zero gastos",
    tagline: "Reset de hábitos de consumo",
    level: "beginner",
    duration: "days",
    durationLabel: "7–30 dias",
    steps: [
      {
        title: "Escolher duração",
        description:
          "Decide duração realista: 7 dias (introdução) ou 30 dias (desafio completo). Marca datas de início e fim no calendário. Comunica a casa/família se partilham despesas — alinhamento evita fricção. Primeira vez? Começa com 7.",
        lesson: "Desafio curto forma hábito; longo testa limites — escolhe conforme experiência.",
      },
      {
        title: "Definir regras claras",
        description:
          "Escreve o que é «gasto proibido»: compras não essenciais, take-away, online shopping, entretenimento pago. O que é permitido continua explícito no passo seguinte. Regras vagas («gastar menos») falham — precisas de sim/não claro.",
        lesson: "Ambiguidade mata desafios — «só isto uma vez» vira excepção permanente.",
      },
      {
        title: "Listar excepções",
        description:
          "Define excepções permitidas: supermercado básico, transportes para trabalho, medicamentos, contas fixas. Lista fechada — tudo o resto espera até ao fim do desafio. Cola a lista onde a vês antes de comprar.",
        lesson: "Excepções planeadas ≠ falha — são o que torna o desafio sustentável.",
      },
      {
        title: "Registar impulsos",
        description:
          "Quando quiseres comprar algo proibido, regista em Movimentos (nota) ou num caderno: o quê, quanto, porquê. Não compres — só regista. No fim, analisa padrões: horário, emoção, gatilho. Consciência sem culpa.",
        lesson: "Impulsos registados perdem metade da força — vês o padrão em vez de ceder.",
      },
      {
        title: "Evitar tentação",
        description:
          "Remove gatilhos: unsubscribe promoções, apaga apps de compras do telemóvel, faz lista de supermercado fixa antes de entrar. Evita «passar só a ver» lojas ou sites. Ambiente preparado vale mais que força de vontade no momento.",
        lesson: "Redesenhar ambiente > heroísmo diário de resistir.",
      },
      {
        title: "Reflexão final",
        description:
          "No último dia, responde por escrito: O que aprendi sobre os meus hábitos? Quanto poupei? O que quero manter (ex.: menos take-away, registo de impulsos)? Um desafio bem feito termina em 1–2 hábitos permanentes, não só em «sobrevivi».",
        lesson: "Objectivo é insight e mudança duradoura — sofrimento gratuito não é meta.",
      },
    ],
  },
  {
    id: "weekly-money-review",
    name: "Revisão semanal",
    tagline: "15 minutos — consistência > perfeição",
    level: "beginner",
    duration: "continuous",
    durationLabel: "Semanal",
    steps: [
      {
        title: "Escolher dia e hora fixos",
        description:
          "Escolhe um slot fixo semanal (ex.: domingo 10h, quarta 20h) e bloqueia no calendário como evento recorrente. 15 minutos bastam. Trata como compromisso consigo — cancelar duas vezes seguidas quebra o hábito antes de começar.",
        lesson: "«Quando der» raramente dá — horário fixo remove negociação consigo mesmo.",
      },
      {
        title: "Checklist de abertura",
        description:
          "Ao iniciar, percorre: saldos de todas as contas, movimentos dos últimos 7 dias, progresso do método activo (se houver). Abre Finanças → Início e Contas — 2 minutos de scan antes de analisar. Checklist evita esquecer contas ou movimentos.",
        lesson: "Estrutura de abertura reduz procrastinação — sabes exactamente por onde começar.",
      },
      {
        title: "Três perguntas",
        description:
          "Responde por escrito: (1) Quanto entrou esta semana/mês? (2) Quanto saiu e em quê? (3) Segui o plano (poupança, tectos, método)? Honestidade > optimismo. Usa números da app, não memória.",
        lesson: "Três perguntas simples bastam — complexidade extra atrasa a revisão.",
      },
      {
        title: "Uma melhoria",
        description:
          "Escolhe uma acção concreta para a semana seguinte — só uma. Ex.: «Registar despesas diariamente», «Cancelar subscrição X», «Transferir 50€ na segunda». Específica, pequena, mensurável. Mais de uma melhoria dilui foco.",
        lesson: "Pequeno ajuste consistente supera plano revolucionário abandonado na semana 2.",
      },
      {
        title: "Registar revisão na app",
        description:
          "Vai a Finanças → Revisão e completa o assistente semanal. Regista notas, avaliação do método e mood se aplicável. O histórico mostra evolução e streaks — ver 4 revisões seguidas motiva continuar.",
        lesson: "Histórico transforma esforço isolado em narrativa de progresso.",
      },
    ],
  },
  {
    id: "savings-rate-20",
    name: "Taxa de poupança 20%",
    tagline: "Meta ambiciosa e mensurável",
    level: "intermediate",
    duration: "continuous",
    durationLabel: "Contínuo",
    steps: [
      {
        title: "Calcular taxa actual",
        description:
          "No painel inicial, vê receita e despesa do mês e a taxa de poupança (%). Fórmula: (receita − despesas) ÷ receita × 100. Regista o valor actual como baseline — sem julgamento. Se for negativo, o primeiro passo é parar a hemorragia.",
        lesson: "Baseline honesto é ponto de partida — esconder números atrasa progresso.",
      },
      {
        title: "Definir meta incremental",
        description:
          "Se estás longe de 20%, define degraus: +2 pontos percentuais por mês até lá, ou meta intermédia (10% → 15% → 20%). Escreve datas alvo. 20% é ambicioso — subir degraus evita desistência por meta inatingível já.",
        lesson: "Degraus vencem salto impossível — 20% é maratona, não sprint.",
      },
      {
        title: "Identificar alavancas",
        description:
          "Lista 3 alavancas: cortes possíveis (top categorias de despesa) e aumentos de receita (horas extra, venda, negociação). Prioriza a mais fácil de executar este mês. Uma alavanca activa vale mais que lista de dez ideias.",
        lesson: "Receita e despesa contam — focar só em cortar ignora metade da equação.",
      },
      {
        title: "Automatizar incremento",
        description:
          "Aumenta transferência automática para poupança em passos (ex.: +25€/mês até atingir taxa alvo). Agenda no banco ou regista plano na app. Incremento automático evita «esquecer» quando o mês corre bem.",
        lesson: "Subir poupança automaticamente impede lifestyle inflation comer o ganho.",
      },
      {
        title: "Revisão mensal da taxa",
        description:
          "No fim de cada mês, compara taxa real vs meta no painel. Se abaixo, identifica uma causa (despesa atípica? receita em falta?) e uma correcção. Se acima, considera subir meta ou reforçar emergência antes de desejos.",
        lesson: "Uma métrica, foco claro — menos dispersão que dez objectivos vagos.",
      },
    ],
  },
  {
    id: "intro-investing",
    name: "Introdução ao investimento",
    tagline: "Depois do colchão — crescimento a longo prazo",
    level: "advanced",
    duration: "weeks",
    durationLabel: "4 semanas",
    steps: [
      {
        title: "Confirmar fundo de emergência",
        description:
          "Verifica saldo da poupança vs despesas mensais — precisas de pelo menos 3 meses de despesas guardados antes de investir. Se faltar, prioriza Fundo de emergência. Investir sem colchão obriga a vender em queda — o pior timing possível.",
        lesson: "Emergência primeiro — investimento é para dinheiro que não precisas em 5+ anos.",
      },
      {
        title: "Entender inflação vs poupança",
        description:
          "Lê em Aprender ou externamente: inflação reduz poder de compra da poupança parada; investimento busca crescimento real a longo prazo (com risco). Não precisas ser expert — só perceber por que dinheiro parado perde e investir tem volatilidade.",
        lesson: "Poupança protege; investimento pode crescer — funções diferentes, ambas necessárias.",
      },
      {
        title: "Definir horizonte temporal",
        description:
          "Escreve para que meta investes (reforma, casa daqui a 10 anos) e confirma horizonte mínimo de 5 anos. Dinheiro necessário antes disso não deve estar em activos voláteis. Horizonte claro define quanto risco faz sentido.",
        lesson: "Curto prazo + volatilidade = receita para vender em pânico no pior momento.",
      },
      {
        title: "Escolher veículo introdutório",
        description:
          "Pesquisa uma opção simples local: ETF indexado amplo, PPR de baixo custo, ou equivalente. Critérios: diversificação, taxas baixas, regulamentação clara. Evita produtos complexos ou promessas de retorno garantido na fase intro.",
        lesson: "Diversificação + custos baixos — base antes de optimizar retorno.",
      },
      {
        title: "Valor simbólico mensal",
        description:
          "Define aporte mensal inicial pequeno (25–50€ ou 5% da poupança disponível). O montante importa menos que o hábito e aprendizagem. Regista como transferência ou movimento planeado — aumenta só quando o hábito estiver sólido.",
        lesson: "Hábito e educação > montante inicial — começar tarde e grande falha mais que cedo e pequeno.",
      },
      {
        title: "Registar conta de investimento",
        description:
          "Em Contas → Nova conta, cria tipo «Investimento» com nome do broker/PPR e saldo actual (mesmo estimado). Actualiza periodicamente. Património completo na app inclui investimentos — não só corrente e poupança.",
        lesson: "O que não vês no mapa total, não geres — investimento faz parte do património.",
      },
      {
        title: "Revisão trimestral sem pânico",
        description:
          "A cada 3 meses, olha valor da conta investimento e tendência — não o dia ou semana. Se desceu, relembra horizonte de 5+ anos antes de agir. Rebalanceia ou aumenta aporte só com cabeça fria, nunca por medo ou euforia do momento.",
        lesson: "Tempo no mercado > timing do mercado — revisão trimestral filtra ruído diário.",
      },
    ],
  },
];

export function getFinanceMethod(id: string) {
  return FINANCE_METHODS.find((m) => m.id === id);
}
