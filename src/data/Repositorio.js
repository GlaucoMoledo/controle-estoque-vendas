import Produto from '../models/Produto';
import Venda from '../models/Venda';

/**
 * Repositório em memória
 * Isso significa que os dados são guardados apenas enquanto o app está aberto
 * Quando fechar o app, os dados são perdidos
 * 
 * No futuro, podemos trocar isso por Room (Android) ou Firebase
 */
class Repositorio {
  constructor() {
    // Lista de produtos (array)
    this.produtos = [];
    
    // Lista de vendas (array)
    this.vendas = [];
    
    // Contador para gerar IDs únicos
    this.proximoIdProduto = 1;
    this.proximoIdVenda = 1;
    
    // Vamos adicionar alguns produtos de exemplo para teste
    this.inicializarDadosExemplo();
  }

  /**
   * Adiciona alguns produtos de exemplo
   * Isso ajuda a testar o app quando abrir pela primeira vez
   */
  inicializarDadosExemplo() {
    this.adicionarProduto('Pneu Aro 15', 'PN-001', 5, 10);
    this.adicionarProduto('Óleo de Motor 5W30', 'OL-002', 3, 8);
    this.adicionarProduto('Filtro de Ar', 'FA-003', 4, 2); // Este está abaixo do mínimo!
    this.adicionarProduto('Pastilha de Freio', 'PF-004', 6, 12);
  }

  /**
   * Adiciona um novo produto ao estoque
   * Retorna o produto criado
   */
  adicionarProduto(nome, sku, estoqueMinimo, estoqueAtual, codigoBarras = null, foto = null) {
    const produto = new Produto(
      this.proximoIdProduto++,
      nome,
      sku,
      estoqueMinimo,
      estoqueAtual,
      codigoBarras,
      foto
    );
    this.produtos.push(produto);
    return produto;
  }

  /**
   * Busca produtos por nome ou SKU (para busca/filtro)
   * Retorna array de produtos que correspondem ao termo
   */
  buscarProdutos(termo) {
    const termoLower = termo.toLowerCase();
    return this.produtos.filter(p => 
      p.nome.toLowerCase().includes(termoLower) ||
      p.sku.toLowerCase().includes(termoLower) ||
      (p.codigoBarras && p.codigoBarras.includes(termo))
    );
  }

  /**
   * Busca produto por código de barras
   * Retorna o produto ou null se não encontrar
   */
  obterProdutoPorCodigoBarras(codigoBarras) {
    return this.produtos.find(p => p.codigoBarras === codigoBarras) || null;
  }

  /**
   * Atualiza um produto existente
   */
  atualizarProduto(id, dados) {
    const produto = this.obterProdutoPorId(id);
    if (produto) {
      if (dados.nome !== undefined) produto.nome = dados.nome;
      if (dados.sku !== undefined) produto.sku = dados.sku;
      if (dados.estoqueMinimo !== undefined) produto.estoqueMinimo = dados.estoqueMinimo;
      if (dados.estoqueAtual !== undefined) produto.estoqueAtual = dados.estoqueAtual;
      if (dados.codigoBarras !== undefined) produto.codigoBarras = dados.codigoBarras;
      if (dados.foto !== undefined) produto.foto = dados.foto;
      return true;
    }
    return false;
  }

  /**
   * Busca todos os produtos
   * Retorna um array com todos os produtos
   */
  obterTodosProdutos() {
    return this.produtos;
  }

  /**
   * Busca um produto pelo ID
   * Retorna o produto ou null se não encontrar
   */
  obterProdutoPorId(id) {
    return this.produtos.find(p => p.id === id) || null;
  }

  /**
   * Busca produtos que estão abaixo do estoque mínimo
   * Útil para o Dashboard mostrar alertas
   */
  obterProdutosAbaixoMinimo() {
    return this.produtos.filter(p => p.precisaRepor());
  }

  /**
   * Registra uma nova venda
   * Decrementa o estoque do produto automaticamente
   * Retorna true se a venda foi realizada com sucesso
   */
  registrarVenda(produtoId, quantidade) {
    // Busca o produto
    const produto = this.obterProdutoPorId(produtoId);
    
    // Verifica se o produto existe
    if (!produto) {
      return false;
    }

    // Tenta vender (decrementa o estoque)
    const vendaRealizada = produto.vender(quantidade);
    
    if (vendaRealizada) {
      // Cria a venda
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const venda = new Venda(
        this.proximoIdVenda++,
        produtoId,
        produto.nome,
        quantidade,
        dataAtual
      );
      
      // Adiciona na lista de vendas
      this.vendas.push(venda);
      return true;
    }
    
    // Se chegou aqui, não tinha estoque suficiente
    return false;
  }

  /**
   * Busca todas as vendas
   * Retorna um array com todas as vendas
   */
  obterTodasVendas() {
    return this.vendas;
  }

  /**
   * Busca o total de produtos cadastrados
   */
  obterTotalProdutos() {
    return this.produtos.length;
  }

  /**
   * Busca o total de vendas realizadas
   */
  obterTotalVendas() {
    return this.vendas.length;
  }
}

// Criamos uma única instância do repositório (singleton)
// Assim, todos os lugares do app compartilham os mesmos dados
const repositorio = new Repositorio();

export default repositorio;

