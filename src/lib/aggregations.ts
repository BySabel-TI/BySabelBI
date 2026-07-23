// Funções puras de agregação dos dados de vendas da Microwork.
//
// Centraliza a lógica que antes estava duplicada em sales-service.ts e nas
// páginas de detalhe (filiais/[id], vendedores/[sellerName]). Ter uma única
// fonte da verdade evita que as regras (piso zero, mapeamento de filial, nome
// de exibição) divirjam entre telas.

import { parseISO, isValid, format } from "date-fns";
import {
  MicroworkSaleItem,
  SellerRanking,
  BranchSummary,
  DailyPoint,
  ModelRanking,
} from "@/lib/types-microwork";
import {
  getBranchBySeller,
  normalizeBranchName,
  ID_TO_NORMALIZED_NAME,
} from "@/lib/seller-map";

/** Regra "piso zero": nunca exibe valores negativos (devoluções > vendas). */
export const floorZero = (n: number): number => (n < 0 ? 0 : n);

/**
 * Nome de exibição canônico do vendedor.
 * Junta variações "NOME_" e "NOME-1" numa pessoa só e normaliza espaços.
 * Esta é a ÚNICA forma correta de exibir vendedor no sistema.
 */
export function cleanSellerName(rawName: string | null | undefined): string {
  if (!rawName) return "";
  return rawName
    .trim()
    .toUpperCase()
    .replace(/_+$/, "") // remove underline no final
    .replace(/-[0-9]+$/, "") // remove -1 no final
    .replace(/\s+/g, " "); // colapsa espaços extras
}

/**
 * Descobre a filial de uma linha priorizando o mapeamento do vendedor e
 * caindo para o pátio. Usado no ranking de vendedores.
 */
export function resolveSellerBranch(item: MicroworkSaleItem): string {
  const mappedBranch = getBranchBySeller(item.vendedor || "");
  const rawPatio = item.patio || "Indefinido";
  return normalizeBranchName(mappedBranch || rawPatio);
}

/**
 * Regra de negócio global: remove "Remessa Entrega Futura" para evitar
 * contagem duplicada (já existe a "Venda Entrega Futura").
 */
export function filterBusinessRules(items: MicroworkSaleItem[]): MicroworkSaleItem[] {
  return items.filter((item) => {
    const tipo = item.tipomovimento?.toUpperCase() || "";
    return !tipo.includes("REMESSA ENTREGA FUTURA");
  });
}

/**
 * Filtra as vendas de um único vendedor (usado no self-view do cargo Vendedor).
 * Casa pelo nome canônico (junta variações "NOME_" / "NOME-1").
 */
export function filterBySeller(
  items: MicroworkSaleItem[],
  sellerName: string
): MicroworkSaleItem[] {
  const target = cleanSellerName(sellerName);
  if (!target) return items;
  return items.filter((item) => cleanSellerName(item.vendedor) === target);
}

/**
 * Filtra as linhas para as filiais selecionadas (quando não é "todas").
 * Ignora linhas que caem em "Indefinido" (CD, avaria, etc.).
 */
export function filterByBranchIds(
  items: MicroworkSaleItem[],
  branchIds: number[]
): MicroworkSaleItem[] {
  if (!(branchIds.length > 0 && branchIds.length < 20)) return items;

  const targetNames = branchIds.map((id) => ID_TO_NORMALIZED_NAME[id]);
  return items.filter((item) => {
    const normalizedRowName = resolveSellerBranch(item);
    if (normalizedRowName === "Indefinido") return false;
    return targetNames.includes(normalizedRowName);
  });
}

