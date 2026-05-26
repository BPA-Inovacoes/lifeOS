import type { ApiErrorBody } from "@/services/http";

const STATUS_HINTS: Record<number, string> = {
  400: "Pedido inválido. Verifica os dados.",
  401: "Sessão expirada. Entra novamente.",
  403: "Sem permissão para esta acção.",
  404: "Recurso não encontrado.",
  409: "Conflito — pode já existir um registo igual.",
  500: "Erro no servidor. Tenta outra vez em instantes.",
  502: "Servidor indisponível. Confirma que a API está a correr.",
  503: "Serviço temporariamente indisponível.",
};

export function messageFromApiBody(
  status: number,
  body?: ApiErrorBody
): string {
  if (body?.code === "INTERNAL_ERROR" && status >= 500) {
    return "Erro interno ao processar o pedido. Se criaste um espaço, espera alguns segundos e tenta de novo.";
  }
  if (body?.message && body.message !== "Erro interno do servidor.") {
    return body.message;
  }
  return STATUS_HINTS[status] ?? `Erro HTTP ${status}`;
}
