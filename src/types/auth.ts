// define os tipos de papéis do usuário
export type UserRole = 'admin' | 'doctor' | 'patient';

// interface base para todos os usuários com propriedades em comum
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string;
}

// interface para o médico, adiciona a especialidade
export interface Doctor extends BaseUser {
  role: 'doctor';
  specialty: string;
}

// interface para o paciente, herda as propriedades do BaseUser
export interface Patient extends BaseUser {
  role: 'patient';
}

// interface para o administrador, herda as propriedades do BaseUser
export interface Admin extends BaseUser {
  role: 'admin';
}

// tipo que pode ser um dos papéis de usuário
export type User = Admin | Doctor | Patient;

// interface para os dados de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// interface para os dados de registro
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// interface para a resposta da autenticação, inclui o usuário e o token
export interface AuthResponse {
  user: User;
  token: string;
}

// interface para os dados do contexto de autenticação
export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}