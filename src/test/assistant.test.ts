import { describe, expect, it } from "vitest";
import { accountLine, detectIntent, formatMoney, sandbox } from "@/lib/assistant";

describe("assistente", () => {
  it("cartão de crédito aparece como dívida", () => {
    const cc = sandbox.accounts.find((a) => a.nome === "Plaid Credit Card")!;
    expect(accountLine(cc, false)).toBe("dívida de US$ 410,00");
  });
  it("converte para reais com taxa 5,00", () => {
    expect(formatMoney(410, true)).toBe("R$ 2.050,00");
  });
  it("detecta intenções por palavra-chave", () => {
    expect(detectIntent("Qual é o meu saldo?")).toBe("saldo");
    expect(detectIntent("Quanto gastei por categoria?")).toBe("categorias");
    expect(detectIntent("Quais foram meus 5 maiores gastos?")).toBe("maiores");
    expect(detectIntent("O que é um Item?")).toBe("item");
    expect(detectIntent("Por que o cartão é dívida?")).toBe("cartao");
  });
});
