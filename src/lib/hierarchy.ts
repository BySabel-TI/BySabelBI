export interface HierarchyNode {
  name: string;
  role: 'Director' | 'Manager' | 'Store';
  children: HierarchyNode[];
  branchId?: number; // Só para lojas
}

// Estrutura Inicial baseada em placeholder (Usuário deve editar depois)
export const SALES_HIERARCHY: HierarchyNode[] = [
  {
    name: "Diretoria Comercial",
    role: "Director",
    children: [
      {
        name: "Gerência Regional 1",
        role: "Manager",
        children: [
          { name: "01 - Ananindeua", role: "Store", children: [], branchId: 1 },
          { name: "02 - Belém", role: "Store", children: [], branchId: 2 },
          { name: "03 - Icoaraci", role: "Store", children: [], branchId: 3 },
           { name: "04 - Castanhal", role: "Store", children: [], branchId: 4 },
        ]
      },
      {
        name: "Gerência Regional 2",
        role: "Manager",
        children: [
          { name: "05 - Barcarena", role: "Store", children: [], branchId: 5 },
          { name: "06 - Soure", role: "Store", children: [], branchId: 6 },
        ]
      },
      {
        name: "Outros / Sem Gerência Definida",
        role: "Manager",
        children: [
           // As demais lojas serão mapeadas dinamicamente se não estiverem aqui
        ]
      }
    ]
  }
];

// Helper para encontrar onde uma loja se encaixa, se quisermos fazer dynamicamente
// Mas por enquanto vamos deixar fixo para demonstrar a estrutura.
