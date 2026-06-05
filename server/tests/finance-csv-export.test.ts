import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildFinanceCsvTable,
  escapeFinanceCsvCell,
  financeCsvRow,
  formatFinanceCsvBody,
  FINANCE_CSV_DELIMITER,
} from "../finance/csv-export.js";

describe("finance csv export", () => {
  it("usa ponto e vírgula e escapa valores com separador", () => {
    assert.equal(FINANCE_CSV_DELIMITER, ";");
    assert.equal(escapeFinanceCsvCell("a;b"), '"a;b"');
    assert.equal(financeCsvRow(["id", "Poupança", 12]), "id;Poupança;12");
  });

  it("gera tabela CSV com cabeçalho e dados", () => {
    const table = buildFinanceCsvTable({
      header: ["id", "nome"],
      rows: [["1", "Conta"]],
    });
    assert.ok(table.startsWith("\uFEFFsep=;"));
    assert.ok(table.includes("id;nome"));
    assert.ok(table.includes("1;Conta"));
  });

  it("prefixa BOM UTF-8 e linha sep= para Excel", () => {
    const out = formatFinanceCsvBody(["id;nome", "1;Conta"]);
    assert.ok(out.startsWith("\uFEFFsep=;"));
    assert.ok(out.includes("\r\nid;nome\r\n1;Conta"));
  });
});
