# Prompt enviado ao Lovable (formato OpenSpec)

Enviar primeiro no **modo chat** (para tirar dúvidas) e só depois no modo de construção.

---

## Proposal

Construir **Viaje Fácil Assistente**, um web app em formato de chat para uma agência de viagem **fictícia**. O assistente ajuda o cliente na hora da decisão financeira ("cabe essa viagem no meu orçamento?") respondendo em português sobre contas, saldos e transações de um banco de teste.

Autor: **[Hugo Araujo]**.

## Contexto e regras de domínio

- Todos os dados são **fictícios** (sandbox da Plaid). O app mostra um aviso fixo e visível: "Dados fictícios de teste. Não representa o Open Finance brasileiro."
- Na Plaid, **valor positivo de transação é saída** de dinheiro; valor negativo é entrada.
- Em conta de **cartão de crédito**, o saldo atual é o valor **devido** (dívida), não dinheiro disponível.
- Valores originais estão em dólar (USD). Quando o usuário pedir "em reais", converter com taxa **fixa e declarada** (1 USD = R$ 5,00, taxa ilustrativa) e mostrar a taxa na resposta.

## Spec: Etapa 1 (dados locais, sem backend)

### Requisito 1: Tela de chat
- Uma página única com histórico de mensagens, campo de texto e botão enviar.
- Abaixo do campo, 4 sugestões clicáveis: "Qual é o meu saldo?", "Quanto gastei por categoria?", "Quais foram meus 5 maiores gastos?", "Por que meu cartão aparece como dívida?".
- Layout responsivo, em português do Brasil.

### Requisito 2: Dados locais
- Criar `src/data/sandbox.json` com: `accounts` (id, nome, tipo, saldo atual, saldo disponível, moeda) e `transactions` (data, nome, categoria, valor, conta). Incluir pelo menos uma conta corrente, uma poupança e um cartão de crédito, e 30 transações.
- Os dados serão substituídos depois pelos resultados reais exportados do sandbox da Plaid; manter o formato fácil de trocar.
- Nenhuma chave, token ou segredo no código do front-end.

### Requisito 3: Respostas por intenção
O assistente reconhece estas intenções por palavras-chave e responde em linguagem simples:
1. **Saldo**: lista cada conta com saldo; para cartão, escrever "dívida de ..." em vez de "saldo".
2. **Gasto por categoria**: soma só transações de saída (valor positivo), em tabela ordenada do maior para o menor.
3. **Maiores gastos**: os 5 maiores valores positivos.
4. **Explicação do cartão**: texto curto explicando por que o saldo do cartão é dívida.
5. **Pergunta fora do escopo**: responder que ainda não sabe e sugerir as perguntas disponíveis.

### Requisito 4: Mostrar o caminho da resposta
Cada resposta traz um bloco recolhível "Como cheguei nisso" com: pergunta, ferramenta/endpoint de origem (ex.: `accounts/balance/get`, `transactions`), e o cálculo feito.

### Requisito 5: Valores em reais
Botão "Mostrar em R$" que reescreve a última resposta usando a taxa declarada e exibindo a taxa usada.

## Fora do escopo (Etapa 2, futura)
Backend com as chaves só no servidor, integração ao vivo com MCP e avisos por webhook.

## Tasks
1. Estrutura do app e tema.
2. Dados locais e tipos.
3. Motor de intenções e respostas.
4. Bloco "Como cheguei nisso".
5. Conversão para reais.
6. Aviso de dados fictícios e publicação.
