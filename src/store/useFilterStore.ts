import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { startOfMonth, endOfDay } from 'date-fns';
import { UserRole } from '@/types/auth';

interface FilterState {
  periodo: { from: Date; to: Date };
  filial: string;
  userRole: UserRole | null;
  allowedBranch: number | null; // ID da filial permitida (se manager)
  allowedSeller: string | null; // Nome no ERP (se seller) — self-view
  refreshKey: number; // Contador para forçar re-fetch em tempo real

  setPeriodo: (range: { from: Date; to: Date }) => void;
  setFilial: (id: string) => void;
  setUserAccess: (role: UserRole, branchId?: number, sellerName?: string) => void;
  triggerRefresh: () => void;
}

// Define o padrão: Dia 01 do mês atual até o momento presente
const getDefaultPeriodo = () => {
  const hoje = new Date();
  return { from: startOfMonth(hoje), to: endOfDay(hoje) };
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      periodo: getDefaultPeriodo(),
      filial: 'all', // Padrão
      userRole: null,
      allowedBranch: null,
      allowedSeller: null,
      refreshKey: 0,

      setPeriodo: (range) => set({ periodo: range }),

      setFilial: (id) => {
        const { userRole, allowedBranch } = get();

        // Vendedor vê só os próprios dados: não troca de filial.
        if (userRole === 'seller') return;

        // Gerente SÓ pode selecionar a própria filial.
        if (userRole === 'manager' && allowedBranch) {
          // A string do select vem como "1", "2" ou "all".
          if (id !== String(allowedBranch)) {
            return; // Ignora a tentativa de mudança
          }
        }
        set({ filial: id });
      },

      triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),

      setUserAccess: (role, branchId, sellerName) => {
        set((state) => {
          let newFilial = state.filial;
          // Gerente: trava na própria filial imediatamente.
          if (role === 'manager' && branchId) {
            newFilial = String(branchId);
          }
          // Vendedor: filtragem é por nome, filial fica "all".
          if (role === 'seller') {
            newFilial = 'all';
          }
          return {
            userRole: role,
            allowedBranch: branchId || null,
            allowedSeller: role === 'seller' ? sellerName || null : null,
            filial: newFilial,
          };
        });
      },
    }),
    {
      name: 'bysabel-filters',
      // Persiste apenas o que o usuário escolhe. Papel/filial-permitida vêm do
      // login (auth) a cada sessão e NÃO devem ser persistidos no navegador.
      partialize: (state) => ({ periodo: state.periodo, filial: state.filial }),
      // Datas viram string no JSON; reidratamos de volta para Date.
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if ((key === 'from' || key === 'to') && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        },
      }),
      // Segurança extra: se o período reidratado estiver inválido, cai no padrão.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FilterState>;
        const from = p.periodo?.from;
        const to = p.periodo?.to;
        const validPeriodo =
          from instanceof Date && !isNaN(from.getTime()) &&
          to instanceof Date && !isNaN(to.getTime());

        return {
          ...current,
          filial: p.filial ?? current.filial,
          periodo: validPeriodo ? p.periodo! : current.periodo,
        };
      },
    }
  )
);
