"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DailyBarChart } from "@/components/dashboard/daily-bar-chart";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { formatCurrency } from "@/lib/formatters";
import { getBranchBySeller, normalizeBranchName, ALL_BRANCH_IDS } from "@/lib/seller-map"; // Import normalizeBranchName
import { parseISO, isValid, format } from "date-fns";
import { 
  Loader2, 
  ArrowLeft,
  DollarSign, 
  Tags, 
  Package, 
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import Link from "next/link";

function cleanSellerName(rawName: string) {
  if (!rawName) return "";
  return rawName.trim().toUpperCase()
      .replace(/_+$/, '')      
      .replace(/-[0-9]+$/, '') 
      .replace(/\s+/g, ' ');   
}

export default function SellerDetailPage() {
  const params = useParams();
  // Decode the seller name from the URL
  const sellerNameParam = typeof params.sellerName === 'string' ? decodeURIComponent(params.sellerName) : "";
  
  const { periodo } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch data for ALL branches to ensure we find the seller wherever they are
      const result = await fetchSalesData(periodo.from, periodo.to, ALL_BRANCH_IDS);
      
      if (result && result.rawData) {
        setRawData(result.rawData);
      }
      setLoading(false);
    }
    loadData();
  }, [periodo]);

  const sellerMetrics = useMemo(() => {
    if (!sellerNameParam || rawData.length === 0) return null;

    // Filter sales for this specific seller
    const sales = rawData.filter(item => {
      const rawName = item.vendedor || "";
      return cleanSellerName(rawName) === sellerNameParam;
    });

    if (sales.length === 0) return null;

    // Determine the main branch for this seller (based on most sales)
    const branchCounts: Record<string, number> = {};
    sales.forEach(item => {
        const rawName = item.vendedor || "";
        const mapped = getBranchBySeller(rawName);
        const rawPatio = item.patio || "Outros";
        // Use logic similar to FiliaisPage/sales-service to pin down the branch
        // Note: The seller might have sales in multiple branches effectively if they moved?
        // But usually they are tied to one.
        // We will use the explicit mapping first.
        let branch = normalizeBranchName(mapped || rawPatio);
        
        // If normalization falls back to Indefinido but we have a sale, let's try to infer from the sale itself if possible
        // But logic in sales-service is robust.
        
        branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });

    // Find the branch with max occurrence
    const mainBranch = Object.entries(branchCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "Indefinido";

    // KPIs
    const totalFat = sales.reduce((acc, item) => acc + (item.valorvenda || 0), 0);
    const totalQtd = sales.reduce((acc, item) => acc + (item.quantidade || 0), 0);
    // Don't count negatives for total quantity if we want "Net Sales"? 
    // Actually sales-service does: qtd < 0 ? 0 : qtd. Let's stick to raw sum or apply same logic?
    // sales-service applies "floor zero" at AGGREGATE level.
    // Let's apply floor zero to the total just to be safe/consistent with the dashboard view.
    const netQtd = totalQtd < 0 ? 0 : totalQtd;
    const netFat = totalFat < 0 ? 0 : totalFat;

    const ticketMedio = netQtd > 0 ? netFat / netQtd : 0;

    // Daily Chart
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

    // Models Mix
    const modelsMap: Record<string, number> = {};
    sales.forEach(item => {
        const model = item.modelo || "Outros";
        modelsMap[model] = (modelsMap[model] || 0) + (item.quantidade || 0);
    });
    
    const topModels = Object.entries(modelsMap)
        .map(([name, qtd]) => ({ name, qtd: qtd < 0 ? 0 : qtd })) // Floor zero
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5);

    return { 
        name: sellerNameParam,
        branch: mainBranch,
        totalFat: netFat, 
        totalQtd: netQtd, 
        ticketMedio, 
        dailyChartData,
        topModels
    };
  }, [rawData, sellerNameParam]);


  return (
    <main className="min-h-screen bg-background p-6 pb-20 text-foreground animate-in fade-in duration-500">
      <DashboardHeader />

      <div className="mt-6 flex flex-col space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
             <Link href="/dashboard/vendedores" className="p-2 hover:bg-muted rounded-full transition-colors">
               <ArrowLeft size={24} className="text-muted-foreground" />
             </Link>
             <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  {sellerNameParam}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} /> {sellerMetrics?.branch || "Carregando..."}
                </p>
             </div>
        </div>

        {loading ? (
           <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
             <Loader2 className="animate-spin text-shineray-red" size={48} />
             <p>Carregando dados do vendedor...</p>
           </div>
        ) : sellerMetrics ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <KpiCard title="Vendas Totais" value={sellerMetrics.totalQtd} icon={<Package size={18}/>} active />
               <KpiCard title="Faturamento" value={formatCurrency(sellerMetrics.totalFat)} icon={<DollarSign size={18} />} />
               <KpiCard title="Ticket Médio" value={formatCurrency(sellerMetrics.ticketMedio)} icon={<Tags size={18} />} subtitle="Por venda" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gráfico Diário */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col h-[400px] shadow-sm">
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
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-[400px] overflow-y-auto">
                 <div className="mb-4">
                     <h3 className="font-bold text-foreground flex items-center gap-2">
                       <Package size={16} className="text-shineray-red" />
                       Top Modelos
                     </h3>
                     <p className="text-xs text-muted-foreground">Modelos mais vendidos por este vendedor</p>
                 </div>
                 <div className="space-y-3">
                    {sellerMetrics.topModels.map((model, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="text-sm font-medium">{model.name}</span>
                            <span className="text-sm font-bold text-foreground bg-background px-2 py-1 rounded border border-border">
                                {model.qtd}
                            </span>
                        </div>
                    ))}
                    {sellerMetrics.topModels.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-10">Nenhum modelo vendido.</p>
                    )}
                 </div>
              </div>

            </div>
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
