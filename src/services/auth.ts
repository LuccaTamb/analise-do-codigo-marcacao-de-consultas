import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';


// chaves para o AsyncStorage
const STORAGE_KEYS = {
   USER: '@MedicalApp:user',
   TOKEN: '@MedicalApp:token',
   REGISTERED_USERS: '@MedicalApp:registeredUsers',
};


// dados mockados de médicos para simular um backend
const mockDoctors = [
   {
     id: '1',
     name: 'Dr. João Silva',
     email: 'joao@example.com',
     role: 'doctor' as const,
     specialty: 'Cardiologia',
     image: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
   },
   {
     id: '2',
     name: 'Dra. Maria Santos',
     email: 'maria@example.com',
     role: 'doctor' as const,
     specialty: 'Pediatria',
     image: 'https://cdn-icons-png.flaticon.com/512/3774/3774304.png',
   },
   {
     id: '3',
     name: 'Dr. Pedro Oliveira',
     email: 'pedro@example.com',
     role: 'doctor' as const,
     specialty: 'Ortopedia',
     image: 'https://cdn-icons-png.flaticon.com/512/3774/3774300.png',
   },
];


// dados mockados para o administrador
const mockAdmin = {
   id: 'admin',
   name: 'Administrador',
   email: 'admin@example.com',
   role: 'admin' as const,
   image: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
};


// array para armazenar os usuários registrados
let registeredUsers: (User & { password: string })[] = [];

export const authService = {
   // simula o login de um usuário
   async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
     
     // verifica se é o administrador
     if (credentials.email === mockAdmin.email && credentials.password === '123456') {
        return {
          user: mockAdmin,
          token: 'admin-token',
        };
     }

     
     // verifica se é um dos médicos
     const doctor = mockDoctors.find(
        (d) => d.email === credentials.email && credentials.password === '123456'
     );
     if (doctor) {
        return {
          user: doctor,
          token: `doctor-token-${doctor.id}`,
        };
     }

     
     // verifica se é um paciente registrado
     const patient = registeredUsers.find(
        (p) => p.email === credentials.email
     );
     if (patient) {
    
        if (credentials.password === patient.password) {
          
          const { password, ...patientWithoutPassword } = patient;
          return {
             user: patientWithoutPassword,
             token: `patient-token-${patient.id}`,
          };
        }
     }

     // caso nenhum usuário seja encontrado, lança um erro
     throw new Error('Email ou senha inválidos');
   },

   // simula o registro de um novo paciente
   async register(data: RegisterData): Promise<AuthResponse> {
     
     // verifica se o email já está em uso
     if (
        mockDoctors.some((d) => d.email === data.email) ||
        mockAdmin.email === data.email ||
        registeredUsers.some((u) => u.email === data.email)
     ) {
        throw new Error('Email já está em uso');
     }

     
     // cria um novo paciente com as informações fornecidas
     const newPatient: User & { password: string } = {
        id: `patient-${registeredUsers.length + 1}`,
        name: data.name,
        email: data.email,
        role: 'patient' as const,
        image: `https://cdn-icons-png.flaticon.com/512/3774/377429${
          registeredUsers.length + 1
        }.png`,
        password: data.password,
     };

     // adiciona o novo paciente à lista e salva no AsyncStorage
     registeredUsers.push(newPatient);

     
     await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));

     
     // retorna a resposta de autenticação sem a senha
     const { password, ...patientWithoutPassword } = newPatient;
     return {
        user: patientWithoutPassword,
        token: `patient-token-${newPatient.id}`,
     };
   },

   // simula o logout, removendo os dados do armazenamento
   async signOut(): Promise<void> {
     
     await AsyncStorage.removeItem(STORAGE_KEYS.USER);
     await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
   },

   // obtém o usuário armazenado localmente
   async getStoredUser(): Promise<User | null> {
     try {
        const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (userJson) {
          return JSON.parse(userJson);
        }
        return null;
     } catch (error) {
        console.error('Erro ao obter usuário armazenado:', error);
        return null;
     }
   },

   // métodos para obter listas de usuários
   async getAllUsers(): Promise<User[]> {
     return [...mockDoctors, ...registeredUsers];
   },

   async getAllDoctors(): Promise<User[]> {
     return mockDoctors;
   },

   async getPatients(): Promise<User[]> {
     return registeredUsers;
   },

   // carrega os usuários registrados do armazenamento local
   async loadRegisteredUsers(): Promise<void> {
     try {
        const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
        if (usersJson) {
          registeredUsers = JSON.parse(usersJson);
        }
     } catch (error) {
        console.error('Erro ao carregar usuários registrados:', error);
     }
   },
};