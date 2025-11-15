import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import repositorio from '../data/Repositorio';

/**
 * Tela de Vendas
 * Lista todas as vendas realizadas e permite registrar novas vendas
 */
export default function VendasScreen() {
  // Estado para guardar a lista de vendas
  const [vendas, setVendas] = useState([]);
  
  // Estado para guardar a lista de produtos (para o seletor)
  const [produtos, setProdutos] = useState([]);
  
  // Estados para o modal de registro de venda
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');

  /**
   * Função para carregar as vendas
   */
  const carregarVendas = () => {
    const listaVendas = repositorio.obterTodasVendas();
    // Ordena por ID decrescente (mais recentes primeiro)
    listaVendas.sort((a, b) => b.id - a.id);
    setVendas(listaVendas);
  };

  /**
   * Função para carregar os produtos
   */
  const carregarProdutos = () => {
    const listaProdutos = repositorio.obterTodosProdutos();
    setProdutos(listaProdutos);
  };

  /**
   * useFocusEffect executa sempre que a tela recebe foco
   */
  useFocusEffect(
    React.useCallback(() => {
      carregarVendas();
      carregarProdutos();
    }, [])
  );

  /**
   * Função para abrir o modal de registro de venda
   */
  const abrirModalVenda = () => {
    // Carrega produtos atualizados antes de abrir o modal
    carregarProdutos();
    
    // Verifica se tem produtos cadastrados
    const listaProdutos = repositorio.obterTodosProdutos();
    if (listaProdutos.length === 0) {
      Alert.alert(
        'Atenção',
        'Não há produtos cadastrados. Por favor, cadastre produtos primeiro na tela de Estoque.'
      );
      return;
    }
    
    // Seleciona o primeiro produto por padrão
    setProdutoSelecionado(listaProdutos[0].id);
    setModalVisivel(true);
  };

  /**
   * Função para fechar o modal
   */
  const fecharModal = () => {
    setModalVisivel(false);
    setQuantidade('');
    setProdutoSelecionado(null);
  };

  /**
   * Função para registrar uma nova venda
   */
  const registrarVenda = () => {
    // Validações
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um produto');
      return;
    }

    const quantidadeNumero = parseInt(quantidade);
    if (!quantidade || quantidadeNumero <= 0) {
      Alert.alert('Erro', 'Por favor, informe uma quantidade válida');
      return;
    }

    // Busca o produto para verificar o estoque
    const produto = repositorio.obterProdutoPorId(produtoSelecionado);
    if (!produto) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }

    // Verifica se tem estoque suficiente
    if (produto.estoqueAtual < quantidadeNumero) {
      Alert.alert(
        'Estoque Insuficiente',
        `Estoque disponível: ${produto.estoqueAtual} unidades\nQuantidade solicitada: ${quantidadeNumero} unidades`
      );
      return;
    }

    // Registra a venda (já decrementa o estoque automaticamente)
    const sucesso = repositorio.registrarVenda(produtoSelecionado, quantidadeNumero);

    if (sucesso) {
      // Atualiza as listas
      carregarVendas();
      carregarProdutos(); // Atualiza produtos também, pois o estoque mudou
      
      // Fecha o modal e mostra mensagem de sucesso
      fecharModal();
      Alert.alert('Sucesso', 'Venda registrada com sucesso!');
    } else {
      Alert.alert('Erro', 'Não foi possível registrar a venda');
    }
  };

  /**
   * Função para renderizar cada item da lista de vendas
   */
  const renderizarVenda = ({ item }) => {
    return (
      <View style={styles.cardVenda}>
        <View style={styles.vendaIconContainer}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.vendaIconGradient}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </LinearGradient>
        </View>
        <View style={styles.vendaContent}>
          <View style={styles.vendaHeader}>
            <Text style={styles.nomeProdutoVenda}>{item.produtoNome}</Text>
            <Text style={styles.quantidadeVenda}>
              <Ionicons name="cube" size={14} color="#4CAF50" /> {item.quantidade}
            </Text>
          </View>
          <View style={styles.vendaDetails}>
            <View style={styles.vendaDetailItem}>
              <Ionicons name="calendar" size={14} color="#999" />
              <Text style={styles.dataVenda}>{item.data}</Text>
            </View>
            <View style={styles.vendaDetailItem}>
              <Ionicons name="receipt" size={14} color="#999" />
              <Text style={styles.idVenda}>#{item.id}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Renderiza a tela
   */
  return (
    <View style={styles.container}>
      {/* Header com total de vendas */}
      {vendas.length > 0 && (
        <View style={styles.headerStats}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.headerStatsGradient}
          >
            <Ionicons name="receipt" size={32} color="#fff" />
            <Text style={styles.headerStatsText}>
              {vendas.length} {vendas.length === 1 ? 'venda realizada' : 'vendas realizadas'}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Lista de vendas */}
      <FlatList
        data={vendas}
        renderItem={renderizarVenda}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.textoVazio}>Nenhuma venda registrada ainda</Text>
            <Text style={styles.textoVazioSecundario}>
              Toque no botão + para registrar uma venda
            </Text>
          </View>
        }
      />

      {/* Botão de adicionar venda (flutuante) */}
      <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirModalVenda}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.botaoAdicionarGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal de registro de venda */}
      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Registrar Nova Venda</Text>
              <TouchableOpacity onPress={fecharModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Seletor de produto */}
              <Text style={styles.label}>Produto *</Text>
              <ScrollView style={styles.seletorProduto} nestedScrollEnabled={true}>
                {produtos.map((produto) => (
                  <TouchableOpacity
                    key={produto.id}
                    style={[
                      styles.opcaoProduto,
                      produtoSelecionado === produto.id && styles.opcaoProdutoSelecionada,
                    ]}
                    onPress={() => setProdutoSelecionado(produto.id)}
                  >
                    <View style={styles.opcaoProdutoContent}>
                      <Ionicons
                        name={produtoSelecionado === produto.id ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={produtoSelecionado === produto.id ? '#2196F3' : '#999'}
                      />
                      <View style={styles.opcaoProdutoInfo}>
                        <Text
                          style={[
                            styles.textoOpcaoProduto,
                            produtoSelecionado === produto.id && styles.textoOpcaoProdutoSelecionada,
                          ]}
                        >
                          {produto.nome}
                        </Text>
                        <Text
                          style={[
                            styles.textoEstoqueOpcao,
                            produtoSelecionado === produto.id && styles.textoEstoqueOpcaoSelecionada,
                          ]}
                        >
                          Estoque: {produto.estoqueAtual} | SKU: {produto.sku}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Mostra informações do produto selecionado */}
              {produtoSelecionado && (() => {
                const produto = produtos.find(p => p.id === produtoSelecionado);
                if (produto) {
                  return (
                    <View style={styles.infoProduto}>
                      <View style={styles.infoProdutoItem}>
                        <Ionicons name="cube" size={20} color="#2196F3" />
                        <Text style={styles.textoInfoProduto}>
                          Estoque Disponível: {produto.estoqueAtual} unidades
                        </Text>
                      </View>
                      {produto.codigoBarras && (
                        <View style={styles.infoProdutoItem}>
                          <Ionicons name="qr-code" size={20} color="#2196F3" />
                          <Text style={styles.textoInfoProduto}>
                            Código: {produto.codigoBarras}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                }
                return null;
              })()}

              {/* Campo de quantidade */}
              <Text style={styles.label}>Quantidade *</Text>
              <View style={styles.quantidadeContainer}>
                <TouchableOpacity
                  style={styles.quantidadeBotao}
                  onPress={() => {
                    const atual = parseInt(quantidade) || 0;
                    if (atual > 0) setQuantidade((atual - 1).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TextInput
                  style={styles.quantidadeInput}
                  placeholder="0"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.quantidadeBotao}
                  onPress={() => {
                    const atual = parseInt(quantidade) || 0;
                    setQuantidade((atual + 1).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color="#2196F3" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Botões do modal */}
            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={fecharModal}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botao, styles.botaoSalvar]}
                onPress={registrarVenda}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.botaoSalvarGradient}
                >
                  <Text style={styles.textoBotaoSalvar}>Registrar Venda</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerStats: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerStatsGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerStatsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  lista: {
    padding: 16,
    paddingTop: 0,
  },
  cardVenda: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vendaIconContainer: {
    marginRight: 16,
  },
  vendaIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendaContent: {
    flex: 1,
  },
  vendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nomeProdutoVenda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  quantidadeVenda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  vendaDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  vendaDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataVenda: {
    fontSize: 12,
    color: '#999',
  },
  idVenda: {
    fontSize: 12,
    color: '#999',
  },
  vazio: {
    padding: 48,
    alignItems: 'center',
  },
  textoVazio: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  textoVazioSecundario: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  botaoAdicionar: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botaoAdicionarGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    maxHeight: 500,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  seletorProduto: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  opcaoProduto: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  opcaoProdutoSelecionada: {
    backgroundColor: '#E3F2FD',
  },
  opcaoProdutoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  opcaoProdutoInfo: {
    flex: 1,
  },
  textoOpcaoProduto: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  textoOpcaoProdutoSelecionada: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  textoEstoqueOpcao: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  textoEstoqueOpcaoSelecionada: {
    color: '#1976D2',
  },
  infoProduto: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  infoProdutoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoInfoProduto: {
    fontSize: 14,
    color: '#1976D2',
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  quantidadeBotao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantidadeInput: {
    width: 100,
    height: 44,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  botoesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  botao: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  botaoCancelar: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textoBotaoCancelar: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 14,
  },
  botaoSalvar: {
    overflow: 'hidden',
  },
  botaoSalvarGradient: {
    padding: 14,
    alignItems: 'center',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
