import type { CaseAppMode } from "@/services/caseApi";

export const CASE_PROMPTS: Record<CaseAppMode, { label: string; content: string }[]> = {
  finance: [
    { label: "Como está o meu mês?", content: "Como está o meu mês financeiro?" },
    { label: "Criar conta", content: 'Cria uma conta poupança chamada "Reserva"' },
    { label: "Registar despesa", content: "Regista despesa 25 euros" },
    { label: "Criar meta", content: 'Cria meta "Férias" 2000 euros' },
    { label: "Onde gasto mais?", content: "Onde gasto mais este mês?" },
    { label: "Dívidas", content: "Tenho dívidas registadas? O que devo atacar primeiro?" },
  ],
  focus: [
    { label: "Criar hábito", content: 'Cria um hábito "Beber água"' },
    { label: "Marcar hábito", content: 'Marca o hábito "Beber água" como feito' },
    { label: "Foco de hoje", content: "O que devo priorizar hoje?" },
    { label: "Hábitos", content: "Como vão os meus hábitos hoje?" },
    { label: "Tarefas", content: "Quantas tarefas tenho em aberto?" },
  ],
  game: [
    { label: "Progresso RPG", content: "Como está o meu progresso no Game Mode?" },
    { label: "Próximo nível", content: "O que falta para subir de nível?" },
  ],
};
