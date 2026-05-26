import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { messageFromApiBody } from "../src/services/apiMessages";

describe("messageFromApiBody", () => {
  it("usa mensagem do corpo quando presente", () => {
    assert.equal(
      messageFromApiBody(400, { message: "Email já registado." }),
      "Email já registado."
    );
  });

  it("mapeia INTERNAL_ERROR 500", () => {
    const msg = messageFromApiBody(500, {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor.",
    });
    assert.match(msg, /espaço/i);
  });

  it("fallback por status HTTP", () => {
    assert.equal(messageFromApiBody(404), "Recurso não encontrado.");
  });
});
