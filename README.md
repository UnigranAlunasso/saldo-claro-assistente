# Saldo Claro Assistente

Construa o app a partir da especificação anexada (Viaje Fácil Assistente).

Respostas às dúvidas:

Fonte dos dados: arquivo sandbox.json (Etapa 1), anexado. Sem chaves e sem backend. Não há lista completa de transações: use "accounts" para saldos, "spendingByCategory" para gasto por categoria e "topExpenses" para os 5 maiores gastos. Mantenha o campo "divida" para escrever "dívida de US$ ..." nos cartões. Use "meta.conversao_brl" para o botão "Mostrar em R$".

Explicações: textos fixos com links. Use estes textos exatamente:
- Item (Pluggy): "Na Pluggy, um Item é a representação da conexão de um usuário com uma instituição financeira por meio de um conector. Ele é criado após o consentimento do usuário e funciona como ponto de entrada para consultar, pela API, os dados coletados, como contas, transações e investimentos. O Item representa a conexão; os produtos são os dados acessados por meio dela."
- Cartão (Plaid): "Em uma conta de cartão de crédito, o saldo atual é o valor que você deve ao banco, não dinheiro disponível. Por isso o app mostra 'dívida de US$ ...' em vez de 'saldo'."
Links: use só https://docs.pluggy.ai e https://plaid.com/docs. Não crie links para páginas internas, para não inventar endereços que não existem.

Entrada: botões e palavras-chave.

O resto da especificação continua igual.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://saldo-claro-assistente.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e3e6468-33e0-4540-a3d1-3ae555d9be76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
