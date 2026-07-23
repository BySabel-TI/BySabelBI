"use client";

import { useEffect, useMemo, useState, useCallback, type FormEvent } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/contexts/auth-context";
import {
  Employee,
  fetchEmployees,
  upsertEmployee,
  deleteEmployee,
  importStaticSellers,
} from "@/services/employees-service";
import {
  UnknownSeller,
  discoverUnknownSellers,
  bulkRegisterSellers,
} from "@/services/seller-discovery-service";
import { fetchSalesData } from "@/services/sales-service";
import { useFilterStore } from "@/store/useFilterStore";
import { ALL_BRANCH_IDS } from "@/lib/seller-map";
import { ID_TO_NORMALIZED_NAME } from "@/lib/seller-map";
import { cn } from "@/lib/utils";
import {
  Users2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  DownloadCloud,
  ShieldAlert,
  X,
  Save,
  MapPin,
  UserPlus,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

// Opções de filial (exclui "99 - Sem Loja")
const BRANCH_OPTIONS = Object.entries(ID_TO_NORMALIZED_NAME)
  .filter(([id]) => id !== "99")
  .map(([id, name]) => ({ id: Number(id), name }));

const branchName = (id: number | null) =>
  id != null ? ID_TO_NORMALIZED_NAME[id] || `Filial ${id}` : "— Sem filial —";

export default function FuncionariosPage() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "director";
  const { periodo } = useFilterStore();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);

  // Modal
  const [editing, setEditing] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detecção de vendedores desconhecidos
  const [unknownSellers, setUnknownSellers] = useState<UnknownSeller[]>([]);
  const [unknownLoading, setUnknownLoading] = useState(false);
  const [unknownExpanded, setUnknownExpanded] = useState(false);
  const [selectedUnknown, setSelectedUnknown] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const emps = await fetchEmployees();
      setEmployees(emps);
      return emps;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const detectUnknown = useCallback(async (emps: Employee[]) => {
    setUnknownLoading(true);
    try {
      const result = await fetchSalesData(
        periodo.from,
        periodo.to,
        ALL_BRANCH_IDS
      );
      const unknown = discoverUnknownSellers(result.rawData, emps);
      setUnknownSellers(unknown);
      if (unknown.length > 0) setUnknownExpanded(true);
    } catch {
      // Silencioso: se a API falhar, só não mostra a seção.
      setUnknownSellers([]);
    } finally {
      setUnknownLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }
    (async () => {
      const emps = await loadEmployees();
      if (emps.length > 0) {
        await detectUnknown(emps);
      }
    })();
  }, [canManage, loadEmployees, detectUnknown]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.display_name || "").toLowerCase().includes(q) ||
        branchName(e.branch_id).toLowerCase().includes(q)
    );
  }, [employees, search]);

  function openNew() {
    setEditing({ name: "", display_name: "", branch_id: null, active: true });
    setIsModalOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditing({ ...emp });
    setIsModalOpen(true);
  }

  async function handleSave(emp: Employee) {
    await upsertEmployee(emp);
    setIsModalOpen(false);
    setEditing(null);
    setFeedback("Funcionário salvo com sucesso.");
    const emps = await loadEmployees();
    await detectUnknown(emps);
  }

  async function handleDelete(emp: Employee) {
    if (!emp.id) return;
    if (!confirm(`Excluir "${emp.display_name || emp.name}"?`)) return;
    try {
      await deleteEmployee(emp.id);
      setFeedback("Funcionário excluído.");
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  async function handleImport() {
    if (!confirm("Importar o mapeamento atual (código) para o banco? Registros existentes serão atualizados pelo nome.")) return;
    setImporting(true);
    setError(null);
    try {
      const count = await importStaticSellers();
      setFeedback(`Importação concluída: ${count} vendedores.`);
      const emps = await loadEmployees();
      await detectUnknown(emps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar.");
    } finally {
      setImporting(false);
    }
  }

  // ---- Funções de seleção de vendedores desconhecidos ----
  function toggleUnknownSelection(name: string) {
    setSelectedUnknown((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedUnknown.size === unknownSellers.length) {
      setSelectedUnknown(new Set());
    } else {
      setSelectedUnknown(new Set(unknownSellers.map((s) => s.name)));
    }
  }

  async function handleRegisterSelected() {
    const toRegister = unknownSellers.filter((s) => selectedUnknown.has(s.name));
    if (toRegister.length === 0) return;
    if (!confirm(`Cadastrar ${toRegister.length} vendedor(es) com a filial inferida?`)) return;
    setRegistering(true);
    setError(null);
    try {
      const count = await bulkRegisterSellers(toRegister);
      setFeedback(`${count} vendedor(es) cadastrado(s) com sucesso.`);
      setSelectedUnknown(new Set());
      const emps = await loadEmployees();
      await detectUnknown(emps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setRegistering(false);
    }
  }

  async function handleRegisterAll() {
    if (unknownSellers.length === 0) return;
    if (!confirm(`Cadastrar TODOS os ${unknownSellers.length} vendedor(es) encontrados?`)) return;
    setRegistering(true);
    setError(null);
    try {
      const count = await bulkRegisterSellers(unknownSellers);
      setFeedback(`${count} vendedor(es) cadastrado(s) com sucesso.`);
      setSelectedUnknown(new Set());
      const emps = await loadEmployees();
      await detectUnknown(emps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setRegistering(false);
    }
  }

  // === Gate de acesso ===
  if (!canManage) {
    return (
      <main className="min-h-screen bg-background p-6 text-foreground">
        <DashboardHeader />
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
            <ShieldAlert className="text-amber-500" size={28} />
          </div>
          <div>
            <p className="font-semibold text-foreground">Acesso restrito</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Apenas Administradores e Diretoria podem gerenciar funcionários.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 pb-20 text-foreground animate-in fade-in duration-500">
      <DashboardHeader />

      <div className="mt-6 space-y-6">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-6 rounded-xl border border-border/50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users2 className="text-shineray-red" />
              Funcionários
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastro de vendedores e vínculo com a filial (editável, sem hardcode).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium border border-border transition-colors disabled:opacity-50"
              title="Popular a tabela a partir do mapeamento atual do código"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
              Importar mapeamento atual
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-shineray-red hover:bg-shineray-red/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Novo funcionário
            </button>
          </div>
        </div>

        {feedback && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 p-3 rounded-lg text-sm font-medium flex justify-between items-center">
            {feedback}
            <button onClick={() => setFeedback(null)}><X size={14} /></button>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm font-medium flex justify-between items-center">
            {error}
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* ============================================================= */}
        {/* SEÇÃO: Vendedores Não Cadastrados (Detecção Automática)        */}
        {/* ============================================================= */}
        {unknownLoading ? (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-600 dark:text-amber-500">
            <Loader2 size={16} className="animate-spin" />
            Analisando dados de vendas para detectar novos vendedores...
          </div>
        ) : unknownSellers.length > 0 ? (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden">
            {/* Header colapsável */}
            <button
              onClick={() => setUnknownExpanded(!unknownExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {unknownSellers.length} vendedor(es) encontrado(s) nas vendas sem cadastro
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Esses nomes apareceram nos dados da API mas não estão na tabela de funcionários.
                  </p>
                </div>
              </div>
              {unknownExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {unknownExpanded && (
              <div className="border-t border-amber-500/20">
                {/* Barra de ações */}
                <div className="flex items-center justify-between p-3 bg-amber-500/5 border-b border-amber-500/10">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CheckSquare size={14} />
                    {selectedUnknown.size === unknownSellers.length ? "Desmarcar todos" : "Selecionar todos"}
                  </button>
                  <div className="flex items-center gap-2">
                    {selectedUnknown.size > 0 && (
                      <button
                        onClick={handleRegisterSelected}
                        disabled={registering}
                        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {registering ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                        Cadastrar selecionados ({selectedUnknown.size})
                      </button>
                    )}
                    <button
                      onClick={handleRegisterAll}
                      disabled={registering}
                      className="flex items-center gap-1.5 bg-shineray-red hover:bg-shineray-red/90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {registering ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                      Cadastrar todos
                    </button>
                  </div>
                </div>

                {/* Tabela de desconhecidos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                      <tr>
                        <th className="px-4 py-2.5 w-10"></th>
                        <th className="px-4 py-2.5">Nome no ERP</th>
                        <th className="px-4 py-2.5">Filial Inferida</th>
                        <th className="px-4 py-2.5 text-center">Vendas</th>
                        <th className="px-4 py-2.5">Primeira Venda</th>
                        <th className="px-4 py-2.5">Última Venda</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {unknownSellers.map((seller) => (
                        <tr
                          key={seller.name}
                          className={cn(
                            "transition-colors cursor-pointer",
                            selectedUnknown.has(seller.name)
                              ? "bg-amber-500/10"
                              : "hover:bg-muted/30"
                          )}
                          onClick={() => toggleUnknownSelection(seller.name)}
                        >
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={selectedUnknown.has(seller.name)}
                              onChange={() => toggleUnknownSelection(seller.name)}
                              className="h-4 w-4 rounded border-input accent-amber-500"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{seller.rawName}</td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                              <MapPin size={12} className="text-amber-500/70" />
                              {seller.inferredBranch}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center font-semibold">{seller.salesCount}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{seller.firstSale}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{seller.lastSale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Busca */}
        <div className="relative md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou filial..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-3 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/30 animate-pulse rounded" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {employees.length === 0
                ? "Nenhum funcionário cadastrado. Use \u201cImportar mapeamento atual\u201d para começar."
                : "Nenhum resultado para a busca."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-3">Vendedor (ERP)</th>
                    <th className="px-5 py-3">Exibição</th>
                    <th className="px-5 py-3">Filial</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((emp) => (
                    <tr key={emp.id || emp.name} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{emp.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{emp.display_name || "—"}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <MapPin size={13} className="text-shineray-red/70" />
                          {branchName(emp.branch_id)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full",
                            emp.active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {emp.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} de {employees.length} funcionário(s).
          </p>
        )}
      </div>

      {isModalOpen && editing && (
        <EmployeeModal
          employee={editing}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

// === Modal de cadastro/edição ===
function EmployeeModal({
  employee,
  onClose,
  onSave,
}: {
  employee: Employee;
  onClose: () => void;
  onSave: (emp: Employee) => Promise<void>;
}) {
  const [form, setForm] = useState<Employee>(employee);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErr("O nome do vendedor (como vem do ERP) é obrigatório.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave(form);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{employee.id ? "Editar funcionário" : "Novo funcionário"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Nome no ERP <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: ANA PAULA VALERIO DO NASCIMENTO"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Deve casar exatamente com o campo &ldquo;vendedor&rdquo; retornado pela API.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Nome de exibição (opcional)</label>
            <input
              value={form.display_name || ""}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Ex: Ana Paula"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Filial</label>
            <select
              value={form.branch_id ?? ""}
              onChange={(e) =>
                setForm({ ...form, branch_id: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">— Sem filial —</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-shineray-red"
            />
            Ativo
          </label>

          {err && <p className="text-xs text-red-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-shineray-red hover:bg-shineray-red/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
