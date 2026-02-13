
"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStoreGoal } from "@/services/goals-service";
import { cn } from "@/lib/utils";
import { TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BranchData {
  name: string;
  value: number;
  qtd: number;
}

interface CommercialAnalysisTableProps {
  data: BranchData[];
  periodDate: Date;
}

interface EnrichedData extends BranchData {
  goalQt: number;
  goalValue: number;
  percentQt: number;
  id: number;
}

export function CommercialAnalysisTable({ data, periodDate }: CommercialAnalysisTableProps) {
  const [tableData, setTableData] = useState<EnrichedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Processamento e Carga de dados
  const processData = async () => {
    setLoading(true);
    try {
      const promises = data.map(async (branch) => {
        // Tenta extrair ID do nome (Ex: "01 - Ananindeua" -> 1)
        const idMatch = branch.name.match(/^(\d+)/);
        const id = idMatch ? parseInt(idMatch[1]) : 999;

        // Busca meta
        let goalQt = 0;
        let goalValue = 0;
        try {
           const goal = await getStoreGoal(branch.name, periodDate);
           goalQt = goal.target_units || 0;
           goalValue = goal.target_amount || 0;
        } catch (e) {
           console.error("Erro ao buscar meta", e);
        }

        return {
          ...branch,
          id,
          goalQt,
          goalValue,
          percentQt: goalQt > 0 ? (branch.qtd / goalQt) * 100 : 0
        };
      });

      const results = await Promise.all(promises);

      // Ordena estritamente por ID (01, 02, 03...)
      const sorted = results.sort((a, b) => a.id - b.id);
      
      setTableData(sorted);
    } catch (error) {
      console.error("Erro ao carregar tabela comercial", error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      processData();
    }
  }, [data, periodDate]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => processData(), 800);
  };

  if (loading) {
    return (
        <Card className="h-full border-border">
          <CardHeader className="pb-2">
             <div className="h-6 w-48 bg-muted/50 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
             <div className="space-y-1">
               {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} className="h-8 w-full bg-muted/20 animate-pulse rounded" />
               ))}
             </div>
          </CardContent>
        </Card>
    );
  }

  // Totais
  const totals = tableData.reduce((acc, row) => ({
    qtd: acc.qtd + row.qtd,
    value: acc.value + row.value,
    goalQt: acc.goalQt + row.goalQt,
    goalValue: acc.goalValue + row.goalValue
  }), { qtd: 0, value: 0, goalQt: 0, goalValue: 0 });

  return (
    <Card className="h-full border-border overflow-hidden flex flex-col shadow-none">
       {/* HEADLINE simples estilo relatório */}
       <div className="p-4 border-b border-border bg-background flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-foreground">Análise Comercial</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Detalhes por Loja</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" 
            onClick={handleSync} 
            disabled={isSyncing}
            title="Atualizar"
          >
             <RefreshCw size={14} className={cn(isSyncing && "animate-spin")} />
          </Button>
       </div>

       <div className="flex-1 overflow-auto">
         <Table>
           <TableHeader className="bg-muted/50 sticky top-0 z-10">
             <TableRow className="border-b border-border hover:bg-muted/50">
               <TableHead className="w-[220px] font-semibold text-foreground h-10">Loja</TableHead>
               <TableHead className="text-center font-semibold text-foreground h-10">Quantidade</TableHead>
               <TableHead className="text-center font-semibold text-muted-foreground h-10">Meta</TableHead>
               <TableHead className="text-center font-semibold text-foreground h-10">% Meta Qt</TableHead>
               <TableHead className="text-right font-semibold text-foreground h-10">Vl Venda</TableHead>
               <TableHead className="text-right font-semibold text-muted-foreground h-10">Vl Meta</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {tableData.map((row, index) => (
               <TableRow 
                 key={row.name} 
                 className={cn(
                   "border-b border-border/50 hover:bg-muted/30 transition-colors h-9",
                   index % 2 === 0 ? "bg-background" : "bg-muted/10" // Striped rows
                 )}
               >
                 <TableCell className="font-medium text-xs py-1.5 border-r border-border/30 truncate">
                   {row.name.toUpperCase()}
                 </TableCell>
                 <TableCell className="text-center text-xs py-1.5 border-r border-border/30 font-bold">
                   {row.qtd}
                 </TableCell>
                 <TableCell className="text-center text-xs py-1.5 border-r border-border/30 text-muted-foreground">
                   {row.goalQt > 0 ? row.goalQt : ""}
                 </TableCell>
                 <TableCell className="text-center py-1.5 border-r border-border/30">
                    {row.goalQt > 0 && (
                      <span className={cn(
                        "text-xs font-bold",
                         row.percentQt >= 100 ? "text-emerald-600" :
                         row.percentQt >= 80 ? "text-amber-600" : "text-red-600"
                      )}>
                        {row.percentQt.toFixed(0)}%
                      </span>
                    )}
                 </TableCell>
                 <TableCell className="text-right text-xs py-1.5 border-r border-border/30">
                   {formatCurrency(row.value)}
                 </TableCell>
                 <TableCell className="text-right text-xs py-1.5 text-muted-foreground">
                   {row.goalValue > 0 ? formatCurrency(row.goalValue) : ""}
                 </TableCell>
               </TableRow>
             ))}
             
             {/* Linha de Totais */}
             <TableRow className="bg-muted/30 font-bold border-t-2 border-border">
               <TableCell className="py-2 text-sm">Total</TableCell>
               <TableCell className="text-center py-2 text-sm">{totals.qtd}</TableCell>
               <TableCell className="text-center py-2 text-sm text-muted-foreground">{totals.goalQt}</TableCell>
               <TableCell className="text-center py-2 text-sm">
                 {totals.goalQt > 0 ? `${((totals.qtd / totals.goalQt) * 100).toFixed(0)}%` : ""}
               </TableCell>
               <TableCell className="text-right py-2 text-sm">{formatCurrency(totals.value)}</TableCell>
               <TableCell className="text-right py-2 text-sm text-muted-foreground">{formatCurrency(totals.goalValue)}</TableCell>
             </TableRow>
           </TableBody>
         </Table>
       </div>
    </Card>
  );
}
