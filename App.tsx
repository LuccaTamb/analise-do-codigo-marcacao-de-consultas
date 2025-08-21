import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from 'styled-components/native';
import theme from './src/styles/theme';
import { StatusBar } from 'react-native';

/**
 * Ponto de entrada principal da aplicação.
 * @returns O componente raiz da aplicação.
 */
export default function App() {
  return (
    // Fornece o tema da aplicação para todos os componentes.
    <ThemeProvider theme={theme}>
      {/* Fornece o contexto de autenticação para toda a árvore de componentes. */}
      <AuthProvider>
        {/* Configura a barra de status da aplicação. */}
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={theme.colors.primary} 
        />
        {/* Renderiza o navegador principal da aplicação. */}
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}