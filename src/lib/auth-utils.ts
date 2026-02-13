import { UserRole } from "@/types/auth";

export function getUserRoleLabel(role: UserRole | string | undefined): string {
  if (!role) return "Convidado";
  
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'director':
      return 'Diretoria';
    case 'manager':
      return 'Gerente';
    case 'seller':
      return 'Vendedor';
    case 'user':
      return 'Usuário';
    default:
      return 'Convidado';
  }
}
