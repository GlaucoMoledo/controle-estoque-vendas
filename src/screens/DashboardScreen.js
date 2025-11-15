import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import repositorio from '../data/Repositorio';

const { width } = Dimensions.get('window');

/**
 * Tela de Dashboard
 * Mostra um resumo geral com design moderno: total de produtos, vendas, e produtos que precisam repor
 */
export default function DashboardScreen({ navigation }) {
  // Estado para guardar os dados do dashboard
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [produtosAbaixoMinimo, setProdutosAbaixoMinimo] = useState([]);
  const [carregando, setCarregando] = useState(false);

  /**
   * Função para carregar os dados do dashboard
   */
  const carregarDados = () => {
    setCarregando(true);
    
    // Busca o total de produtos
    const total = repositorio.obterTotalProdutos();
    setTotalProdutos(total);
    
    // Busca o total de vendas
    const vendas = repositorio.obterTotalVendas();
    setTotalVendas(vendas);
    
    // Busca produtos que estão abaixo do estoque mínimo
    const abaixoMinimo = repositorio.obterProdutosAbaixoMinimo();
    setProdutosAbaixoMinimo(abaixoMinimo);
    
    setCarregando(false);
  };

  /**
   * useFocusEffect executa sempre que a tela recebe foco
   */
  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  /**
   * Renderiza a tela
   */
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={carregando} 
          onRefresh={carregarDados}
          colors={['#2196F3']}
        />
      }
    >
      {/* Card de Boas-vindas com Gradiente */}
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.headerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Bem-vindo!</Text>
            <Text style={styles.headerSubtitle}>Controle de Estoque do seu negócio</Text>
          </View>
          <Ionicons name="cube" size={40} color="#fff" />
        </View>
      </LinearGradient>

      {/* Cards de Estatísticas */}
      <View style={styles.statsContainer}>
        {/* Card de Produtos */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Estoque')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.statCardGradient}
          >
            <Ionicons name="cube" size={32} color="#fff" />
            <Text style={styles.statValue}>{totalProdutos}</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Card de Vendas */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Vendas')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.statCardGradient}
          >
            <Ionicons name="receipt" size={32} color="#fff" />
            <Text style={styles.statValue}>{totalVendas}</Text>
            <Text style={styles.statLabel}>Vendas</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Seção de Alertas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={24} color="#F44336" />
          <Text style={styles.sectionTitle}>Alertas de Estoque</Text>
        </View>

        {produtosAbaixoMinimo.length === 0 ? (
          // Se não tem produtos abaixo do mínimo, mostra mensagem positiva
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.successText}>
              Tudo certo! Nenhum produto abaixo do estoque mínimo.
            </Text>
          </View>
        ) : (
          // Se tem produtos abaixo do mínimo, lista eles
          produtosAbaixoMinimo.map((produto) => (
            <TouchableOpacity
              key={produto.id}
              style={styles.alertCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Estoque')}
            >
              <View style={styles.alertIconContainer}>
                <Ionicons name="alert-circle" size={24} color="#F44336" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{produto.nome}</Text>
                <Text style={styles.alertSubtitle}>SKU: {produto.sku}</Text>
                <View style={styles.alertDetails}>
                  <View style={styles.alertDetailItem}>
                    <Text style={styles.alertDetailLabel}>Estoque:</Text>
                    <Text style={styles.alertDetailValue}>{produto.estoqueAtual}</Text>
                  </View>
                  <View style={styles.alertDetailItem}>
                    <Text style={styles.alertDetailLabel}>Mínimo:</Text>
                    <Text style={styles.alertDetailValue}>{produto.estoqueMinimo}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Estoque')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={32} color="#2196F3" />
            <Text style={styles.quickActionText}>Adicionar Produto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Vendas')}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={32} color="#FF9800" />
            <Text style={styles.quickActionText}>Nova Venda</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 40) / 2,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  alertCard: {
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
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alertDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  alertDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertDetailLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  alertDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});
