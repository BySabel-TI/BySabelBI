import { create } from 'zustand';
import { startOfMonth, endOfDay } from 'date-fns';
import { UserRole } from '@/types/auth';

interface FilterState {
  periodo: { from: Date; to: Date };
  filial: string;
  userRole: UserRole | null;
  allowedBranch: number | null; // ID da filial permitida (se manager)
  
  setPeriodo: (range: { from: Date; to: Date }) => void;
  setFilial: (id: string) => void;
  setUserAccess: (role: UserRole, branchId?: number) => void;
}

export const useFilterStore = create<FilterState>((set, get) => {
  // Define o padrão: Dia 01 do mês atual até o momento presente
  const hoje = new Date();
  const inicioDoMes = startOfMonth(hoje);
  const fimDeHoje = endOfDay(hoje);

  return {
    periodo: { 
      from: inicioDoMes, 
      to: fimDeHoje 
    },
    filial: 'all', // Padrão
    userRole: null,
    allowedBranch: null,
    
    setPeriodo: (range) => set({ periodo: range }),
    
    setFilial: (id) => {
      const { userRole, allowedBranch } = get();
      
      // Se for gerente, SÓ pode selecionar sua própria filial
      if (userRole === 'manager' && allowedBranch) {
        // Se tentar selecionar algo diferente, força a filial dele
        // Nota: A string do select vem como "1", "2" ou "all"
        if (id !== String(allowedBranch)) {
            return; // Ignora a tentativa de mudança
        }
      }
      set({ filial: id });
    },

    setUserAccess: (role, branchId) => {
      set((state) => {
          let newFilial = state.filial;
          // Se virar gerente, força a filial imediatamente
          if (role === 'manager' && branchId) {
              newFilial = String(branchId);
          }
          return { userRole: role, allowedBranch: branchId || null, filial: newFilial };
      });
    }
  };
});
