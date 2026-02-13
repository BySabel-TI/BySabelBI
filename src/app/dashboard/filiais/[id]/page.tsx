"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DailyBarChart } from "@/components/dashboard/daily-bar-chart";
import { SalesRanking } from "@/components/dashboard/sales-ranking";
import { GoalProgressCard } from "@/components/goals/goal-progress-card";
import { GoalManagerModal } from "@/components/goals/goal-manager-modal";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { ID_TO_NORMALIZED_NAME } from "@/lib/seller-map";
import { getStoreGoal } from "@/services/goals-service";
import { formatCurrency } from "@/lib/formatters";
import { parseISO, isValid, format } from "date-fns";
import { 
  Loader2, 
  MapPin, 
  Target, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Tags, 
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { getBranchBySeller, normalizeBranchName } from "@/lib/seller-map";
import { BCICalendar } from "@/components/dashboard/bci-calendar";

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = Number(params.id);
  const branchName = ID_TO_NORMALIZED_NAME[branchId];

  const { periodo } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Goals
  const [storeGoal, setStoreGoal] = useState({ target_amount: 0, target_units: 0 });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  useEffect(() => {
    if (!branchName) {
      // ID inválido
      return; 
    }

    async function loadData() {
      setLoading(true);
      // Busca dados filtrados APENAS para esta filial (parametro array [branchId])
      const result = await fetchSalesData(periodo.from, periodo.to, [branchId]);
      
      if (result && result.rawData) {
        setRawData(result.rawData);
      }
      
      // Carregar Meta
      try {
        const goal = await getStoreGoal(branchName, periodo.from);
        setStoreGoal(goal);
      } catch (e) {
        console.error("Failed to load goals", e);
      }

      setLoading(false);
    }
    loadData();
  }, [branchId, branchName, periodo]); // Recarrega se mudar ID ou periodo

  // Processamento de Métricas (Similar ao FiliaisPage principal, mas focado)
  const branchMetrics = useMemo(() => {
    if (!branchName) return null;

    // Filtragem extra de segurança (caso o backend retorne lixo, o que não deve acontecer com o filtro de ID)
    const sales = rawData.filter(item => {
      const rawName = item.vendedor || "";
      const rawPatio = item.patio || "Outros";
      const mapped = getBranchBySeller(rawName);
      const finalName = normalizeBranchName(mapped || rawPatio);
      return finalName === branchName;
    });

    // Ranking Vendedores
    const sellersMap: Record<string, any> = {};
    sales.forEach(item => {
      const rawName = item.vendedor || "Desconhecido";
      const parts = rawName.trim().split(' ');
      const displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
      
      if (!sellersMap[displayName]) {
        sellersMap[displayName] = { name: displayName, filial: branchName, total: 0, qtd: 0 };
      }
      sellersMap[displayName].total += item.valorvenda || 0;
      sellersMap[displayName].qtd += item.quantidade || 0;
    });

    const rankingVendedores = Object.values(sellersMap)
      .map((v: any) => ({
        ...v,
        qtd: v.qtd < 0 ? 0 : v.qtd,
        total: v.total < 0 ? 0 : v.total
      }))
      .sort((a: any, b: any) => b.total - a.total);

    // KPIs
    const totalFat = rankingVendedores.reduce((acc, v) => acc + v.total, 0);
    const totalQtd = rankingVendedores.reduce((acc, v) => acc + v.qtd, 0);
    const ticketMedio = totalQtd > 0 ? totalFat / totalQtd : 0;

    // Gráfico Diário
    const salesByDay: Record<string, any> = {};
    sales.forEach(item => {
      if (!item.datamovimentacao) return;
      const dateObj = parseISO(item.datamovimentacao);
      if (!isValid(dateObj)) return;
      
      const day = format(dateObj, "dd");
      if (!salesByDay[day]) salesByDay[day] = { day, vendas: 0, valor: 0 };
      
      salesByDay[day].vendas += item.quantidade || 0;
      salesByDay[day].valor += item.valorvenda || 0;
    });

    const dailyChartData = Object.values(salesByDay)
      .map((d: any) => ({
        ...d,
        vendas: d.vendas < 0 ? 0 : d.vendas,
        valor: d.valor < 0 ? 0 : d.valor
      }))
      .sort((a: any, b: any) => parseInt(a.day) - parseInt(b.day));

    return { totalFat, totalQtd, ticketMedio, dailyChartData, rankingVendedores };
  }, [rawData, branchName]);


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
        ) : branchMetrics ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <KpiCard title="Faturamento Local" value={formatCurrency(branchMetrics.totalFat)} icon={<DollarSign size={18} />} active />
               <KpiCard title="Ticket Médio" value={formatCurrency(branchMetrics.ticketMedio)} icon={<Tags size={18} />} subtitle="Por venda" />
               <KpiCard title="Total Vendas" value={branchMetrics.totalQtd} icon={<Package size={18}/>} />
               
               <GoalProgressCard 
                 currentUnits={branchMetrics.totalQtd} 
                 targetUnits={storeGoal.target_units} 
                 label="Meta da Loja" 
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gráfico Diário */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col h-[450px] shadow-sm">
                 <div className="mb-6">
                     <h3 className="font-bold text-foreground flex items-center gap-2">
                       <TrendingUp size={16} className="text-shineray-red" />
                       Evolução Diária
                     </h3>
                     <p className="text-xs text-muted-foreground">Vendas realizadas em {branchName}</p>
                 </div>
                 <div className="flex-1 w-full min-h-0">
                    <DailyBarChart data={branchMetrics.dailyChartData} />
                 </div>
              </div>

              {/* Calendário BCI - Unidade */}
              <div className="h-[450px]">
                 <BCICalendar data={branchMetrics.dailyChartData} currentDate={periodo.from} />
              </div>
            </div>

            <div className="grid grid-cols-1">
              {/* Ranking Vendedores da Loja */}
              <div className="h-auto">
                 <SalesRanking data={branchMetrics.rankingVendedores} />
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
          sellersList={branchMetrics?.rankingVendedores.map((v:any) => ({ name: v.name, avatar: v.name.substring(0,2) })) || []}
        />
      )}
    </main>
  );
}
