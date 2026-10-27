import data from "@/data/sandbox.json";

export type Intent = "saldo" | "categorias" | "maiores" | "item" | "cartao" | "desconhecido";

export const sandbox = data;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function detectIntent(text: string): Intent {
  const t = norm(text);
  if (/cartao|divida/.test(t) && /por que|porque|divida|explica/.test(t)) return "cartao";
  if (/\bitem\b/.test(t)) return "item";
  if (/maior|top|5 /.test(t)) return "maiores";
  if (/categoria/.test(t)) return "categorias";
  if (/saldo|conta/.test(t)) return "saldo";
  return "desconhecido";
}

export function formatMoney(usd: number, brl: boolean): string {
  if (brl) {
    const v = usd * data.meta.conversao_brl.taxa;
    return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return "US$ " + usd.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function accountLine(a: (typeof data.accounts)[number], brl: boolean): string {
  return a.divida ? `dívida de ${formatMoney(a.saldo_atual, brl)}` : `saldo de ${formatMoney(a.saldo_atual, brl)}`;
}

export const TEXTS = {
  item: "Na Pluggy, um Item é a representação da conexão de um usuário com uma instituição financeira por meio de um conector. Ele é criado após o consentimento do usuário e funciona como ponto de entrada para consultar, pela API, os dados coletados, como contas, transações e investimentos. O Item representa a conexão; os produtos são os dados acessados por meio dela.",
  cartao: "Em uma conta de cartão de crédito, o saldo atual é o valor que você deve ao banco, não dinheiro disponível. Por isso o app mostra 'dívida de US$ ...' em vez de 'saldo'.",
};
