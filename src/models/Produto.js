/**
 * Classe que representa um Produto
 * Guarda as informações básicas de um produto no estoque
 */
class Produto {
  constructor(id, nome, sku, estoqueMinimo, estoqueAtual, codigoBarras = null, foto = null) {
    // ID único do produto (vamos gerar automaticamente)
    this.id = id;
    
    // Nome do produto (ex: "Pneu Aro 15")
    this.nome = nome;
    
    // SKU é um código único do produto (ex: "PN-001")
    this.sku = sku;
    
    // Estoque mínimo - quando chegar nesse valor, precisa repor
    this.estoqueMinimo = estoqueMinimo;
    
    // Estoque atual - quantidade que temos agora
    this.estoqueAtual = estoqueAtual;
    
    // Código de barras ou QR code do produto
    this.codigoBarras = codigoBarras;
    
    // URI da foto do produto (caminho local ou URL)
    this.foto = foto;
  }

  /**
   * Verifica se o produto está abaixo do estoque mínimo
   * Retorna true se precisa repor
   */
  precisaRepor() {
    return this.estoqueAtual <= this.estoqueMinimo;
  }

  /**
   * Decrementa o estoque quando faz uma venda
   * quantidade: quantos itens foram vendidos
   */
  vender(quantidade) {
    if (this.estoqueAtual >= quantidade) {
      this.estoqueAtual -= quantidade;
      return true; // Venda realizada com sucesso
    }
    return false; // Não tem estoque suficiente
  }
}

export default Produto;

