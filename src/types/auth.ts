export type UserRole = 'admin' | 'doctor' | 'patient';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string;
}

export interface Doctor extends BaseUser {
  role: 'doctor';
  specialty: string;
}

export interface Patient extends BaseUser {
  role: 'patient';
}

export interface Admin extends BaseUser {
  role: 'admin';
}

export type User = Admin | Doctor | Patient;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
} 