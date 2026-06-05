/** Separador para Excel em locale pt-PT/pt-AO (vírgula é separador decimal). */
export const FINANCE_CSV_DELIMITER = ";";

export function escapeFinanceCsvCell(
  value: string | number,
  delimiter: string = FINANCE_CSV_DELIMITER
): string {
  const s = String(value);
  if (s.includes(delimiter) || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function financeCsvRow(
  cells: (string | number)[],
  delimiter: string = FINANCE_CSV_DELIMITER
): string {
  return cells.map((c) => escapeFinanceCsvCell(c, delimiter)).join(delimiter);
}

export type FinanceExportTable = {
  header: string[];
  rows: (string | number)[][];
};

/** @deprecated Use FinanceExportTable */
export type FinanceCsvTable = FinanceExportTable;

/** Tabela CSV válida: cabeçalho + linhas, BOM UTF-8 e `sep=` para Excel. */
export function buildFinanceCsvTable(table: FinanceExportTable): string {
  const lines = [financeCsvRow(table.header), ...table.rows.map((row) => financeCsvRow(row))];
  return formatFinanceCsvBody(lines);
}

/** BOM UTF-8 + linha `sep=` + CRLF para abrir correctamente no Excel (Windows). */
export function formatFinanceCsvBody(lines: string[]): string {
  const delim = FINANCE_CSV_DELIMITER;
  const body = [`sep=${delim}`, ...lines].join("\r\n");
  return `\uFEFF${body}`;
}
