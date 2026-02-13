"use client";

import { useEffect, useState } from "react";
import { SalesLeaderboard } from "@/components/dashboard/sales-leaderboard";
import { Users, Target, Award, TrendingUp, Loader2 } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import { fetchSalesData } from "@/services/sales-service";
import { ALL_BRANCH_IDS } from "@/lib/seller-map";

import { GoalManagerModal } from "@/components/goals/goal-manager-modal";

export default function VendedoresPage() {
  const { periodo } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [kpis, setKpis] = useState({ totalSellers: 0, bestBranch: "-", avgTicket: 0 });

  const filteredData = leaderboardData.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.filial.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Goals State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Busca dados de TODAS as lojas para ranking geral
      const allCompanies = ALL_BRANCH_IDS;
      const result = await fetchSalesData(periodo.from, periodo.to, allCompanies);
      
      if (result) {
        // Mapeia o rankingVendedores que já vem pronto do service
        const formattedRanking = result.rankingVendedores.map((v: any, index: number) => ({
          id: index,
          name: v.name,
          filial: v.filial,
          total: v.total,
          qtd: v.qtd, // Mapeamento corrigido: o componente espera 'qtd'
          avatar: v.name.substring(0, 2).toUpperCase(),
          trend: index < 3 ? "up" : "same" 
        }));


        setLeaderboardData(formattedRanking);
        
        // Calcula KPIs rápidos
        setKpis({
          totalSellers: formattedRanking.length,
          bestBranch: formattedRanking[0]?.filial || "-",
          avgTicket: result.kpis.ticketMedio
        });
      }
      setLoading(false);
    }
    loadData();
  }, [periodo]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-shineray-red" /></div>;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen text-foreground animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ranking de Vendas</h1>
          <p className="text-sm text-muted-foreground mt-1">Ranking geral de todas as unidades.</p>
        </div>
        
        <button 
          onClick={() => setIsGoalModalOpen(true)}
          className="hidden md:flex items-center gap-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border transition-colors text-sm font-medium"
        >
          <Target size={16} />
          Definir Metas (Geral)
        </button>
      </div>

      {/* SEARCH BAR & KPIS */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2">
             <div className="relative flex-1 md:max-w-sm">
                <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar vendedor ou filial..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
        </div>

        {/* KPIS DE EQUIPE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
               <Users size={24} />
             </div>
             <div>
               <span className="text-xs text-muted-foreground uppercase font-bold">Vendedores Ativos</span>
               <div className="text-2xl font-bold text-foreground">{kpis.totalSellers}</div>
             </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
               <Award size={24} />
             </div>
             <div>
               <span className="text-xs text-muted-foreground uppercase font-bold">Melhor Filial</span>
               <div className="text-xl font-bold text-foreground">{kpis.bestBranch}</div>
             </div>
          </div>
          
          {/* Card 4 */}
          <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg bg-shineray-red/10 flex items-center justify-center text-shineray-red">
               <TrendingUp size={24} />
             </div>
             <div>
               <span className="text-xs text-muted-foreground uppercase font-bold">Ticket Médio</span>
               <div className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.avgTicket)}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* COMPONENTE DE RANKING (PÓDIO + TABELA) */}
      <SalesLeaderboard data={filteredData} />

      {!loading && (
        <GoalManagerModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          branchId="all"
          currentMonth={periodo.from}
          onSuccess={() => setIsGoalModalOpen(false)}
          sellersList={leaderboardData.map(v => ({ name: v.name, avatar: v.avatar }))}
        />
      )}
    </div>
  );
}