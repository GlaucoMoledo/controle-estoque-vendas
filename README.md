# Controle de Estoque e Venda - React Native

Este projeto foi desenvolvido como parte de um trabalho de extensão da faculdade, na disciplina de Programação Para Dispositivos Móveis em Android.
A ideia foi criar um aplicativo simples, funcional e fácil de entender, voltado para o controle básico de estoque e vendas, usando apenas armazenamento em memória (sem backend). A estrutura já deixa o caminho preparado para evoluções futuras, como integração com Room ou Firebase.

## Funcionalidades
- Cadastro de produtos (nome, SKU, código de barras, foto do produto, estoque mínimo e atual).
- Registro de vendas, com baixa automática no estoque.
- Dashboard com visão geral do sistema.
- Navegação entre Dashboard, Estoque e Vendas.
- Estrutura pensada para ser facilmente personalizada e expandida.

## Como o app funciona

### Repositório em Memória
Os dados existem apenas enquanto o app está aberto. Ao fechar, tudo é reiniciado.
Para estudo e testes, isso é perfeito — sem complicar com banco real.

### Produtos
- Cada produto tem: ID, Nome, SKU, Estoque Mínimo e Estoque Atual
- O app alerta quando um produto está abaixo do estoque mínimo
- Ao cadastrar um produto, você define o estoque inicial

### Vendas
- Toda venda registrada reduz automaticamente o estoque do produto.
- O app impede vendas que ultrapassam o estoque disponível.
- Cada venda registra: ID, Produto, Quantidade e Data

### Dashboard
- Mostra o total de produtos cadastrados
- Mostra o total de vendas realizadas
- Lista produtos que estão abaixo do estoque mínimo (alertas)

## Possíveis evoluções

- Implementar persistência com Room ou Firebase
- Criar telas de Clientes, Ordens de Serviço e Transferências
- Inserir autenticação (Firebase Auth)
- Gerar relatórios (vendas, estoque mínimo, etc.)
- Criar gráficos de desempenho
- Melhorar validações de entrada
- Temas e personalização visual para empresas

## Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- JavaScript/ES6

