# Viaje Fácil Assistente

Assistente financeiro em formato de chat que leva o banco até onde o cliente já está: **uma agência de viagem**, na hora de decidir se uma viagem cabe no orçamento.

> **Todos os dados são fictícios** (sandbox da Plaid). Este projeto é um laboratório e **não representa o Open Finance brasileiro**, que em produção exige consentimento e segurança.

- **App publicado:** https://saldo-claro-assistente.lovable.app/
- **Autor:** Hugo Araujo

## 1. Onde o cliente está, o que o assistente responde e de onde vem cada dado

**Cenário:** o cliente está no app de uma agência de viagem (fictícia) e precisa decidir se paga um pacote. Em vez de abrir o app do banco, ele pergunta no chat.

| Pergunta do cliente | O que o assistente responde | Origem do dado |
|---|---|---|
| "Qual é o meu saldo?" | Saldo de cada conta; cartão aparece como dívida | Plaid sandbox, saldos das contas (`accounts/balance/get`) |
| "Quanto gastei por categoria?" | Tabela de gastos por categoria (só saídas) | Plaid sandbox, transações (`transactions/sync`) |
| "Quais foram meus 5 maiores gastos?" | Os 5 maiores valores de saída | Plaid sandbox, transações |
| "O que é um Item?" / "Por que o cartão é dívida?" | Explicação em linguagem simples | Documentação via MCP da Pluggy (Item) e da Plaid |

Regras que o assistente respeita: na Plaid, **valor positivo é saída**; em cartão de crédito, o **saldo é o valor devido**.

**Caminho de uma resposta** (exemplo: "qual é o meu saldo?"):

1. O cliente escreve a pergunta no chat.
2. O app identifica a intenção (saldo).
3. Busca as contas no conjunto de dados de teste (originado do endpoint de saldos da Plaid sandbox).
4. Formata em português; para cartão, escreve "dívida de ...".
5. Mostra o bloco "Como cheguei nisso" com a origem e o cálculo.

Na Etapa 1 o app usa **dados locais** (`sandbox.json`) exportados do sandbox, sem chaves no front-end.

## 2. Como configurar os servidores MCP

Usei o **Codex**; a ideia vale para qualquer IA com suporte a MCP (os caminhos mudam conforme o computador).

### Pluggy (documentação, sem chave)

O servidor hospedado da Pluggy é **Streamable HTTP**, sem API key, em:

```
https://mcp.pluggy.ai/mcp
```

Como o Codex fala com servidores locais, a documentação da Pluggy manda usar o `mcp-remote` para fazer a ponte com o servidor hospedado (precisa do Node.js instalado, por causa do `npx`). Em `~/.codex/config.toml`:

```toml
[mcp_servers.pluggy-docs]
command = "npx"
args = ["-y", "mcp-remote", "https://mcp.pluggy.ai/mcp"]
```

Usei o servidor de forma anônima (sem login na conta do dashboard). Conferi com `/mcp` e pedi à IA que explicasse o que é um **Item**, citando as fontes.

### Plaid (dados fictícios, sandbox)

1. Em [dashboard.plaid.com](https://dashboard.plaid.com), **Developers > Keys**, copiei o **Client ID** e o **secret de Sandbox**.
2. Instalei o [uv](https://docs.astral.sh/uv/) para ter o `uvx`.
3. Servidor **STDIO** `mcp-server-plaid`, em `~/.codex/config.toml`:

```toml
[mcp_servers.plaid]
command = "uvx"   # ou o caminho completo do uvx (use `which uvx`)
args = ["mcp-server-plaid", "--client-id", "SEU_CLIENT_ID", "--secret", "SEU_SECRET_SANDBOX"]
```

> **Nunca** versione nem mostre em print o Client ID e o secret. Este repositório não contém nenhuma chave; o `config.toml` fica só na minha máquina.

4. Com `/mcp` confirmei os dois servidores ativos (print 01).
5. O servidor `mcp-server-plaid` **só cria o Item de teste (token de sandbox) e busca na documentação**; ele não lê contas nem transações. Por isso o Codex criou o Item pelo MCP e fez a leitura chamando a **API do sandbox** (`https://sandbox.plaid.com`) por um script em PowerShell: saldos em `/accounts/balance/get` e transações em `/transactions/sync`. O script lê as chaves do `config.toml` por código, sem imprimi-las. A repetição da criação do Item gerou um segundo Item no sandbox, sem consequência (dados de teste).

## 3. Especificação enviada ao Lovable e ajustes

O prompt completo, no formato OpenSpec, está em [`prompt-lovable.md`](prompt-lovable.md). Mandei primeiro no **modo chat** para tirar dúvidas e depois publiquei.

**Ajustes depois do primeiro resultado:**

## 4. Melhoria escolhida

**Valores também em reais, com a conversão declarada.** Os dados da Plaid sandbox vêm em dólar; o botão "Mostrar em R$" converte com uma **taxa fixa e ilustrativa (1 USD = R$ 5,00)** e sempre mostra a taxa usada, para não passar a impressão de cotação real.

## Evidências

**Servidores MCP ativos (Pluggy e Plaid):**

![MCP ativos](prints/01-mcp-ativos.png)

**Pluggy explicando o que é um Item, com fontes:**

![Pluggy Item](prints/02-pluggy-item.png)

**Plaid sandbox: contas e saldos (cartão como dívida):**

![Contas e saldos](prints/03-plaid-contas-saldos.png)

**Plaid sandbox: gasto por categoria (só saídas):**

![Gasto por categoria](prints/04-plaid-gasto-por-categoria.png)

**Plaid sandbox: os 5 maiores gastos:**

![Maiores gastos](prints/05-plaid-maiores-gastos.png)

### Três padrões de gasto observados

Valores em dólar, regra aplicada: valor positivo é saída.

1. **Transferências de saída dominam:** US$ 20.550,00 no total; os três maiores lançamentos são de US$ 5.850,00 cada, na conta Plaid Money Market. A descrição (`ACH Electronic Credit GUSTO PAY`) sugere folha de pagamento, então esse padrão vem do dado fictício do sandbox e não de um gasto real de consumo.
2. **Pagamentos de empréstimos:** US$ 6.310,50, incluindo pagamentos automáticos do cartão de crédito de US$ 2.078,50 (em setembro e outubro).
3. **Consumo menor e bem distribuído:** alimentação e bebidas (US$ 1.548,99), transporte (US$ 1.535,19), aluguel e serviços (US$ 1.500,00) e viagens (US$ 1.500,00), o que é o mais útil para o cenário da agência de viagem.

Sobre o cartão: o saldo de uma conta de cartão de crédito é o valor **devido**, por isso o assistente escreve "dívida de US$ 410,00" em vez de "saldo".

## Endereço do app publicado

https://saldo-claro-assistente.lovable.app
