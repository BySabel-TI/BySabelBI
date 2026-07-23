export type UserRole = 'admin' | 'director' | 'manager' | 'seller' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: number; // Filial que o gerente enxerga (role === 'manager')
  sellerName?: string; // Vínculo do vendedor com o nome no ERP (role === 'seller')
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
}
