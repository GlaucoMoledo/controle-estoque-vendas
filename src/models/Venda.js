/**
 * Classe que representa uma Venda
 * Guarda informações sobre uma venda realizada
 */
class Venda {
  constructor(id, produtoId, produtoNome, quantidade, data) {
    // ID único da venda
    this.id = id;
    
    // ID do produto que foi vendido
    this.produtoId = produtoId;
    
    // Nome do produto (guardamos aqui para facilitar na exibição)
    this.produtoNome = produtoNome;
    
    // Quantidade vendida
    this.quantidade = quantidade;
    
    // Data da venda (string no formato brasileiro)
    this.data = data;
  }
}

export default Venda;

