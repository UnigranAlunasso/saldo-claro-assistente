import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { TEXTS, accountLine, detectIntent, formatMoney, sandbox, type Intent } from "@/lib/assistant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viaje Fácil Assistente — seu saldo antes de viajar" },
      { name: "description", content: "Pergunte seu saldo, gastos por categoria e maiores gastos antes de fechar o pacote de viagem." },
      { property: "og:title", content: "Viaje Fácil Assistente" },
      { property: "og:description", content: "Consulte saldos e gastos (dados fictícios Plaid sandbox) direto no chat da agência." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Msg = { id: number; from: "user" | "bot"; text?: string; intent?: Intent };

const QUICK: { label: string; q: string }[] = [
  { label: "Qual é o meu saldo?", q: "Qual é o meu saldo?" },
  { label: "Gasto por categoria", q: "Quanto gastei por categoria?" },
  { label: "5 maiores gastos", q: "Quais foram meus 5 maiores gastos?" },
  { label: "O que é um Item?", q: "O que é um Item?" },
  { label: "Por que o cartão é dívida?", q: "Por que o cartão é dívida?" },
];

function Index() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: "bot", text: "Olá! Antes de fechar seu pacote, posso mostrar seus saldos e gastos. Use os botões ou escreva sua pergunta." },
  ]);
  const [input, setInput] = useState("");
  const [brl, setBrl] = useState(false);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { id: m.length, from: "user", text: q }, { id: m.length + 1, from: "bot", intent: detectIntent(q) }]);
    setInput("");
  };

  const taxa = sandbox.meta.conversao_brl.taxa.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="font-display text-2xl text-primary">Viaje Fácil</p>
            <p className="text-sm text-muted-foreground">Assistente financeiro da sua viagem</p>
          </div>
          <button
            onClick={() => setBrl((b) => !b)}
            className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {brl ? "Mostrar em US$" : "Mostrar em R$"}
          </button>
        </div>
        <div className="bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground">
          ⚠ {sandbox.meta.aviso}
          {brl && <> · Conversão: 1 USD = R$ {taxa} ({sandbox.meta.conversao_brl.nota})</>}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-48 pt-6">
        <div className="space-y-4">
          {msgs.map((m) =>
            m.from === "user" ? (
              <div key={m.id} className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="max-w-[95%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-card-foreground shadow-sm">
                {m.text ?? <Answer intent={m.intent!} brl={brl} onAsk={ask} />}
              </div>
            ),
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {QUICK.map((b) => (
              <button key={b.label} onClick={() => ask(b.q)} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-muted">
                {b.label}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva: saldo, categoria, maiores gastos, item, cartão…"
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function HowTo({ children }: { children: ReactNode }) {
  return (
    <details className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
      <summary className="cursor-pointer font-medium text-foreground">Como cheguei nisso</summary>
      <div className="mt-2 space-y-1">{children}</div>
    </details>
  );
}

function Answer({ intent, brl, onAsk }: { intent: Intent; brl: boolean; onAsk: (q: string) => void }) {
  const conv = brl && <p>Convertido com taxa fixa e ilustrativa: 1 USD = R$ {sandbox.meta.conversao_brl.taxa.toFixed(2).replace(".", ",")}.</p>;
  const fonte = <p>Fonte: {sandbox.meta.fonte}.</p>;

  if (intent === "saldo")
    return (
      <div>
        <p className="mb-2 font-medium">Seus saldos por conta:</p>
        <ul className="divide-y divide-border">
          {sandbox.accounts.map((a) => (
            <li key={a.nome} className="flex justify-between gap-3 py-1.5 text-sm">
              <span>{a.nome} <span className="text-muted-foreground">· {a.tipo}</span></span>
              <span className={a.divida ? "font-semibold text-destructive" : "font-semibold"}>{accountLine(a, brl)}</span>
            </li>
          ))}
        </ul>
        <HowTo>
          {fonte}
          <p>Origem: endpoint de saldos da Plaid sandbox (accounts/balance/get), exportado para dados locais.</p>
          <p>Mostro o saldo atual de cada conta. Em cartão de crédito, o saldo é o valor devido, por isso aparece como dívida.</p>
          {conv}
        </HowTo>
      </div>
    );

  if (intent === "categorias") {
    const total = sandbox.spendingByCategory.reduce((s, c) => s + c.total, 0);
    return (
      <div>
        <p className="mb-2 font-medium">Seus gastos por categoria (só saídas):</p>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {sandbox.spendingByCategory.map((c) => (
              <tr key={c.categoria}><td className="py-1.5">{c.categoria}</td><td className="text-right font-semibold">{formatMoney(c.total, brl)}</td></tr>
            ))}
            <tr><td className="py-1.5 font-semibold">Total</td><td className="text-right font-bold">{formatMoney(total, brl)}</td></tr>
          </tbody>
        </table>
        <HowTo>
          {fonte}
          <p>Origem: transações da Plaid sandbox (transactions/sync), já somadas por categoria.</p>
          <p>Regra: na Plaid, valor positivo é saída. Somei só as saídas de cada categoria.</p>
          {conv}
        </HowTo>
      </div>
    );
  }

  if (intent === "maiores")
    return (
      <div>
        <p className="mb-2 font-medium">Seus 5 maiores gastos:</p>
        <ol className="space-y-2 text-sm">
          {sandbox.topExpenses.map((e, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {i + 1}. {e.descricao}
                <span className="block text-muted-foreground">{new Date(e.data + "T12:00:00").toLocaleDateString("pt-BR")} · {e.categoria} · {e.conta}</span>
              </span>
              <span className="font-semibold">{formatMoney(e.valor, brl)}</span>
            </li>
          ))}
        </ol>
        <HowTo>
          {fonte}
          <p>Origem: transações da Plaid sandbox (transactions/sync).</p>
          <p>Regra: valor positivo é saída. Ordenei as saídas do maior para o menor valor e peguei as 5 primeiras.</p>
          {conv}
        </HowTo>
      </div>
    );

  if (intent === "item")
    return (
      <div>
        <p className="text-sm leading-relaxed">{TEXTS.item}</p>
        <HowTo>
          <p>Explicação baseada na documentação da Pluggy: <a className="underline text-primary" href="https://docs.pluggy.ai" target="_blank" rel="noreferrer">https://docs.pluggy.ai</a></p>
        </HowTo>
      </div>
    );

  if (intent === "cartao")
    return (
      <div>
        <p className="text-sm leading-relaxed">{TEXTS.cartao}</p>
        <HowTo>
          <p>Explicação baseada na documentação da Plaid: <a className="underline text-primary" href="https://plaid.com/docs" target="_blank" rel="noreferrer">https://plaid.com/docs</a></p>
        </HowTo>
      </div>
    );

  return (
    <div className="text-sm">
      <p>Não entendi bem. Posso responder sobre:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {QUICK.map((b) => (
          <button key={b.label} onClick={() => onAsk(b.q)} className="rounded-full border border-primary px-3 py-1 text-primary">{b.label}</button>
        ))}
      </div>
    </div>
  );
}
