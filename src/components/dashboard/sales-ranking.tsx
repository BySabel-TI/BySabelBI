"use client";

import { Trophy, Medal } from "lucide-react";
import { cn, formatBranchName } from "@/lib/utils";

import { formatCurrency } from "@/lib/formatters";

interface SellerData {
  name: string;
  filial: string;
  total: number;
  qtd: number;
}

interface SalesRankingProps {
  data: SellerData[];
}

export function SalesRanking({ data }: SalesRankingProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-card border border-border rounded-xl">
        <p>Nenhum vendedor rankeado.</p>
      </div>
    );
  }

  const maxValue = data[0]?.total || 1;

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
      
      {/* Cabeçalho */}
      <div className="p-5 border-b border-border bg-muted/30">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Trophy className="text-shineray-red" size={16} />
          Ranking de Vendedores
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Baseado no Volume de Vendas (Qtd)
        </p>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {data.map((seller, index) => {
          const rank = index + 1;
          const percentage = (seller.qtd / (data[0]?.qtd || 1)) * 100;
          
          // Lógica de Cores Híbrida (Funciona bem no Claro e no Escuro)
          let RankIcon = null;
          // Padrão (4º lugar em diante): Fundo cinza suave no claro, escuro no dark
          let badgeStyles = "bg-muted text-muted-foreground border-border"; 

          if (rank === 1) {
            RankIcon = <Trophy size={14} className="text-yellow-600 dark:text-yellow-500 fill-yellow-500/20" />;
            // Amarelo suave no claro, Neon no escuro
            badgeStyles = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/50";
          } else if (rank === 2) {
            RankIcon = <Medal size={14} className="text-zinc-600 dark:text-zinc-300 fill-zinc-300/20" />;
            badgeStyles = "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/50";
          } else if (rank === 3) {
            RankIcon = <Medal size={14} className="text-amber-700 dark:text-amber-600 fill-amber-700/20" />;
            badgeStyles = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-700/10 dark:text-amber-600 dark:border-amber-700/50";
          }

          return (
            <div 
              key={index} 
              className="group relative flex items-center gap-4 p-3 rounded-lg hover:bg-muted/60 transition-all border border-transparent hover:border-border/50"
            >
              {/* Coluna 1: Posição (Badge) */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold shrink-0 shadow-sm transition-colors",
                badgeStyles
              )}>
                {RankIcon || <span>#{rank}</span>}
              </div>

              {/* Coluna 2: Dados + Barra */}
              <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Avatar: Adapta ao tema */}
                    <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-border shadow-sm">
                      {getInitials(seller.name)}
                    </div>
                    {/* Nome: Preto no claro, Branco no escuro */}
                    <span className="text-sm font-semibold text-foreground truncate max-w-[120px] md:max-w-[180px]">
                      {seller.name}
                    </span>
                  </div>
                  
                  {/* Filial Tag */}
                  <span className="text-[9px] uppercase font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border shadow-sm">
                    {formatBranchName(seller.filial)}
                  </span>
                </div>

                {/* Barra de Progresso Track: Cinza claro no light, cinza escuro no dark */}
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex">
                  {/* Barra de Progresso Fill */}
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                      rank === 1 ? "bg-linear-to-r from-yellow-500 to-yellow-300" :
                      rank === 2 ? "bg-linear-to-r from-zinc-400 to-zinc-300 dark:from-zinc-500 dark:to-zinc-400" :
                      rank === 3 ? "bg-linear-to-r from-amber-600 to-amber-500" :
                      "bg-zinc-400 dark:bg-zinc-600"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Coluna 3: Valores */}
              <div className="text-right shrink-0 z-10 min-w-[90px]">
                <div className="text-sm font-bold font-mono tracking-tight text-emerald-500 dark:text-emerald-400">
                  {seller.qtd} venda{seller.qtd !== 1 && 's'}
                </div>
                <div className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {formatCurrency(seller.total)}
                </div>
              </div>
              
              {/* Efeito Hover Universal (Preto no claro, Branco no escuro) */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
            </div>
          );
        })}
      </div>
    </div>
  );
}