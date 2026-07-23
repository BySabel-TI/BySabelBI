"use client";

import { useEffect, useState } from "react";
// 1. Importamos o Header que contém o filtro de Data Global
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StockTable } from "@/components/dashboard/stock-table";
import { ErrorState } from "@/components/dashboard/error-state";
import { Package, TrendingUp, DollarSign, Trophy, Loader2, CalendarRange } from "lucide-react";
// 2. Importamos a store para ouvir as datas
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { ALL_BRANCH_IDS } from "@/lib/seller-map";
import { DashboardData, ModelRanking } from "@/lib/types-microwork";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { ExportButton } from "@/components/ui/export-button";
import { fileDateSuffix } from "@/lib/export";

export default function EstoquePage() {
  useUrlFilters();
  const { periodo, filial, allowedSeller, refreshKey } = useFilterStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const ids = filial === 'all'
          ? ALL_BRANCH_IDS
          : [parseInt(filial.replace(/\D/g, '')) || 1];

        const isForce = refreshKey > 0;
        const result = await fetchSalesData(periodo.from, periodo.to, ids, allowedSeller, isForce);
        setData(result);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      }
      finally { setLoading(false); }
    }
    loadData();
  }, [periodo, filial, allowedSeller, refreshKey]);

  const fmtBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground animate-in fade-in duration-500">
      
      {/* 5. O Header Global controla o filtro de data */}
      <DashboardHeader />

      <div className="space-y-8 mt-6">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-xl border border-border/50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Package className="text-shineray-red" />
              Giro de Estoque
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <CalendarRange size={14} />
              Mostrando dados de: <span className="text-foreground font-medium">
                {periodo.from.toLocaleDateString('pt-BR')} até {periodo.to.toLocaleDateString('pt-BR')}
              </span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <ExportButton<ModelRanking>
              filename={`giro_estoque_${fileDateSuffix()}`}
              rows={data?.rankingModelos || []}
              columns={[
                { header: "Modelo", accessor: (row: ModelRanking) => row.name },
                { header: "Qtd. Vendida", accessor: (row: ModelRanking) => row.qtd },
                { header: "Valor Total (R$)", accessor: (row: ModelRanking) => row.valor },
              ]}
              label="Exportar Giro"
            />
          </div>
        </div>

        {loading && (
          <div className="h-100 flex items-center justify-center">
            <Loader2 className="animate-spin text-shineray-red" size={48} />
          </div>
        )}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={() => {
              const ids = filial === 'all'
                ? ALL_BRANCH_IDS
                : [parseInt(filial.replace(/\D/g, '')) || 1];
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
          <>
            {/* Cards de Resumo (Baseados no Período Selecionado) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard 
                label="Volume de Saída" 
                value={data.kpis.totalVendas.toString()} 
                icon={Package} 
                trend="Unidades vendidas"
                color="text-white"
              />
              <SummaryCard 
                label="Faturamento (Giro)" 
                value={fmtBRL(data.kpis.totalFaturamento)} 
                icon={DollarSign} 
                trend="Receita no período"
                color="text-emerald-500"
              />
              <SummaryCard 
                label="Ticket Médio" 
                value={fmtBRL(data.kpis.ticketMedio)} 
                icon={TrendingUp} 
                trend="Por moto vendida"
                color="text-amber-500"
              />
              <SummaryCard 
                label="Modelo Destaque" 
                value={data.rankingModelos[0]?.name.substring(0, 15) || "N/A"} 
                icon={Trophy} 
                trend="Mais vendido"
                color="text-shineray-red"
              />
            </div>

            {/* A Tabela Principal */}
            <StockTable data={data.rankingModelos} />
          </>
        )}
      </div>
    </main>
  );
}

// Componente Interno dos Cards
function SummaryCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="bg-card/50 border border-border p-4 rounded-xl flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{label}</span>
        <div className={`p-2 rounded-lg bg-background border border-border ${color.replace('text-', 'text-opacity-90 ')}`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <div>
        <span className="text-xl md:text-2xl font-bold text-foreground block truncate tracking-tight" title={value}>
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground mt-1 block font-medium">
          {trend}
        </span>
      </div>
    </div>
  );
}