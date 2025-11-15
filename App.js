import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importando as telas
import DashboardScreen from './src/screens/DashboardScreen';
import EstoqueScreen from './src/screens/EstoqueScreen';
import VendasScreen from './src/screens/VendasScreen';

// Criando o navegador de abas
const Tab = createBottomTabNavigator();

// Componente principal do app
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {/* Navegação por abas na parte inferior com ícones */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: '#2196F3',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            // Define qual ícone usar para cada aba
            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Estoque') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Vendas') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* Primeira aba - Dashboard */}
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Início',
            title: 'Dashboard',
          }}
        />
        
        {/* Segunda aba - Estoque */}
        <Tab.Screen 
          name="Estoque" 
          component={EstoqueScreen}
          options={{
            tabBarLabel: 'Estoque',
            title: 'Controle de Estoque',
          }}
        />
        
        {/* Terceira aba - Vendas */}
        <Tab.Screen 
          name="Vendas" 
          component={VendasScreen}
          options={{
            tabBarLabel: 'Vendas',
            title: 'Registro de Vendas',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

