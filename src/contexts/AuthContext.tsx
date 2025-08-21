import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';
import { User, LoginCredentials, RegisterData, AuthContextData } from '../types/auth';

// Define as chaves de armazenamento para o AsyncStorage.
const STORAGE_KEYS = {
  USER: '@MedicalApp:user',
  TOKEN: '@MedicalApp:token',
};

// Cria o contexto de autenticação.
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados para o usuário autenticado e o status de carregamento.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito que roda na montagem do componente para carregar dados do armazenamento.
  useEffect(() => {
    loadStoredUser();
    loadRegisteredUsers();
  }, []);

  // Carrega o usuário armazenado localmente.
  const loadStoredUser = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os usuários registrados do serviço para simulação de dados.
  const loadRegisteredUsers = async () => {
    try {
      await authService.loadRegisteredUsers();
    } catch (error) {
      console.error('Erro ao carregar usuários registrados:', error);
    }
  };

  // Função para fazer login.
  const signIn = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.signIn(credentials);
      setUser(response.user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    } catch (error) {
      // Propaga o erro para ser tratado pelo componente que chamou a função.
      throw error;
    }
  };

  // Função para registrar um novo usuário.
  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    } catch (error) {
      throw error;
    }
  };

  // Função para fazer logout.
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      // Remove o usuário e o token do armazenamento local.
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para atualizar os dados do usuário.
  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      // Atualiza o usuário no armazenamento local.
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  // Fornece o estado e as funções para os componentes filhos.
  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Garante que o hook seja usado dentro do AuthProvider.
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};