/** Ranking de vendedores (piso zero, ordenado por qtd e depois faturamento). */
export function aggregateBySeller(items: MicroworkSaleItem[]): SellerRanking[] {
  const bySeller = items.reduce((acc, item) => {
    const displayName = cleanSellerName(item.vendedor) || "DESCONHECIDO";
    const filialReal = resolveSellerBranch(item);

    if (!acc[displayName]) {
      acc[displayName] = { name: displayName, filial: filialReal, total: 0, qtd: 0 };
    }
    acc[displayName].total += item.valorvenda || 0;
    acc[displayName].qtd += item.quantidade || 0;
    return acc;
  }, {} as Record<string, SellerRanking>);

  return Object.values(bySeller)
    .map((v) => ({ ...v, qtd: floorZero(v.qtd), total: floorZero(v.total) }))
    .sort((a, b) => (b.qtd === a.qtd ? b.total - a.total : b.qtd - a.qtd));
}

/** Evolução diária (piso zero, ordenado por dia). */
export function aggregateByDay(items: MicroworkSaleItem[]): DailyPoint[] {
  const byDate = items.reduce((acc, item) => {
    if (!item.datamovimentacao) return acc;
    const dateObj = parseISO(item.datamovimentacao);
    if (!isValid(dateObj)) return acc;

    const day = format(dateObj, "dd");
    if (!acc[day]) acc[day] = { day, vendas: 0, valor: 0 };
    acc[day].vendas += item.quantidade || 0;
    acc[day].valor += item.valorvenda || 0;
    return acc;
  }, {} as Record<string, DailyPoint>);

  return Object.values(byDate)
    .map((d) => ({ ...d, vendas: floorZero(d.vendas), valor: floorZero(d.valor) }))
    .sort((a, b) => parseInt(a.day) - parseInt(b.day));
}

const BRANCH_COLORS = [
  "#DC2626", "#3F3F46", "#B91C1C", "#52525B",
  "#991B1B", "#71717A", "#7F1D1D", "#27272A",
];

/** Faturamento por filial (piso zero, cores atribuídas, sem "Indefinido"). */
export function aggregateByBranch(items: MicroworkSaleItem[]): BranchSummary[] {
  const byBranch = items.reduce((acc, item) => {
    const rawName = item.vendedor || "";
    let mappedBranch = getBranchBySeller(rawName);

    // Se não achou mapeamento, verifica se o próprio nome do vendedor é uma
    // filial (ex.: o campo vendedor contém "Aldeota").
    if (!mappedBranch && rawName) {
      const possibleBranch = normalizeBranchName(rawName);
      if (possibleBranch !== "Indefinido" && possibleBranch !== "Outros") {
        mappedBranch = possibleBranch;
      }
    }

    const rawPatio = item.patio || "Outros";
    const branchName = normalizeBranchName(mappedBranch || rawPatio);

    if (!acc[branchName]) acc[branchName] = { name: branchName, value: 0, qtd: 0 };
    acc[branchName].value += item.valorvenda || 0;
    acc[branchName].qtd += item.quantidade || 0;
    return acc;
  }, {} as Record<string, BranchSummary>);

  return Object.values(byBranch)
    .filter((item) => item.name !== "Indefinido")
    .map((item) => ({ ...item, value: floorZero(item.value), qtd: floorZero(item.qtd) }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, color: BRANCH_COLORS[index % BRANCH_COLORS.length] }));
}

/** Ranking de modelos (piso zero, ordenado por faturamento). */
export function aggregateByModel(items: MicroworkSaleItem[]): ModelRanking[] {
  const byModel = items.reduce((acc, item) => {
    const modelName = (item.modelo || "Modelo Indefinido").trim();
    if (!acc[modelName]) acc[modelName] = { name: modelName, qtd: 0, valor: 0 };
    acc[modelName].qtd += item.quantidade || 0;
    acc[modelName].valor += item.valorvenda || 0;
    return acc;
  }, {} as Record<string, ModelRanking>);

  return Object.values(byModel)
    .map((m) => ({ ...m, qtd: floorZero(m.qtd), valor: floorZero(m.valor) }))
    .sort((a, b) => b.valor - a.valor);
}
