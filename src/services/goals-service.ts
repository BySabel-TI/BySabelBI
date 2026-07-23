import { supabase } from "@/lib/supabase";
import { startOfMonth, format, endOfMonth } from "date-fns";

export interface SalesGoal {
  id?: string;
  seller_name: string;
  branch_id: string;
  month: string; // YYYY-MM-DD
  target_amount: number;
  target_units: number;
}

/**
 * Busca as metas de um mês específico.
 * Se branchId for informado, filtra por filial.
 */
export async function fetchGoals(monthDate: Date, branchId?: string) {
  // Padroniza para o dia 01 do mês
  const firstDay = format(startOfMonth(monthDate), "yyyy-MM-dd");

  let query = supabase
    .from("sales_goals")
    .select("*")
    .eq("month", firstDay);

  // Filtro opcional por filial (ex: "01 - Ananindeua")
  if (branchId && branchId !== "all") {
    query = query.eq("branch_id", branchId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar metas:", error);
    return [];
  }

  return data as SalesGoal[];
}

/**
 * Insere ou Atualiza (Upsert) uma meta.
 * A chave única no banco é (seller_name, month).
 */
export async function upsertGoal(goal: SalesGoal) {
  // Garante formato correto de data
  const formattedGoal = {
    ...goal,
    month: format(startOfMonth(new Date(goal.month)), "yyyy-MM-dd")
  };

  const { data, error } = await supabase
    .from("sales_goals")
    .upsert(formattedGoal, { onConflict: "seller_name, month" })
    .select();

  if (error) {
    throw new Error(`Erro ao salvar meta: ${error.message}`);
  }

  return data;
}

/**
 * Calcula a meta total da loja somando as metas dos vendedores.
 */
export async function getStoreGoal(branchId: string, monthDate: Date) {
   const goals = await fetchGoals(monthDate, branchId);

   return goals.reduce((acc, curr) => ({
      target_amount: acc.target_amount + (curr.target_amount || 0),
      target_units: acc.target_units + (curr.target_units || 0)
   }), { target_amount: 0, target_units: 0 });
}

export interface StoreGoalTotals {
  target_amount: number;
  target_units: number;
}

/**
 * Busca TODAS as metas do mês numa única query e agrupa por filial (branch_id),
 * somando as metas dos vendedores de cada loja.
 *
 * Substitui o padrão N+1 (uma query por filial via getStoreGoal) por uma
 * chamada só — usado na tabela de Análise Comercial que lista ~24 lojas.
 */
export async function getStoreGoalsMap(
  monthDate: Date
): Promise<Record<string, StoreGoalTotals>> {
  const goals = await fetchGoals(monthDate); // sem filtro = todas as filiais

  return goals.reduce((acc, curr) => {
    const key = curr.branch_id;
    if (!acc[key]) acc[key] = { target_amount: 0, target_units: 0 };
    acc[key].target_amount += curr.target_amount || 0;
    acc[key].target_units += curr.target_units || 0;
    return acc;
  }, {} as Record<string, StoreGoalTotals>);
}
