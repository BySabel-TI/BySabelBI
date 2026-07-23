import { supabase } from "@/lib/supabase";
import { setDynamicSellerMap, getStaticSellerEntries } from "@/lib/seller-map";

export interface Employee {
  id?: string;
  name: string; // nome EXATO do vendedor no ERP (UPPER)
  display_name?: string | null;
  branch_id: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Lista todos os funcionários cadastrados (ordenados por nome). */
export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar funcionários:", error);
    throw new Error(error.message);
  }
  return (data as Employee[]) || [];
}

/** Cria ou atualiza um funcionário (conflito resolvido pelo nome). */
export async function upsertEmployee(emp: Employee): Promise<Employee> {
  const payload = {
    ...(emp.id ? { id: emp.id } : {}),
    name: emp.name.trim().toUpperCase(),
    display_name: emp.display_name?.trim() || null,
    branch_id: emp.branch_id,
    active: emp.active,
  };

  const { data, error } = await supabase
    .from("employees")
    .upsert(payload, { onConflict: "name" })
    .select()
    .single();

  if (error) throw new Error(`Erro ao salvar funcionário: ${error.message}`);
  return data as Employee;
}

/** Exclui um funcionário. */
export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw new Error(`Erro ao excluir funcionário: ${error.message}`);
}

/**
 * Carrega o vínculo vendedor→filial do banco e injeta no seller-map como
 * override dinâmico. Se falhar ou estiver vazio, o sistema segue usando o
 * SELLER_MAP estático como fallback (nada quebra).
 */
export async function loadSellerBranchMap(): Promise<void> {
  try {
    const employees = await fetchEmployees();
    const active = employees.filter((e) => e.active);
    if (active.length > 0) {
      setDynamicSellerMap(active.map((e) => ({ name: e.name, branchId: e.branch_id })));
    }
  } catch (e) {
    // Silencioso: fallback estático assume.
    console.warn("Mapa de funcionários não carregado (usando fallback estático).", e);
  }
}

/**
 * Importa o mapeamento estático atual (SELLER_MAP) para a tabela employees
 * de uma vez. Usado pelo botão "Importar mapeamento atual" na primeira carga.
 * Retorna a quantidade de registros importados.
 */
export async function importStaticSellers(): Promise<number> {
  const rows = getStaticSellerEntries().map((e) => ({
    name: e.name.trim().toUpperCase(),
    branch_id: e.branchId,
    active: true,
  }));

  const { error } = await supabase
    .from("employees")
    .upsert(rows, { onConflict: "name" });

  if (error) throw new Error(`Erro ao importar mapeamento: ${error.message}`);
  return rows.length;
}
