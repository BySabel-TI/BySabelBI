import {
  MicroworkSaleItem,
  DashboardData,
  MonthlyComparisonPoint,
} from "@/lib/types-microwork";
import {
  format,
  parseISO,
  isValid,
  getYear,
  getMonth,
  startOfYear,
  subYears,
  subMonths,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  filterBusinessRules,
  filterByBranchIds,
  filterBySeller,
  aggregateBySeller,
  aggregateByDay,
  aggregateByBranch,
  aggregateByModel,
} from "@/lib/aggregations";

/** Erro tipado para o consumidor (páginas) distinguir falha de API de "sem dados". */
export class SalesApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "SalesApiError";
    this.status = status;
  }
}

// === CACHE COMPARTILHADO ENTRE PÁGINAS ===
interface RawCacheEntry {
  data: MicroworkSaleItem[];
  timestamp: number;
}
const rawCache = new Map<string, RawCacheEntry>();
const RAW_CACHE_TTL = 1000 * 60 * 5; // 5 minutos
const inFlight = new Map<string, Promise<MicroworkSaleItem[]>>();

let lastFetchTimestamp: Date | null = null;

export function getLastFetchTimestamp(): Date | null {
  return lastFetchTimestamp;
}

async function fetchRawSales(startDate: Date, endDate: Date, forceRefresh = false): Promise<MicroworkSaleItem[]> {
  const dataInicio = format(startDate, "yyyy-MM-dd HH:mm");
  const dataFim = format(endDate, "yyyy-MM-dd HH:mm");
  const key = `${dataInicio}|${dataFim}`;
  const now = Date.now();

  if (!forceRefresh) {
    const cached = rawCache.get(key);
    if (cached && now - cached.timestamp < RAW_CACHE_TTL) {
      return cached.data;
    }
  }

  const pending = inFlight.get(key);
  if (pending && !forceRefresh) return pending;

  const request = (async () => {
    let response: Response;
    try {
      response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataInicio, dataFim, empresas: "all", forceRefresh }),
      });
    } catch {
      throw new SalesApiError("Falha de conexão ao buscar vendas. Verifique sua internet.");
    }

    if (!response.ok) {
      throw new SalesApiError(`Erro ao buscar vendas (HTTP ${response.status}).`, response.status);
    }

    const raw = await response.json();
    const safe: MicroworkSaleItem[] = Array.isArray(raw) ? raw : [];
    rawCache.set(key, { data: safe, timestamp: now });
    lastFetchTimestamp = new Date();
    return safe;
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

/** Limpa o cache de vendas (usado por botões de "atualizar" para forçar re-fetch). */
export function clearSalesCache(): void {
  rawCache.clear();
}

/**
 * Busca e processa os dados de vendas do período/filiais informados.
 * `sellerName` opcional restringe aos dados de um único vendedor (self-view).
 * Lança SalesApiError em caso de falha de rede/API.
 */
