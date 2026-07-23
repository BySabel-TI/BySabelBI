// Serviço de detecção de vendedores desconhecidos.
//
// Compara os nomes únicos de vendedores que vêm da API (dados de vendas)
// com os cadastrados na tabela `employees` do Supabase. Retorna quem
// aparece nas vendas mas não existe no cadastro.

import { MicroworkSaleItem } from "@/lib/types-microwork";
import { cleanSellerName, resolveSellerBranch } from "@/lib/aggregations";
import { parseISO, isValid } from "date-fns";
import { Employee, upsertEmployee } from "@/services/employees-service";

export interface UnknownSeller {
  /** Nome canônico (limpo via cleanSellerName). */
  name: string;
  /** Nome original tal como veio da API (para cadastro). */
  rawName: string;
  /** Filial inferida do mapeamento/pátio. */
  inferredBranch: string;
  /** ID numérico da filial inferida (null se não encontrado). */
  inferredBranchId: number | null;
  /** Quantidade total de vendas no período. */
  salesCount: number;
  /** Data da primeira venda no período. */
  firstSale: string;
  /** Data da última venda no período. */
  lastSale: string;
}

/**
 * Extrai os nomes de branch normalizados e tenta obter o ID numérico.
 * Ex: "03 - Icoaraci" → 3
 */
function extractBranchId(branchName: string): number | null {
  const match = branchName.match(/^(\d+)\s*-/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Descobre vendedores que aparecem nas vendas mas NÃO estão na tabela employees.
 *
 * @param salesData  Dados brutos da API Microwork (já filtrados por regra de negócio).
 * @param employees  Lista de funcionários cadastrados no banco.
 * @returns Lista de vendedores desconhecidos com métricas inferidas.
 */
export function discoverUnknownSellers(
  salesData: MicroworkSaleItem[],
  employees: Employee[]
): UnknownSeller[] {
  // Monta set de nomes conhecidos (canônicos).
  const knownNames = new Set(
    employees.map((e) => cleanSellerName(e.name))
  );

  // Agrupa as vendas por nome canônico.
  const sellerMap = new Map<
    string,
    {
      rawName: string;
      branch: string;
      branchId: number | null;
      count: number;
      firstDate: Date | null;
      lastDate: Date | null;
    }
  >();

  for (const item of salesData) {
    const canonical = cleanSellerName(item.vendedor);
    if (!canonical || canonical === "DESCONHECIDO") continue;

    // Pula nomes que parecem ser lojas/feirões (não vendedores reais).
    if (canonical.startsWith("LOJA DE ")) continue;

    // Já está cadastrado → ignora.
    if (knownNames.has(canonical)) continue;

    const existing = sellerMap.get(canonical);
    const itemDate = item.datamovimentacao ? parseISO(item.datamovimentacao) : null;
    const validDate = itemDate && isValid(itemDate) ? itemDate : null;

    if (!existing) {
      const branch = resolveSellerBranch(item);
      sellerMap.set(canonical, {
        rawName: (item.vendedor || "").trim().toUpperCase(),
        branch,
        branchId: extractBranchId(branch),
        count: item.quantidade || 0,
        firstDate: validDate,
        lastDate: validDate,
      });
    } else {
      existing.count += item.quantidade || 0;
      if (validDate) {
        if (!existing.firstDate || validDate < existing.firstDate) {
          existing.firstDate = validDate;
        }
        if (!existing.lastDate || validDate > existing.lastDate) {
          existing.lastDate = validDate;
        }
      }
    }
  }

  // Converte para array de retorno.
  const result: UnknownSeller[] = [];
  for (const [name, data] of sellerMap) {
    result.push({
      name,
      rawName: data.rawName,
      inferredBranch: data.branch,
      inferredBranchId: data.branchId,
      salesCount: Math.max(0, data.count),
      firstSale: data.firstDate ? data.firstDate.toISOString().slice(0, 10) : "—",
      lastSale: data.lastDate ? data.lastDate.toISOString().slice(0, 10) : "—",
    });
  }

  return result.sort((a, b) => b.salesCount - a.salesCount);
}

/**
 * Cadastra uma lista de vendedores desconhecidos na tabela `employees`
 * em lote (sequencialmente para respeitar RLS e evitar race conditions).
 *
 * @returns Quantidade de registros inseridos com sucesso.
 */
export async function bulkRegisterSellers(
  sellers: UnknownSeller[]
): Promise<number> {
  let count = 0;
  for (const seller of sellers) {
    await upsertEmployee({
      name: seller.rawName,
      display_name: null,
      branch_id: seller.inferredBranchId,
      active: true,
    });
    count++;
  }
  return count;
}
