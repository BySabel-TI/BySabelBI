// Payload que enviamos para o Proxy (Request)
export interface MicroworkReportRequest {
  dataInicio: string;
  dataFim: string;
  empresas: number[];
}

// O formato REAL de uma linha de venda (Atualizado para a nova regra)
export interface MicroworkSaleItem {
  // --- Identificação ---
  empresa: string;        // ex: "FOR"
  patio: string | null;   // ex: "ICOARACI". Pode vir null.
  vendedor: string;       // ex: "BRENDA DE CASSIA..."
  
  // --- Datas ---
  datamovimentacao: string; // ISO Date: "2025-12-29T00:00:00"
  
  // --- Valores (Apenas valorvenda é permitido agora) ---
  valorvenda: number;     // O "Líquido da Empresa" definido
  
  // --- Quantitativos ---
  quantidade: number;     // ex: 1.0
  
  // --- Detalhes da Moto / Cliente (Opcionais para não quebrar se vier null) ---
  modelo?: string;        // ex: "SHI150..."
  cor?: string;
  anofabrmod?: string;    // ex: "2025/2026"
  tipovenda?: string;     // ex: "CDC"
  tipomovimento?: string; // ex: "VENDA", "REMESSA ENTREGA FUTURA"
  pessoa?: string;        // Nome do Cliente
  
  // Campos auxiliares de sistema
  id?: number | string;
}

// === TIPOS PROCESSADOS (saída das agregações do dashboard) ===

export interface SellerRanking {
  name: string;
  filial: string;
  total: number;
  qtd: number;
}

export interface BranchSummary {
  name: string;
  value: number;
  qtd: number;
  color?: string;
}

export interface DailyPoint {
  day: string;
  vendas: number;
  valor: number;
}

export interface ModelRanking {
  name: string;
  qtd: number;
  valor: number;
}

export interface DashboardKpis {
  totalFaturamento: number;
  totalVendas: number;
  ticketMedio: number;
  deltaFaturamento?: number; // % MoM vs mês anterior (ex: +12.5 ou -3.2)
  deltaVendas?: number;      // % MoM vs mês anterior
  deltaTicketMedio?: number; // % MoM vs mês anterior
}

export interface DashboardData {
  kpis: DashboardKpis;
  rankingVendedores: SellerRanking[];
  graficoDiario: DailyPoint[];
  graficoPizza: BranchSummary[];
  rankingModelos: ModelRanking[];
  rawData: MicroworkSaleItem[];
}

export interface MonthlyComparisonPoint {
  monthIndex: number;
  monthName: string;
  anoAtual: number;
  anoAnterior: number;
  yearCurrent: number;
  yearPrev: number;
}