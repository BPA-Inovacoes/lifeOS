import PDFDocument from "pdfkit";

import type { DebtPlanEntry } from "./finance-debt-plan";

export type MonthlyPdfInput = {
  monthLabel: string;
  generatedAt: string;
  currency: string;
  netWorth: number;
  month: {
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
  };
  accounts: { name: string; type: string; balance: number; isLiability: boolean }[];
  topCategories: { name: string; total: number }[];
  debts: {
    totalDebt: number;
    snowballTarget: DebtPlanEntry | null;
    avalancheTarget: DebtPlanEntry | null;
    entries: DebtPlanEntry[];
  };
};

function fmtMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function line(doc: InstanceType<typeof PDFDocument>, y: number) {
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#cccccc").stroke();
}

export function buildFinanceMonthlyPdf(input: MonthlyPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#1a1a1a").text("LifeOS — Relatório mensal", { align: "left" });
    doc.fontSize(11).fillColor("#555555").text(input.monthLabel, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(9).text(`Gerado em ${input.generatedAt.slice(0, 19).replace("T", " ")} UTC`);

    let y = doc.y + 16;
    line(doc, y);
    y += 14;

    doc.fontSize(12).fillColor("#1a1a1a").text("Resumo do mês", 50, y);
    y += 20;
    doc.fontSize(10).fillColor("#333333");
    const rows = [
      ["Receitas", fmtMoney(input.month.income, input.currency)],
      ["Despesas", fmtMoney(input.month.expense, input.currency)],
      ["Saldo do mês", fmtMoney(input.month.net, input.currency)],
      ["Taxa de poupança", `${input.month.savingsRate}%`],
      ["Património líquido", fmtMoney(input.netWorth, input.currency)],
    ];
    for (const [label, value] of rows) {
      doc.text(`${label}:`, 50, y, { continued: true, width: 200 });
      doc.text(value, { align: "right", width: 495 });
      y += 16;
    }

    y += 8;
    line(doc, y);
    y += 14;

    doc.fontSize(12).text("Contas", 50, y);
    y += 18;
    doc.fontSize(9);
    for (const a of input.accounts.slice(0, 12)) {
      const bal = a.isLiability && a.balance < 0 ? Math.abs(a.balance) : a.balance;
      const prefix = a.isLiability ? "Deves " : "";
      doc.text(`• ${a.name} (${a.type}): ${prefix}${fmtMoney(bal, input.currency)}`, 50, y);
      y += 14;
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
    }

    if (input.topCategories.length) {
      y += 8;
      line(doc, y);
      y += 14;
      doc.fontSize(12).text("Top despesas", 50, y);
      y += 18;
      doc.fontSize(9);
      for (const c of input.topCategories) {
        doc.text(`• ${c.name}: ${fmtMoney(c.total, input.currency)}`, 50, y);
        y += 14;
      }
    }

    if (input.debts.entries.length) {
      y += 8;
      if (y > 680) {
        doc.addPage();
        y = 50;
      }
      line(doc, y);
      y += 14;
      doc.fontSize(12).text("Dívidas", 50, y);
      y += 18;
      doc.fontSize(10).text(
        `Total em dívida: ${fmtMoney(input.debts.totalDebt, input.currency)}`,
        50,
        y
      );
      y += 16;
      if (input.debts.snowballTarget) {
        doc.fontSize(9).text(
          `Snowball — atacar primeiro: ${input.debts.snowballTarget.name} (${fmtMoney(input.debts.snowballTarget.debtAmount, input.currency)})`,
          50,
          y
        );
        y += 14;
      }
      if (input.debts.avalancheTarget) {
        const apr =
          input.debts.avalancheTarget.aprPercent != null
            ? ` · ${input.debts.avalancheTarget.aprPercent}% TAEG`
            : "";
        doc.text(
          `Avalanche — prioridade: ${input.debts.avalancheTarget.name}${apr}`,
          50,
          y
        );
        y += 14;
      }
      doc.fontSize(9);
      for (const d of input.debts.entries) {
        const apr = d.aprPercent != null ? ` · ${d.aprPercent}%` : "";
        doc.text(
          `${d.rank}. ${d.name}: ${fmtMoney(d.debtAmount, input.currency)}${apr}`,
          50,
          y
        );
        y += 13;
      }
    }

    doc.fontSize(8).fillColor("#888888").text(
      "Dados registados manualmente no LifeOS — não constitui aconselhamento financeiro.",
      50,
      780,
      { align: "center", width: 495 }
    );

    doc.end();
  });
}
