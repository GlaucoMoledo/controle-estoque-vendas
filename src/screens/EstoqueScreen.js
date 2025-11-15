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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { BarCodeScanner } from 'expo-barcode-scanner';
import repositorio from '../data/Repositorio';

/**
 * Tela de Estoque
 * Lista todos os produtos, permite buscar, cadastrar novos produtos,
 * ver detalhes, tirar foto e ler código de barras
 */
export default function EstoqueScreen() {
  // Estado para guardar a lista de produtos
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  
  // Estados para o modal de cadastro
  const [modalCadastroVisivel, setModalCadastroVisivel] = useState(false);
  const [nomeProduto, setNomeProduto] = useState('');
  const [skuProduto, setSkuProduto] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [estoqueAtual, setEstoqueAtual] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [fotoProduto, setFotoProduto] = useState(null);

  // Estados para o modal de detalhes
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  // Estados para o scanner de código de barras
  const [scannerVisivel, setScannerVisivel] = useState(false);
  const [temPermissaoCamera, setTemPermissaoCamera] = useState(null);

  /**
   * Função para carregar a lista de produtos
   */
  const carregarProdutos = () => {
    const listaProdutos = repositorio.obterTodosProdutos();
    setProdutos(listaProdutos);
    setProdutosFiltrados(listaProdutos);
  };

  /**
   * Função para buscar produtos
   */
  const buscarProdutos = (texto) => {
    setBusca(texto);
    if (texto.trim() === '') {
      setProdutosFiltrados(produtos);
    } else {
      const resultados = repositorio.buscarProdutos(texto);
      setProdutosFiltrados(resultados);
    }
  };

  /**
   * useFocusEffect executa sempre que a tela recebe foco
   */
  useFocusEffect(
    React.useCallback(() => {
      carregarProdutos();
    }, [])
  );

  /**
   * Atualiza a lista filtrada quando a busca ou produtos mudam
   */
  React.useEffect(() => {
    if (busca.trim() === '') {
      setProdutosFiltrados(produtos);
    } else {
      const resultados = repositorio.buscarProdutos(busca);
      setProdutosFiltrados(resultados);
    }
  }, [busca, produtos]);

  /**
   * Função para solicitar permissão da câmera
   */
  const solicitarPermissaoCamera = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setTemPermissaoCamera(status === 'granted');
    return status === 'granted';
  };

  /**
   * Função para abrir o scanner de código de barras
   */
  const abrirScanner = async () => {
    const permissao = await solicitarPermissaoCamera();
    if (permissao) {
      setScannerVisivel(true);
    } else {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à câmera para ler código de barras.');
    }
  };

  /**
   * Função para processar código de barras escaneado
   */
  const handleBarCodeScanned = ({ type, data }) => {
    setScannerVisivel(false);
    setCodigoBarras(data);
    
    // Verifica se já existe um produto com esse código
    const produtoExistente = repositorio.obterProdutoPorCodigoBarras(data);
    if (produtoExistente) {
      Alert.alert('Código Já Cadastrado', `Este código já pertence ao produto: ${produtoExistente.nome}`);
    } else {
      Alert.alert('Código Escaneado', `Código: ${data}`);
    }
  };

  /**
   * Função para tirar foto do produto
   */
  const tirarFoto = async () => {
    // Solicita permissão da câmera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à câmera para tirar fotos.');
      return;
    }

    // Abre a câmera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotoProduto(result.assets[0].uri);
    }
  };

  /**
   * Função para selecionar foto da galeria
   */
  const selecionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFotoProduto(result.assets[0].uri);
    }
  };

  /**
   * Função para abrir o modal de cadastro
   */
  const abrirModalCadastro = () => {
    setModalCadastroVisivel(true);
  };

  /**
   * Função para fechar o modal de cadastro
   */
  const fecharModalCadastro = () => {
    setModalCadastroVisivel(false);
    // Limpa os campos
    setNomeProduto('');
    setSkuProduto('');
    setEstoqueMinimo('');
    setEstoqueAtual('');
    setCodigoBarras('');
    setFotoProduto(null);
  };

  /**
   * Função para salvar um novo produto
   */
  const salvarProduto = () => {
    // Validação básica
    if (!nomeProduto.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do produto');
      return;
    }

    if (!skuProduto.trim()) {
      Alert.alert('Erro', 'Por favor, informe o SKU do produto');
      return;
    }

    // Converte os números
    const minimo = parseInt(estoqueMinimo) || 0;
    const atual = parseInt(estoqueAtual) || 0;

    if (minimo < 0 || atual < 0) {
      Alert.alert('Erro', 'Os valores de estoque não podem ser negativos');
      return;
    }

    // Verifica se o código de barras já existe
    if (codigoBarras) {
      const produtoExistente = repositorio.obterProdutoPorCodigoBarras(codigoBarras);
      if (produtoExistente) {
        Alert.alert('Erro', 'Este código de barras já está cadastrado para outro produto');
        return;
      }
    }

    // Adiciona o produto no repositório
    repositorio.adicionarProduto(
      nomeProduto.trim(),
      skuProduto.trim().toUpperCase(),
      minimo,
      atual,
      codigoBarras || null,
      fotoProduto || null
    );

    // Atualiza a lista
    carregarProdutos();

    // Fecha o modal e mostra mensagem de sucesso
    fecharModalCadastro();
    Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
  };

  /**
   * Função para abrir modal de detalhes
   */
  const abrirDetalhes = (produto) => {
    setProdutoSelecionado(produto);
    setModalDetalhesVisivel(true);
  };

  /**
   * Função para renderizar cada item da lista de produtos
   */
  const renderizarProduto = ({ item }) => {
    const precisaRepor = item.precisaRepor();

    return (
      <TouchableOpacity
        style={[styles.cardProduto, precisaRepor && styles.cardProdutoAlerta]}
        onPress={() => abrirDetalhes(item)}
        activeOpacity={0.7}
      >
        {/* Foto do produto ou ícone padrão */}
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={styles.produtoImagem} />
        ) : (
          <View style={styles.produtoImagemPlaceholder}>
            <Ionicons name="cube" size={32} color="#999" />
          </View>
        )}

        <View style={styles.produtoInfo}>
          <View style={styles.produtoHeader}>
            <Text style={styles.nomeProduto} numberOfLines={1}>{item.nome}</Text>
            {precisaRepor && (
              <View style={styles.badgeAlerta}>
                <Ionicons name="warning" size={12} color="#fff" />
                <Text style={styles.textoBadge}>Baixo</Text>
              </View>
            )}
          </View>
          <Text style={styles.skuProduto}>SKU: {item.sku}</Text>
          {item.codigoBarras && (
            <Text style={styles.codigoBarras}>Código: {item.codigoBarras}</Text>
          )}
          <View style={styles.infoEstoque}>
            <View style={styles.estoqueItem}>
              <Ionicons name="cube-outline" size={16} color="#666" />
              <Text style={styles.textoInfo}>
                Estoque: <Text style={styles.valorInfo}>{item.estoqueAtual}</Text>
              </Text>
            </View>
            <View style={styles.estoqueItem}>
              <Ionicons name="alert-circle-outline" size={16} color="#666" />
              <Text style={styles.textoInfo}>
                Mín: <Text style={styles.valorInfo}>{item.estoqueMinimo}</Text>
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#999" />
      </TouchableOpacity>
    );
  };

  /**
   * Renderiza a tela
   */
  return (
    <View style={styles.container}>
      {/* Barra de Busca */}
      <View style={styles.buscaContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.buscaIcon} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar produtos..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={buscarProdutos}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => buscarProdutos('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={produtosFiltrados}
        renderItem={renderizarProduto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.textoVazio}>
              {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado ainda'}
            </Text>
            {!busca && (
              <Text style={styles.textoVazioSecundario}>
                Toque no botão + para adicionar um produto
              </Text>
            )}
          </View>
        }
      />

      {/* Botão de adicionar produto (flutuante) */}
      <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirModalCadastro}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Cadastro de Produto */}
      <Modal
        visible={modalCadastroVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={fecharModalCadastro}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Cadastrar Novo Produto</Text>
              <TouchableOpacity onPress={fecharModalCadastro}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Foto do produto */}
              <View style={styles.fotoContainer}>
                {fotoProduto ? (
                  <Image source={{ uri: fotoProduto }} style={styles.fotoPreview} />
                ) : (
                  <View style={styles.fotoPlaceholder}>
                    <Ionicons name="camera" size={48} color="#999" />
                    <Text style={styles.fotoPlaceholderText}>Sem foto</Text>
                  </View>
                )}
                <View style={styles.fotoBotoes}>
                  <TouchableOpacity style={styles.fotoBotao} onPress={tirarFoto}>
                    <Ionicons name="camera" size={20} color="#2196F3" />
                    <Text style={styles.fotoBotaoText}>Tirar Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.fotoBotao} onPress={selecionarFoto}>
                    <Ionicons name="image" size={20} color="#2196F3" />
                    <Text style={styles.fotoBotaoText}>Galeria</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campo de nome */}
              <Text style={styles.label}>Nome do Produto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Pneu Aro 15"
                value={nomeProduto}
                onChangeText={setNomeProduto}
              />

              {/* Campo de SKU */}
              <Text style={styles.label}>SKU *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: PN-001"
                value={skuProduto}
                onChangeText={setSkuProduto}
                autoCapitalize="characters"
              />

              {/* Campo de código de barras */}
              <Text style={styles.label}>Código de Barras</Text>
              <View style={styles.codigoBarrasContainer}>
                <TextInput
                  style={[styles.input, styles.codigoBarrasInput]}
                  placeholder="Ex: 7891234567890"
                  value={codigoBarras}
                  onChangeText={setCodigoBarras}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.scannerButton} onPress={abrirScanner}>
                  <Ionicons name="qr-code" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Campo de estoque mínimo */}
              <Text style={styles.label}>Estoque Mínimo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 5"
                value={estoqueMinimo}
                onChangeText={setEstoqueMinimo}
                keyboardType="numeric"
              />

              {/* Campo de estoque atual */}
              <Text style={styles.label}>Estoque Atual *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 10"
                value={estoqueAtual}
                onChangeText={setEstoqueAtual}
                keyboardType="numeric"
              />
            </ScrollView>

            {/* Botões do modal */}
            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={fecharModalCadastro}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botao, styles.botaoSalvar]}
                onPress={salvarProduto}
              >
                <Text style={styles.textoBotaoSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes do Produto */}
      <Modal
        visible={modalDetalhesVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalhesVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {produtoSelecionado && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>Detalhes do Produto</Text>
                  <TouchableOpacity onPress={() => setModalDetalhesVisivel(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  {/* Foto do produto */}
                  {produtoSelecionado.foto ? (
                    <Image source={{ uri: produtoSelecionado.foto }} style={styles.detalheFoto} />
                  ) : (
                    <View style={styles.detalheFotoPlaceholder}>
                      <Ionicons name="cube" size={64} color="#999" />
                    </View>
                  )}

                  {/* Informações do produto */}
                  <View style={styles.detalheInfo}>
                    <Text style={styles.detalheNome}>{produtoSelecionado.nome}</Text>
                    <Text style={styles.detalheSku}>SKU: {produtoSelecionado.sku}</Text>
                    
                    {produtoSelecionado.codigoBarras && (
                      <View style={styles.detalheItem}>
                        <Ionicons name="qr-code" size={20} color="#666" />
                        <Text style={styles.detalheItemText}>
                          Código: {produtoSelecionado.codigoBarras}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detalheItem}>
                      <Ionicons name="cube" size={20} color="#666" />
                      <Text style={styles.detalheItemText}>
                        Estoque Atual: <Text style={styles.detalheValor}>{produtoSelecionado.estoqueAtual}</Text>
                      </Text>
                    </View>

                    <View style={styles.detalheItem}>
                      <Ionicons name="alert-circle" size={20} color="#666" />
                      <Text style={styles.detalheItemText}>
                        Estoque Mínimo: <Text style={styles.detalheValor}>{produtoSelecionado.estoqueMinimo}</Text>
                      </Text>
                    </View>

                    {produtoSelecionado.precisaRepor() && (
                      <View style={styles.detalheAlerta}>
                        <Ionicons name="warning" size={20} color="#F44336" />
                        <Text style={styles.detalheAlertaText}>
                          Atenção: Este produto está abaixo do estoque mínimo!
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal do Scanner de Código de Barras */}
      <Modal
        visible={scannerVisivel}
        animationType="slide"
        onRequestClose={() => setScannerVisivel(false)}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitulo}>Escanear Código de Barras</Text>
            <TouchableOpacity onPress={() => setScannerVisivel(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {temPermissaoCamera === null ? (
            <View style={styles.scannerLoading}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.scannerLoadingText}>Solicitando permissão da câmera...</Text>
            </View>
          ) : temPermissaoCamera === false ? (
            <View style={styles.scannerLoading}>
              <Ionicons name="camera-off" size={64} color="#999" />
              <Text style={styles.scannerLoadingText}>Permissão da câmera negada</Text>
            </View>
          ) : (
            <BarCodeScanner
              onBarCodeScanned={scannerVisivel ? handleBarCodeScanned : undefined}
              style={styles.scanner}
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerFrame} />
                <Text style={styles.scannerInstrucao}>
                  Posicione o código de barras dentro do quadro
                </Text>
              </View>
            </BarCodeScanner>
          )}
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
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buscaIcon: {
    marginRight: 12,
  },
  buscaInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  lista: {
    padding: 16,
    paddingTop: 0,
  },
  cardProduto: {
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
  cardProdutoAlerta: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  produtoImagem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  produtoImagemPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badgeAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  textoBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  skuProduto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  codigoBarras: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  infoEstoque: {
    flexDirection: 'row',
    gap: 16,
  },
  estoqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoInfo: {
    fontSize: 14,
    color: '#666',
  },
  valorInfo: {
    fontWeight: 'bold',
    color: '#2196F3',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fotoPreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 12,
  },
  fotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fotoPlaceholderText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  fotoBotoes: {
    flexDirection: 'row',
    gap: 12,
  },
  fotoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  fotoBotaoText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  codigoBarrasContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  codigoBarrasInput: {
    flex: 1,
  },
  scannerButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
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
  },
  botaoSalvar: {
    backgroundColor: '#2196F3',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detalheFoto: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  detalheFotoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  detalheInfo: {
    gap: 16,
  },
  detalheNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detalheSku: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  detalheItemText: {
    fontSize: 16,
    color: '#666',
  },
  detalheValor: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  detalheAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  detalheAlertaText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
    flex: 1,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scannerTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  scannerInstrucao: {
    color: '#fff',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  scannerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scannerLoadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});
