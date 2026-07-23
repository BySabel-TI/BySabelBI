"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DailyBarChart } from "@/components/dashboard/daily-bar-chart";
import { ErrorState } from "@/components/dashboard/error-state";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { ALL_BRANCH_IDS } from "@/lib/seller-map";
import { cleanSellerName, resolveSellerBranch, aggregateByDay, floorZero } from "@/lib/aggregations";
import { MicroworkSaleItem } from "@/lib/types-microwork";
import { formatCurrency } from "@/lib/formatters";
import { buildBranchHistory, BranchStint } from "@/services/branch-history-service";
import {
  Loader2,
  ArrowLeft,
  DollarSign,
  Tags,
  Package,
  TrendingUp,
  MapPin,
  History,
  Calendar,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function SellerDetailPage() {
  const params = useParams();
  // Decode the seller name from the URL
  const sellerNameParam = typeof params.sellerName === 'string' ? decodeURIComponent(params.sellerName) : "";

  const { periodo } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<MicroworkSaleItem[]>([]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Busca todas as filiais para encontrar o vendedor onde quer que ele esteja.
      const result = await fetchSalesData(periodo.from, periodo.to, ALL_BRANCH_IDS);
      setRawData(result.rawData);
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
  }, [periodo]);

  const sellerMetrics = useMemo(() => {
    if (!sellerNameParam || rawData.length === 0) return null;

    // Filtra as vendas deste vendedor usando o nome canônico.
    const sales = rawData.filter((item) => cleanSellerName(item.vendedor) === sellerNameParam);

    if (sales.length === 0) return null;

    // Determina a filial principal (a com mais vendas).
    const branchCounts: Record<string, number> = {};
    sales.forEach((item) => {
      const branch = resolveSellerBranch(item);
      branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });
    const mainBranch =
      Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Indefinido";

    // KPIs (piso zero para consistência com o dashboard).
    const netFat = floorZero(sales.reduce((acc, item) => acc + (item.valorvenda || 0), 0));
    const netQtd = floorZero(sales.reduce((acc, item) => acc + (item.quantidade || 0), 0));
    const ticketMedio = netQtd > 0 ? netFat / netQtd : 0;

    const dailyChartData = aggregateByDay(sales);

    // Dias com venda e melhor dia.
    const activeDays = dailyChartData.filter((d) => d.vendas > 0).length;
    const bestDay = dailyChartData.reduce(
      (best, d) => (d.vendas > best.vendas ? d : best),
      { day: "--", vendas: 0, valor: 0 }
    );

    // Mix de modelos (Top 5) com participação (%).
    const modelsMap: Record<string, number> = {};
    sales.forEach((item) => {
      const model = item.modelo || "Outros";
      modelsMap[model] = (modelsMap[model] || 0) + (item.quantidade || 0);
    });

    const topModels = Object.entries(modelsMap)
      .map(([name, qtd]) => ({ name, qtd: floorZero(qtd) }))
      .filter((m) => m.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5)
      .map((m) => ({ ...m, pct: netQtd > 0 ? (m.qtd / netQtd) * 100 : 0 }));

    return {
      name: sellerNameParam,
      branch: mainBranch,
      totalFat: netFat,
      totalQtd: netQtd,
      ticketMedio,
      activeDays,
      bestDay,
      dailyChartData,
      topModels,
    };
  }, [rawData, sellerNameParam]);

  // Histórico de lotação
  const branchHistory = useMemo(() => {
    if (!sellerNameParam || rawData.length === 0) return [];
    return buildBranchHistory(sellerNameParam, rawData);
  }, [rawData, sellerNameParam]);

  const initials = sellerNameParam
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-background p-6 pb-20 text-foreground animate-in fade-in duration-500">
      <DashboardHeader />

      <div className="mt-6 flex flex-col space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
             <Link href="/dashboard/vendedores" className="p-2 hover:bg-muted rounded-full transition-colors">
               <ArrowLeft size={24} className="text-muted-foreground" />
             </Link>
             <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-shineray-red to-red-800 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
               {initials || "?"}
             </div>
             <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {sellerNameParam}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-muted/60 border border-border px-2 py-0.5 rounded-full text-xs font-medium">
                    <MapPin size={12} className="text-shineray-red" /> {sellerMetrics?.branch || "—"}
                  </span>
                  {sellerMetrics && (
                    <span className="text-xs">
                      {sellerMetrics.activeDays} dia(s) com venda no período
                    </span>
                  )}
                </div>
             </div>
        </div>

        {loading ? (
           <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
             <Loader2 className="animate-spin text-shineray-red" size={48} />
             <p>Carregando dados do vendedor...</p>
           </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : sellerMetrics ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* KPI GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <KpiCard title="Vendas Totais" value={sellerMetrics.totalQtd} icon={<Package size={18}/>} active />
               <KpiCard title="Faturamento" value={formatCurrency(sellerMetrics.totalFat)} icon={<DollarSign size={18} />} />
               <KpiCard title="Ticket Médio" value={formatCurrency(sellerMetrics.ticketMedio)} icon={<Tags size={18} />} subtitle="Por venda" />
               <KpiCard
                 title="Melhor Dia"
                 value={sellerMetrics.bestDay.vendas > 0 ? `Dia ${sellerMetrics.bestDay.day}` : "—"}
                 icon={<TrendingUp size={18} />}
                 subtitle={sellerMetrics.bestDay.vendas > 0 ? `${sellerMetrics.bestDay.vendas} vendas` : "Sem vendas"}
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Gráfico Diário */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col h-100 shadow-sm">
                 <div className="mb-6">
                     <h3 className="font-bold text-foreground flex items-center gap-2">
                       <TrendingUp size={16} className="text-shineray-red" />
                       Evolução Diária
                     </h3>
                     <p className="text-xs text-muted-foreground">Desempenho no período selecionado</p>
                 </div>
                 <div className="flex-1 w-full min-h-0">
                    <DailyBarChart data={sellerMetrics.dailyChartData} />
                 </div>
              </div>

              {/* Top Modelos */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-100 overflow-y-auto">
                 <div className="mb-4">
                     <h3 className="font-bold text-foreground flex items-center gap-2">
                       <Package size={16} className="text-shineray-red" />
                       Top Modelos
                     </h3>
                     <p className="text-xs text-muted-foreground">Modelos mais vendidos por este vendedor</p>
                 </div>
                 <div className="space-y-3">
                    {sellerMetrics.topModels.map((model, idx) => (
                        <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium truncate pr-2">{model.name}</span>
                              <span className="text-sm font-bold text-foreground shrink-0">{model.qtd}</span>
                            </div>
                            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-shineray-red rounded-full transition-all"
                                style={{ width: `${Math.min(model.pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                              {model.pct.toFixed(0)}% das vendas
                            </span>
                        </div>
                    ))}
                    {sellerMetrics.topModels.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-10">Nenhum modelo vendido.</p>
                    )}
                 </div>
              </div>

            </div>

            {/* ============================================================= */}
            {/* SEÇÃO: Histórico de Lotação                                    */}
            {/* ============================================================= */}
            {branchHistory.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <History size={16} className="text-shineray-red" />
                    Histórico de Lotação
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {branchHistory.length === 1
                      ? "Filial fixa durante todo o período analisado"
                      : `Atividade em ${branchHistory.length} filiais no período`}
                  </p>
                </div>

                <BranchTimeline stints={branchHistory} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
            <Package size={48} className="opacity-20 mb-4" />
            <p className="text-lg font-medium">Vendedor não encontrado ou sem vendas no período.</p>
            <Link href="/dashboard/vendedores" className="text-primary hover:underline mt-2 text-sm">
                Voltar para o Ranking
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}

// === Timeline Visual de Lotação ===
function BranchTimeline({ stints }: { stints: BranchStint[] }) {
  return (
    <div className="relative">
      {/* Linha vertical do timeline */}
      <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-border" />

      <div className="space-y-0">
        {stints.map((stint, idx) => (
          <div key={stint.branch} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Marcador do timeline */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-[38px] h-[38px] rounded-full flex items-center justify-center border-2 ${
                  stint.isCurrent
                    ? "bg-shineray-red border-shineray-red text-white shadow-lg shadow-red-500/20"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <Building2 size={16} />
              </div>
            </div>

            {/* Conteúdo */}
            <div className={`flex-1 rounded-xl p-4 border transition-all ${
              stint.isCurrent
                ? "bg-shineray-red/5 border-shineray-red/20"
                : "bg-muted/20 border-border/50 hover:bg-muted/40"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={stint.isCurrent ? "text-shineray-red" : "text-muted-foreground"} />
                  <span className="font-semibold text-foreground text-sm">{stint.branch}</span>
                  {stint.isCurrent && (
                    <span className="text-[10px] font-bold bg-shineray-red text-white px-2 py-0.5 rounded-full">
                      ATUAL
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Package size={12} />
                    {stint.totalSales} venda(s)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign size={12} />
                    {formatCurrency(stint.totalRevenue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Calendar size={12} />
                <span>{stint.firstSaleLabel}</span>
                <span className="text-border">→</span>
                <span>{stint.lastSaleLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
