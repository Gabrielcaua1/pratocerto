# PratoCerto

Protótipo interativo do estudo de caso **"O lançamento do PratoCerto"**, desenvolvido para a disciplina de Gestão de Produtos.

**Integrantes:** Gabriel Brito e João Victor.

## Sobre o projeto

O PratoCerto simula o relançamento de um serviço de entrega de refeições saudáveis. A aplicação demonstra como a operação pode controlar capacidade, estoque e demandas de entrega em uma interface web única, com dados controlados durante a sessão.

## Escopo funcional

### Incluído no MVP

- Catálogo com pratos, preços, disponibilidade e controle de estoque.
- Carrinho, cupom de 10% (`PRATO10`) e formas de pagamento simuladas.
- Confirmação de pedido somente após pagamento bem-sucedido.
- Simulação de 10% de falhas no pagamento, sem cobrança nem criação de pedido.
- Prazo de entrega calculado a partir da carga atual da operação.
- Limite configurável de pedidos em andamento.
- Acompanhamento visual em oito etapas.
- Separação dos pedidos entre **Em preparo**, **A caminho** e **Finalizados**.
- Cadastro de nome, bairro, horário e restrições alimentares.
- Bloqueio de pratos incompatíveis com as restrições cadastradas.
- Sugestão do dia baseada nas preferências do usuário.
- Área de entrega limitada aos bairros configurados no protótipo.
- Fila da cozinha contendo apenas pedidos pagos.
- Agrupamento de entregas por bairro.
- Área de suporte com respostas rápidas e abertura de chamados.
- Avaliação de entregas finalizadas.
- Painel com pedidos por hora, pagamentos recusados, vendas sem estoque, tempo médio e entregas no prazo.
- Simulação de pico de demanda de 0% a 200% sobre uma base de 30 pedidos.
- Reinicialização completa da demonstração.

### Fora do escopo

- Login, autenticação e perfis persistidos.
- Banco de dados ou API de produção.
- Integração real com operadora de pagamento.
- Estoque compartilhado entre usuários ou sessões.
- Geolocalização e roteamento real.
- Rastreamento em tempo real de entregadores.
- Processamento real de cupons e reembolsos.
- Serviço de atendimento humano.
- Cobrança, emissão fiscal ou sistema de pedidos externo.

## Tecnologias

- HTML5 para a estrutura.
- CSS3 para layout responsivo e componentes visuais.
- JavaScript puro para interface e simulação.
- Node.js para servir os arquivos estáticos em ambiente local.
- Sem framework front-end e sem banco de dados.

> Os dados existem somente na memória do navegador e são perdidos ao recarregar a página.

## Como executar

### Pré-requisitos

- Node.js instalado.
- Navegador moderno.

### Passos

No terminal, dentro da pasta do projeto:

```bash
npm start
```

O servidor será iniciado em `http://127.0.0.1:3000` e tentará abrir o navegador automaticamente.

Para interromper a execução, pressione `Ctrl+C`.

Também é possível abrir `index.html` diretamente, mas o servidor é recomendado para reproduzir o ambiente esperado.

## Estrutura do projeto

```text
.
|-- index.html  # Estrutura das cinco telas
|-- style.css   # Layout, componentes e tema visual
|-- app.js      # Estado, regras de negócio e simulações
|-- server.js   # Servidor HTTP local
|-- package.json
|-- package-lock.json
`-- README.md
```

## Telas da aplicação

| Tela | Responsabilidade |
|---|---|
| Pedir | Cardápio, carrinho, pagamento, prazo e painel operacional |
| Acompanhar | Etapas, status e avaliação dos pedidos |
| Suporte | Respostas rápidas e chamados do cliente |
| Perfil | Dados de entrega e restrições alimentares |
| Operação | Limite, estoque, filas, rotas e teste de estresse |

## Relacionamento com o estudo de caso

| Problema do estudo de caso | Implementação no MVP |
|---|---|
| Limitar pedidos | `LIMITE` controla o máximo de pedidos em andamento e pode ser ajustado na operação |
| Informar prazo real | `prazo()` considera a fila atual e atualiza o banner antes do pagamento |
| Corrigir pagamento | Pedido é criado somente após pagamento confirmado |
| Evitar venda sem estoque | Itens esgotados são bloqueados e o estoque é descontado na confirmação |
| Priorizar pedidos pagos | A fila da cozinha usa apenas pedidos com pagamento confirmado |
| Reduzir área de entrega | Perfil permite selecionar ou informar bairros fora da área |
| Acompanhar o pedido | A tela Acompanhar divide o fluxo em preparo, rota e finalizados |
| Recomendar pratos | `TAGS` associa pratos às restrições e gera uma sugestão compatível |
| Melhorar atendimento | Suporte oferece respostas rápidas e registro de chamados |
| Agrupar entregas | Operação agrupa pedidos em andamento por bairro |
| Testar capacidade | Simulação de campanha varia a demanda entre 0% e 200% |
| Medir resultados | Painel calcula cinco indicadores operacionais |

## Parâmetros principais

Os parâmetros iniciais estão no começo de `app.js`:

- `CAP`: capacidade por hora da cozinha (`100`), embalagem (`80`) e entrega (`50`).
- `LIMITE`: máximo inicial de pedidos em andamento (`24`).
- `BASE`: duração mínima de preparo e rota sem fila (`18` minutos).
- `MENU0`: pratos, preços e estoque inicial.
- `TAGS`: restrições atendidas por cada prato.
- `setInterval(tick, 1000)`: transforma um segundo real em um minuto da simulação.

## Observações

- Pagamento, cupom, cozinha, entregadores e chamados são simulados.
- Os números demonstrativos não representam a capacidade real de uma operação comercial.
- A implementação atual é adequada para demonstração e validação de conceitos, não para produção.
