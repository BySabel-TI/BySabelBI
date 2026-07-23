"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart";
import { DailyBarChart } from "@/components/dashboard/daily-bar-chart";
import { SalesRanking } from "@/components/dashboard/sales-ranking"; 
import { CommercialAnalysisTable } from "@/components/dashboard/commercial-analysis-table";
import { BCICalendar } from "@/components/dashboard/bci-calendar";
import { ErrorState } from "@/components/dashboard/error-state";
import { Truck, Loader2, TrendingUp, BarChart3, DollarSign, Tags } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData, fetchYearlyComparison } from "@/services/sales-service";
import { ALL_BRANCH_IDS } from "@/lib/seller-map";
import { formatCurrency } from "@/lib/formatters";
import { DashboardData, MonthlyComparisonPoint } from "@/lib/types-microwork";

import { useUrlFilters } from "@/hooks/use-url-filters";

export default function DashboardGeral() {
  useUrlFilters();
  const { periodo, filial, allowedSeller, refreshKey } = useFilterStore();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<MonthlyComparisonPoint[]>([]);
  const [loadingComparison, setLoadingComparison] = useState(true);

  // Helper para converter o valor do select em array de números
  const getBranchIds = () => {
    if (!filial || filial === 'all') {
      return ALL_BRANCH_IDS;
    }
    // Remove tudo que não é número e garante array
    const id = parseInt(filial.toString().replace(/\D/g, ''));
    return !isNaN(id) && id > 0 ? [id] : ALL_BRANCH_IDS;
  };

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const ids = getBranchIds();
        const isForce = refreshKey > 0;
        const result = await fetchSalesData(periodo.from, periodo.to, ids, allowedSeller, isForce);
        setData(result);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      }
      finally { setLoading(false); }
    }
    loadDashboard();
  }, [periodo, filial, allowedSeller, refreshKey]);

  useEffect(() => {
    async function loadYearly() {
      setLoadingComparison(true);
      try {
        const ids = getBranchIds();
        const result = await fetchYearlyComparison(ids);
        setComparisonData(result || []);
      } catch (error) { console.error(error); }
      finally { setLoadingComparison(false); }
    }
    loadYearly();
  }, [filial]); 

  return (
    <main className="min-h-screen bg-background p-6 pb-20 text-foreground animate-in fade-in duration-500">
      <DashboardHeader />

      {loading && (
        <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
          <Loader2 className="animate-spin text-shineray-red" size={48} />
          <p>Sincronizando com Microwork Cloud...</p>
        </div>
      )}

      {!loading && error && (
        <ErrorState
          message={error}
          onRetry={() => {
            const ids = getBranchIds();
            setLoading(true);
            setError(null);
            fetchSalesData(periodo.from, periodo.to, ids, allowedSeller, true)
              .then(setData)
              .catch((err) => setError(err instanceof Error ? err.message : "Erro desconhecido."))
              .finally(() => setLoading(false));
          }}
        />
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min pb-10 mt-6">
          
          {/* === LINHA 1: KPIS === */}

          <div className="col-span-12 md:col-span-4">
            <KpiCard
              title="Faturamento (R$)"
              value={formatCurrency(data.kpis.totalFaturamento)}
              delta={data.kpis.deltaFaturamento}
              icon={<DollarSign size={18} />}
              active
            />
          </div>
          <div className="col-span-6 md:col-span-4">
            <KpiCard
              title="Fat. Médio"
              value={formatCurrency(data.kpis.ticketMedio)}
              delta={data.kpis.deltaTicketMedio}
              icon={<Tags size={18} />}
              subtitle="Por venda"
            />
          </div>
          <div className="col-span-6 md:col-span-4">
            <KpiCard
              title="Qtd. Vendas"
              value={data.kpis.totalVendas}
              delta={data.kpis.deltaVendas}
              icon={<Truck size={18} />}
            />
          </div>

          {/* === LINHA 2: GRÁFICOS === */}
          <div className="col-span-12 lg:col-span-6 h-87.5 bg-card border border-border rounded-xl p-5 flex flex-col relative shadow-sm">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                   <BarChart3 size={16} className="text-shineray-red" />
                   Comparativo Anual
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ano Atual vs Ano Anterior</p>
              </div>
              {loadingComparison && <Loader2 className="animate-spin text-muted-foreground" size={16} />}
            </div>
            <div className="flex-1 w-full min-h-0">
               <MonthlyBarChart data={comparisonData} />
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-6 h-87.5 bg-card border border-border rounded-xl p-5 flex flex-col shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                 <TrendingUp size={16} className="text-shineray-red" />
                 Evolução Diária
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Vendas realizadas no período selecionado</p>
            </div>
            <div className="flex-1 w-full min-h-0">
               <DailyBarChart data={data.graficoDiario} />
            </div>
          </div>

          {/* === LINHA 3: CALENDÁRIO BCI (LARGURA TOTAL) === */}
          <div className="col-span-12 h-80">
             <BCICalendar data={data.graficoDiario} currentDate={periodo.from} />
          </div>

          {/* === LINHA 4: ANÁLISE COMERCIAL + RANKING === */}
          
          {/* Tabela de Análise Comercial */}
          <div className="col-span-12 lg:col-span-7 h-150">
             <CommercialAnalysisTable data={data.graficoPizza} periodDate={periodo.from} />
          </div>

          {/* Ranking Geral de Vendedores */}
          <div className="col-span-12 lg:col-span-5 h-150">
            <SalesRanking data={data.rankingVendedores} />
          </div>
        </div>
      )}
    </main>
  );
}