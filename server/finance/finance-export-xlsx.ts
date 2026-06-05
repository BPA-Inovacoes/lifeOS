import * as XLSX from "xlsx";

import type { FinanceExportTable } from "./csv-export";

export type FinanceExportSheet = {
  /** Nome da folha no Excel (máx. 31 caracteres). */
  sheetName: string;
  table: FinanceExportTable;
};

const INVALID_SHEET_CHARS = /[\\/?*[\]]/g;

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(INVALID_SHEET_CHARS, " ").trim();
  return (cleaned || "Folha").slice(0, 31);
}

function tableToSheet(table: FinanceExportTable): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet([table.header, ...table.rows]);
}

export function buildFinanceExportXlsx(
  generatedAt: string,
  sheets: FinanceExportSheet[]
): Buffer {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    tableToSheet({
      header: ["campo", "valor"],
      rows: [
        ["exportador", "LifeOS"],
        ["gerado_em", generatedAt],
        ["formato", "Excel (.xlsx)"],
        ["folhas", String(sheets.length + 1)],
      ],
    }),
    "Info"
  );

  const usedNames = new Set<string>(["info"]);
  for (const { sheetName, table } of sheets) {
    let name = sanitizeSheetName(sheetName);
    let suffix = 2;
    while (usedNames.has(name.toLowerCase())) {
      const base = sanitizeSheetName(sheetName).slice(0, 28);
      name = `${base} ${suffix++}`;
    }
    usedNames.add(name.toLowerCase());

    XLSX.utils.book_append_sheet(workbook, tableToSheet(table), name);
  }

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
