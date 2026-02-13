"use client";

import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { cn, formatBranchName } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

// Definição do formato dos dados que esperamos receber
interface SellerData {
  id: number | string;
  name: string;
  filial: string;
  total: number;
  qtd: number;
  avatar: string;
  trend: "up" | "down" | "same";
}

interface SalesLeaderboardProps {
  data: SellerData[];
}

export function SalesLeaderboard({ data }: SalesLeaderboardProps) {
  // Se não houver dados, exibe mensagem amigável
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
        <p>Nenhum dado de vendas encontrado para o período.</p>
      </div>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="space-y-8">
      
      {/* === O PÓDIO (TOP 3) === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center mb-10 pt-4 min-h-[280px]">
        
        {/* 2º LUGAR (Só renderiza se existir) */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          {top3[1] && (
            <Link href={`/dashboard/vendedores/${encodeURIComponent(top3[1].name)}`} className="contents">
              <div className="relative group cursor-pointer transition-transform hover:scale-105">
                <div className="w-20 h-20 rounded-full border-4 border-zinc-400 bg-secondary flex items-center justify-center text-xl font-bold text-secondary-foreground shadow-lg mb-3 relative z-10">
                  {top3[1].avatar}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-400 text-zinc-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-20">
                  <Medal size={12} /> #2
                </div>
              </div>
              <div className="text-center mt-2 group cursor-pointer">
                <h3 className="font-bold text-foreground group-hover:text-shineray-red transition-colors">{top3[1].name}</h3>
                <p className="text-xs text-muted-foreground">{formatBranchName(top3[1].filial)}</p>
                <p className="text-lg font-bold text-foreground/80 mt-1">
                  {top3[1].qtd} vendas
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatCurrency(top3[1].total)}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* 1º LUGAR (CAMPEÃO) */}
        <div className="order-1 md:order-2 flex flex-col items-center -mt-8 relative">
          {top3[0] && (
            <Link href={`/dashboard/vendedores/${encodeURIComponent(top3[0].name)}`} className="contents">
              {/* Efeito de Glow Dourado */}
              <div className="absolute top-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative group cursor-pointer transition-transform hover:scale-105">
                <div className="absolute -inset-1 bg-yellow-500 rounded-full blur opacity-40 animate-pulse"></div>
                <div className="w-28 h-28 rounded-full border-4 border-yellow-500 bg-card flex items-center justify-center text-3xl font-bold text-yellow-500 shadow-xl mb-3 relative z-10">
                  <Trophy size={32} />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1 z-20 shadow-lg">
                  #1 CAMPEÃO
                </div>
              </div>
              <div className="text-center mt-4 group cursor-pointer">
                <h3 className="text-xl font-bold text-foreground group-hover:text-yellow-500 transition-colors">{top3[0].name}</h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">{formatBranchName(top3[0].filial)}</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mt-1">
                  {top3[0].qtd} vendas
                </p>
                <p className="text-sm text-yellow-600/80 dark:text-yellow-500/80 font-medium">
                  {formatCurrency(top3[0].total)}
                </p>

              </div>
            </Link>
          )}
        </div>

        {/* 3º LUGAR (Só renderiza se existir) */}
        <div className="order-3 flex flex-col items-center">
          {top3[2] && (
            <Link href={`/dashboard/vendedores/${encodeURIComponent(top3[2].name)}`} className="contents">
              <div className="relative group cursor-pointer transition-transform hover:scale-105">
                <div className="w-20 h-20 rounded-full border-4 border-amber-700 bg-secondary flex items-center justify-center text-xl font-bold text-amber-700 dark:text-amber-600 shadow-lg mb-3 relative z-10">
                  {top3[2].avatar}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-20">
                  <Medal size={12} /> #3
                </div>
              </div>
              <div className="text-center mt-2 group cursor-pointer">
                <h3 className="font-bold text-foreground group-hover:text-amber-700 transition-colors">{top3[2].name}</h3>
                <p className="text-xs text-muted-foreground">{formatBranchName(top3[2].filial)}</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-600 mt-1">
                  {top3[2].qtd} vendas
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatCurrency(top3[2].total)}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* === A TABELA DO RESTO === */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Filial</th>
                <th className="px-6 py-4 text-center">Vendas</th>
                <th className="px-6 py-4 text-right">Fat.</th>
                <th className="px-6 py-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rest.map((seller, index) => {
                return (
                  <tr key={seller.id} className="group hover:bg-muted/50 transition-colors relative">
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <Link href={`/dashboard/vendedores/${encodeURIComponent(seller.name)}`} className="absolute inset-0 z-10" />
                      #{index + 4}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                        {seller.avatar}
                      </div>
                      <span className="font-medium text-foreground group-hover:text-shineray-red transition-colors">{seller.name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatBranchName(seller.filial)}
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-foreground">
                       {seller.qtd}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                       {formatCurrency(seller.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {seller.trend === 'up' && <TrendingUp size={16} className="text-emerald-500 inline" />}
                      {seller.trend === 'down' && <TrendingDown size={16} className="text-red-500 inline" />}
                      {seller.trend === 'same' && <Minus size={16} className="text-muted-foreground inline" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}