export async function fetchSalesData(
  startDate: Date,
  endDate: Date,
  branchIds: number[],
  sellerName?: string | null,
  forceRefresh = false
): Promise<DashboardData> {
  const prevStart = subMonths(startDate, 1);
  const prevEnd = subMonths(endDate, 1);

  const [rawData, prevRawData] = await Promise.all([
    fetchRawSales(startDate, endDate, forceRefresh),
    fetchRawSales(prevStart, prevEnd, forceRefresh).catch(() => [] as MicroworkSaleItem[]),
  ]);

  // Período Atual
  let safeData = filterBusinessRules(rawData);
  safeData = filterByBranchIds(safeData, branchIds);
  if (sellerName) {
    safeData = filterBySeller(safeData, sellerName);
  }

  const rankingVendedores = aggregateBySeller(safeData);
  const graficoDiario = aggregateByDay(safeData);
  const graficoPizza = aggregateByBranch(safeData);
  const rankingModelos = aggregateByModel(safeData);

  const totalFaturamento = graficoPizza.reduce((acc, v) => acc + v.value, 0);
  const totalVendas = graficoPizza.reduce((acc, v) => acc + v.qtd, 0);
  const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;

  // Período Anterior (para cálculo de deltas MoM)
  let safePrevData = filterBusinessRules(prevRawData);
  safePrevData = filterByBranchIds(safePrevData, branchIds);
  if (sellerName) {
    safePrevData = filterBySeller(safePrevData, sellerName);
  }
  const prevGraficoPizza = aggregateByBranch(safePrevData);
  const prevTotalFat = prevGraficoPizza.reduce((acc, v) => acc + v.value, 0);
  const prevTotalVendas = prevGraficoPizza.reduce((acc, v) => acc + v.qtd, 0);
  const prevTicketMedio = prevTotalVendas > 0 ? prevTotalFat / prevTotalVendas : 0;

  const deltaFaturamento = prevTotalFat > 0 ? ((totalFaturamento - prevTotalFat) / prevTotalFat) * 100 : undefined;
  const deltaVendas = prevTotalVendas > 0 ? ((totalVendas - prevTotalVendas) / prevTotalVendas) * 100 : undefined;
  const deltaTicketMedio = prevTicketMedio > 0 ? ((ticketMedio - prevTicketMedio) / prevTicketMedio) * 100 : undefined;

  return {
    kpis: {
      totalFaturamento,
      totalVendas,
      ticketMedio,
      deltaFaturamento,
      deltaVendas,
      deltaTicketMedio,
    },
    rankingVendedores,
    graficoDiario,
    graficoPizza,
    rankingModelos,
    rawData: safeData,
  };
}

/**
 * Compara a quantidade de vendas mês a mês entre o ano atual e o anterior.
 */
export async function fetchYearlyComparison(
  branchIds: number[]
): Promise<MonthlyComparisonPoint[]> {
  const today = new Date();
  const currentYear = getYear(today);
  const previousYear = currentYear - 1;

  const startPrev = startOfYear(subYears(today, 1));
  const endPrev = endOfDay(new Date(previousYear, 11, 31));
  const startCurr = startOfYear(today);
  const endCurr = endOfDay(today);

  const [dataAnoAnterior, dataAnoAtual] = await Promise.all([
    fetchRawSales(startPrev, endPrev).catch(() => [] as MicroworkSaleItem[]),
    fetchRawSales(startCurr, endCurr).catch(() => [] as MicroworkSaleItem[]),
  ]);

  let safeData = filterBusinessRules([...dataAnoAnterior, ...dataAnoAtual]);
  safeData = filterByBranchIds(safeData, branchIds);

  const comparisonMap: Record<number, MonthlyComparisonPoint> = {};
  for (let i = 0; i < 12; i++) {
    comparisonMap[i] = {
      monthIndex: i,
      monthName: format(new Date(currentYear, i, 1), "MMM", { locale: ptBR }),
      anoAtual: 0,
      anoAnterior: 0,
      yearCurrent: currentYear,
      yearPrev: previousYear,
    };
  }

  safeData.forEach((item) => {
    if (!item.datamovimentacao) return;
    const dateObj = parseISO(item.datamovimentacao);
    if (!isValid(dateObj)) return;

    const itemYear = getYear(dateObj);
    const itemMonth = getMonth(dateObj);

    if (itemYear === currentYear) {
      comparisonMap[itemMonth].anoAtual += item.quantidade || 0;
    } else if (itemYear === previousYear) {
      comparisonMap[itemMonth].anoAnterior += item.quantidade || 0;
    }
  });

  return Object.values(comparisonMap).map((m) => ({
    ...m,
    anoAtual: m.anoAtual < 0 ? 0 : m.anoAtual,
    anoAnterior: m.anoAnterior < 0 ? 0 : m.anoAnterior,
  }));
}
