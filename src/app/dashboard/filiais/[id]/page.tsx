"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DailyBarChart } from "@/components/dashboard/daily-bar-chart";
import { SalesRanking } from "@/components/dashboard/sales-ranking";
import { GoalProgressCard } from "@/components/goals/goal-progress-card";
import { GoalManagerModal } from "@/components/goals/goal-manager-modal";
import { ErrorState } from "@/components/dashboard/error-state";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { ID_TO_NORMALIZED_NAME } from "@/lib/seller-map";
import { getStoreGoal } from "@/services/goals-service";
import { formatCurrency } from "@/lib/formatters";
import { DashboardData } from "@/lib/types-microwork";
import {
  Loader2,
  Target,
  TrendingUp,
  Package,
  DollarSign,
  Tags,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { BCICalendar } from "@/components/dashboard/bci-calendar";

export default function BranchDetailPage() {
  const params = useParams();
  const branchId = Number(params.id);
  const branchName = ID_TO_NORMALIZED_NAME[branchId];

  const { periodo } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  // Goals
  const [storeGoal, setStoreGoal] = useState({ target_amount: 0, target_units: 0 });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  async function loadData() {
    if (!branchName) return;
    setLoading(true);
    setError(null);
    try {
      // O service devolve KPIs, ranking de vendedores e evolução diária já
      // filtrados para esta filial e consistentes com o restante do dashboard.
      const result = await fetchSalesData(periodo.from, periodo.to, [branchId]);
      setData(result);

      try {
        const goal = await getStoreGoal(branchName, periodo.from);
        setStoreGoal(goal);
      } catch (e) {
        console.error("Failed to load goals", e);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, branchName, periodo]);

  if (!branchName) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h1 className="text-xl font-bold">Filial não encontrada</h1>
        <Link href="/dashboard/filiais" className="text-primary hover:underline">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 pb-20 text-foreground animate-in fade-in duration-500">
      <DashboardHeader />

      <div className="mt-6 flex flex-col space-y-6">

        {/* Header da Página */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 self-start">
             <Link href="/dashboard/filiais" className="p-2 hover:bg-muted rounded-full transition-colors">
               <ArrowLeft size={24} className="text-muted-foreground" />
             </Link>
             <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {branchName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visão detalhada de performance
                </p>
             </div>
           </div>

           <button
              onClick={() => setIsGoalModalOpen(true)}
              className="flex items-center gap-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border transition-colors text-sm font-medium"
            >
              <Target size={16} />
              Gerenciar Metas
            </button>
        </div>

        {loading ? (
           <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
             <Loader2 className="animate-spin text-shineray-red" size={48} />
             <p>Carregando dados da filial...</p>
           </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : data ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <KpiCard title="Faturamento Local" value={formatCurrency(data.kpis.totalFaturamento)} icon={<DollarSign size={18} />} active />
               <KpiCard title="Ticket Médio" value={formatCurrency(data.kpis.ticketMedio)} icon={<Tags size={18} />} subtitle="Por venda" />
               <KpiCard title="Total Vendas" value={data.kpis.totalVendas} icon={<Package size={18}/>} />

               <GoalProgressCard
                 currentUnits={data.kpis.totalVendas}
                 targetUnits={storeGoal.target_units}
                 label="Meta da Loja"
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Gráfico Diário */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col h-112.5 shadow-sm">
                 <div className="mb-6">
                     <h3 className="font-bold text-foreground flex items-center gap-2">
                       <TrendingUp size={16} className="text-shineray-red" />
                       Evolução Diária
                     </h3>
                     <p className="text-xs text-muted-foreground">Vendas realizadas em {branchName}</p>
                 </div>
                 <div className="flex-1 w-full min-h-0">
                    <DailyBarChart data={data.graficoDiario} />
                 </div>
              </div>

              {/* Calendário BCI - Unidade */}
              <div className="h-112.5">
                 <BCICalendar data={data.graficoDiario} currentDate={periodo.from} />
              </div>
            </div>

            <div className="grid grid-cols-1">
              {/* Ranking Vendedores da Loja */}
              <div className="h-auto">
                 <SalesRanking data={data.rankingVendedores} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Nenhum dado encontrado.</div>
        )}

      </div>

      {branchName && (
        <GoalManagerModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          branchId={branchName}
          currentMonth={periodo.from}
          onSuccess={() => setIsGoalModalOpen(false)} // Recarregar via effect
          sellersList={data?.rankingVendedores.map((v) => ({ name: v.name, avatar: v.name.substring(0, 2) })) || []}
        />
      )}
    </main>
  );
}
