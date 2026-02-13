"use client";

import { useEffect, useState } from "react";
// 1. Importamos o Header que contém o filtro de Data Global
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StockTable } from "@/components/dashboard/stock-table";
import { Package, TrendingUp, DollarSign, Trophy, Loader2, CalendarRange } from "lucide-react";
// 2. Importamos a store para ouvir as datas
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { ALL_BRANCH_IDS } from "@/lib/seller-map";

export default function EstoquePage() {
  // 3. Pegamos o período selecionado no cabeçalho
  const { periodo, filial } = useFilterStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 4. Recarregamos os dados sempre que a data (periodo) ou filial mudar
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const ids = filial === 'all' 
          ? ALL_BRANCH_IDS 
          : [parseInt(filial.replace(/\D/g, '')) || 1];
        
        // A busca obedece estritamente ao range de datas selecionado
        const result = await fetchSalesData(periodo.from, periodo.to, ids);
        setData(result);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    }
    loadData();
  }, [periodo, filial]);

  const fmtBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground animate-in fade-in duration-500">
      
      {/* 5. O Header Global controla o filtro de data */}
      <DashboardHeader />

      <div className="space-y-8 mt-6">
        {/* Cabeçalho da Seção (Visual que você gostou) */}
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
             {/* Botão decorativo (futura implementação de entrada manual) */}
            <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border cursor-not-allowed opacity-50">
               + Nova Entrada
            </button>
          </div>
        </div>

        {loading && (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="animate-spin text-shineray-red" size={48} />
          </div>
        )}

        {!loading && data && (
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