"use client";

import { Bike } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import { fileDateSuffix } from "@/lib/export";
import { formatNumber } from "@/lib/formatters";

interface ModelData {
  name: string;
  qtd: number;
  valor: number;
}

interface StockTableProps {
  data: ModelData[];
}

export function StockTable({ data }: StockTableProps) {
  const fmtBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  if (!data || data.length === 0) {
    return <div className="text-zinc-500 text-sm">Nenhum dado de modelo disponível.</div>;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center gap-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Bike size={18} className="text-shineray-red" />
          Ranking de Modelos (Saída)
        </h3>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-muted-foreground">Ordenado por Faturamento</span>
          <ExportButton
            filename={`ranking-modelos-${fileDateSuffix()}`}
            rows={data}
            columns={[
              { header: "Modelo", accessor: (r) => r.name },
              { header: "Unidades Vendidas", accessor: (r) => r.qtd },
              { header: "Preço Médio", accessor: (r) => formatNumber(r.qtd > 0 ? r.valor / r.qtd : 0, { decimals: 2 }) },
              { header: "Valor Total", accessor: (r) => formatNumber(r.valor, { decimals: 2 }) },
            ]}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3 font-medium">Modelo</th>
              <th className="px-6 py-3 font-medium text-center">Unidades Vendidas</th>
              <th className="px-6 py-3 font-medium text-right">Preço Médio</th>
              <th className="px-6 py-3 font-medium text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((model, index) => {
              const ticketMedio = model.qtd > 0 ? model.valor / model.qtd : 0;
              
              return (
                <tr key={index} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                    {model.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                      {model.qtd}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {fmtBRL(ticketMedio)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-foreground group-hover:text-emerald-500 transition-colors">
                    {fmtBRL(model.valor)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}