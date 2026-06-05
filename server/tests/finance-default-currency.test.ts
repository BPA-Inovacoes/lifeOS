import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolveDefaultCurrency } from "../finance/finance-default-currency.js";

describe("resolveDefaultCurrency", () => {
  it("usa fuso horário de Lisboa → EUR", () => {
    assert.equal(resolveDefaultCurrency({ timeZone: "Europe/Lisbon" }), "EUR");
  });

  it("usa fuso horário de São Paulo → BRL", () => {
    assert.equal(resolveDefaultCurrency({ timeZone: "America/Sao_Paulo" }), "BRL");
  });

  it("usa locale pt-BR → BRL", () => {
    assert.equal(resolveDefaultCurrency({ locale: "pt-BR" }), "BRL");
  });

  it("usa locale en-US → USD", () => {
    assert.equal(resolveDefaultCurrency({ locale: "en-US" }), "USD");
  });

  it("usa fuso horário de Luanda → AOA", () => {
    assert.equal(resolveDefaultCurrency({ timeZone: "Africa/Luanda" }), "AOA");
  });

  it("fallback AOA sem hints", () => {
    assert.equal(resolveDefaultCurrency(), "AOA");
  });
});
