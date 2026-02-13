"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { formatCurrency } from "@/lib/formatters";
import { getBranchBySeller, normalizeBranchName, ID_TO_NORMALIZED_NAME, ALL_BRANCH_IDS } from "@/lib/seller-map";
import { Loader2, MapPin, TrendingUp, Package, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FiliaisPage() {
  const { periodo } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"ranking" | "cards">("cards");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const allCompanies = ALL_BRANCH_IDS;
      const result = await fetchSalesData(periodo.from, periodo.to, allCompanies);
      if (result && result.rawData) {
        setRawData(result.rawData);
      }
      setLoading(false);
    }
    loadData();
  }, [periodo]);

  // Agrupa dados por filial para os cards de resumo
  const branchesSummary = useMemo(() => {
    const summary: Record<string, { id: number, name: string, total: number, qtd: number }> = {};
    
    rawData.forEach(item => {
      const rawName = item.vendedor || "";
      const rawPatio = item.patio || "Outros";
      const mapped = getBranchBySeller(rawName);
      const finalName = normalizeBranchName(mapped || rawPatio);
      
      // Ignora indefinidos ou outros se não forem desejados
      if (finalName === "Indefinido") return;

      // Tenta extrair o ID do nome (Ex: "01 - Ananindeua" -> 1)
      const idMatch = finalName.match(/^(\d+)/);
      const id = idMatch ? parseInt(idMatch[1]) : 999;
      
      // FIX: Ignora filiais que não tem número (não estão na lista oficial 1-20)
      if (id === 999) return;

      if (!summary[finalName]) {
        summary[finalName] = { id, name: finalName, total: 0, qtd: 0 };
      }

      summary[finalName].total += item.valorvenda || 0;
      summary[finalName].qtd += item.quantidade || 0;
    });

    return Object.values(summary)
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (viewMode === "ranking") {
           return b.total - a.total; // Faturamento
        } else {
           return a.id - b.id; // ID da Loja
        }
      });
  }, [rawData, viewMode, searchTerm]);

  return (
    <main className="min-h-screen bg-background p-6 pb-20 text-foreground animate-in fade-in duration-500">
      <DashboardHeader />

      <div className="flex flex-col space-y-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              Visão Geral das Unidades
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione uma filial para ver a performance detalhada.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
             <button
                onClick={() => setViewMode("ranking")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === "ranking" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
             >
                <TrendingUp size={14} />
                Ranking
             </button>
             <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === "cards" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
             >
                <Package size={14} />
                Cards (ID)
             </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-2">
           <div className="relative flex-1 md:max-w-sm">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar filial..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl border border-border/50" />
              ))}
           </div>
        ) : (
          <>
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {branchesSummary.map((branch) => (
                   <Link 
                     key={branch.id} 
                     href={`/dashboard/filiais/${branch.id}`}
                     className="group relative flex flex-col justify-between p-5 bg-card hover:bg-muted/30 border border-border hover:border-shineray-red/50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                   >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-shineray-red group-hover:text-white transition-colors duration-300">
                          <MapPin size={20} />
                        </div>
                        {branch.total > 0 && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} /> Ativa
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-shineray-red transition-colors">
                          {branch.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                           <span className="flex items-center gap-1">
                             <Package size={14} /> {branch.qtd}
                           </span>
                           <span className="flex items-center gap-1 font-medium text-foreground">
                             {formatCurrency(branch.total)}
                           </span>
                        </div>
                      </div>

                      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        <ArrowRight size={18} className="text-shineray-red" />
                      </div>
                   </Link>
                 ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 w-20">Rank</th>
                      <th className="px-6 py-4">Filial</th>
                      <th className="px-6 py-4 text-center">Vendas (Qtd)</th>
                      <th className="px-6 py-4 text-right">Faturamento</th>
                      <th className="px-6 py-4 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {branchesSummary.map((branch, index) => (
                      <tr key={branch.id} className="group hover:bg-muted/50 transition-colors relative">
                         <td className="px-6 py-4 font-mono text-muted-foreground">
                           #{index + 1}
                         </td>
                         <td className="px-6 py-4 font-medium text-foreground">
                            <Link href={`/dashboard/filiais/${branch.id}`} className="absolute inset-0 z-10" />
                            {branch.name}
                         </td>
                         <td className="px-6 py-4 text-center font-bold">
                            {branch.qtd}
                         </td>
                         <td className="px-6 py-4 text-right text-muted-foreground">
                            {formatCurrency(branch.total)}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}