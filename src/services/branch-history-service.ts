// Serviço de histórico de lotação por vendedor.
//
// Analisa os dados de venda de um vendedor ao longo do tempo e agrupa
// por filial, calculando primeira/última venda em cada uma. Isso gera
// uma timeline de lotação sem precisar de tabela extra no banco.

import { MicroworkSaleItem } from "@/lib/types-microwork";
import { cleanSellerName, resolveSellerBranch, floorZero } from "@/lib/aggregations";
import { parseISO, isValid, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface BranchStint {
  /** Nome normalizado da filial (ex: "03 - Icoaraci"). */
  branch: string;
  /** Data da primeira venda nesta filial. */
  firstSale: Date;
  /** Data da última venda nesta filial. */
  lastSale: Date;
  /** Primeira venda formatada para exibição. */
  firstSaleLabel: string;
  /** Última venda formatada para exibição. */
  lastSaleLabel: string;
  /** Total de vendas (quantidade) nesta filial. */
  totalSales: number;
  /** Faturamento total nesta filial. */
  totalRevenue: number;
  /** Se é a filial mais recente do vendedor. */
  isCurrent: boolean;
}

/**
 * Constrói o histórico de lotação de um vendedor a partir dos dados de venda.
 *
 * @param sellerName  Nome canônico do vendedor (via cleanSellerName).
 * @param salesData   Dados brutos de venda (todas as filiais/período amplo).
 * @returns Lista de "stints" (períodos em cada filial), ordenada cronologicamente.
 */
export function buildBranchHistory(
  sellerName: string,
  salesData: MicroworkSaleItem[]
): BranchStint[] {
  const target = cleanSellerName(sellerName);
  if (!target) return [];

  // Filtra vendas do vendedor.
  const sellerSales = salesData.filter(
    (item) => cleanSellerName(item.vendedor) === target
  );

  if (sellerSales.length === 0) return [];

  // Agrupa por filial.
  const branchMap = new Map<
    string,
    {
      firstSale: Date | null;
      lastSale: Date | null;
      totalSales: number;
      totalRevenue: number;
    }
  >();

  for (const item of sellerSales) {
    const branch = resolveSellerBranch(item);
    if (branch === "Indefinido") continue;

    const dateObj = item.datamovimentacao ? parseISO(item.datamovimentacao) : null;
    const validDate = dateObj && isValid(dateObj) ? dateObj : null;

    const existing = branchMap.get(branch);
    if (!existing) {
      branchMap.set(branch, {
        firstSale: validDate,
        lastSale: validDate,
        totalSales: item.quantidade || 0,
        totalRevenue: item.valorvenda || 0,
      });
    } else {
      existing.totalSales += item.quantidade || 0;
      existing.totalRevenue += item.valorvenda || 0;
      if (validDate) {
        if (!existing.firstSale || validDate < existing.firstSale) {
          existing.firstSale = validDate;
        }
        if (!existing.lastSale || validDate > existing.lastSale) {
          existing.lastSale = validDate;
        }
      }
    }
  }

  // Converte para array e ordena cronologicamente.
  const stints: BranchStint[] = [];
  let latestDate: Date | null = null;
  let latestBranch = "";

  for (const [branch, data] of branchMap) {
    if (!data.firstSale || !data.lastSale) continue;

    stints.push({
      branch,
      firstSale: data.firstSale,
      lastSale: data.lastSale,
      firstSaleLabel: format(data.firstSale, "dd MMM yyyy", { locale: ptBR }),
      lastSaleLabel: format(data.lastSale, "dd MMM yyyy", { locale: ptBR }),
      totalSales: floorZero(data.totalSales),
      totalRevenue: floorZero(data.totalRevenue),
      isCurrent: false, // Será definido abaixo.
    });

    if (!latestDate || data.lastSale > latestDate) {
      latestDate = data.lastSale;
      latestBranch = branch;
    }
  }

  // Marca a filial mais recente como "Atual".
  for (const stint of stints) {
    if (stint.branch === latestBranch) {
      stint.isCurrent = true;
    }
  }

  // Ordena por primeira venda (cronológico).
  stints.sort((a, b) => a.firstSale.getTime() - b.firstSale.getTime());

  return stints;
}
