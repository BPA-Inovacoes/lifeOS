import manualRaw from "../../../../docs/MANUAL-UTILIZADOR.md?raw";

/** Texto do manual para a app (remove referências só para dev/repo). */
export function getManualMarkdown(): string {
  return manualRaw
    .replace(
      /^Para instalação e desenvolvimento[^\n]*\n\n/m,
      ""
    )
    .replace(
      /^Consulta o \[ROADMAP\][^\n]*\n\n/m,
      "Algumas funcionalidades ainda estão em desenvolvimento.\n\n"
    )
    .replace(/\*Última atualização:[^\n]*\n?/m, "");
}
