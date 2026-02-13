"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface ComparisonData {
  monthName: string;    // "jan"
  anoAtual: number;     // Valor 2026
  anoAnterior: number;  // Valor 2025
  yearCurrent: number;
  yearPrev: number;
}

interface MonthlyBarChartProps {
  data?: ComparisonData[];
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2">
        <span>Sem dados comparativos</span>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    return value.toString();
  };

  const fmtValue = (val: number) => `${val} motos`;

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
          
          <XAxis 
            dataKey="monthName" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)} // Capitaliza (Jan)
          />

          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))', 
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
            // Custom Tooltip para mostrar evolução
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const current = payload.find(p => p.dataKey === 'anoAtual')?.value as number || 0;
                const prev = payload.find(p => p.dataKey === 'anoAnterior')?.value as number || 0;
                const years = payload[0].payload; // Pega os anos (2025/2026)
                
                // Cálculo de Evolução
                let evolution = 0;
                if (prev > 0) evolution = ((current - prev) / prev) * 100;
                const isPositive = evolution >= 0;

                return (
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-zinc-200 mb-2 capitalize">{label}</p>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-shineray-red"></div>
                      <span className="text-zinc-400">{years.yearCurrent}:</span>
                      <span className="font-mono text-white ml-auto">{fmtValue(current)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                      <span className="text-zinc-400">{years.yearPrev}:</span>
                      <span className="font-mono text-zinc-400 ml-auto">{fmtValue(prev)}</span>
                    </div>

                    {prev > 0 && (
                      <div className={`mt-2 pt-2 border-t border-zinc-800 flex justify-between font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span>Evolução:</span>
                        <span>{isPositive ? '+' : ''}{evolution.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-zinc-400 ml-1">{value}</span>}
          />

          {/* Ano Anterior (Cinza Escuro) */}
          <Bar 
            dataKey="anoAnterior" 
            name={`Ano Anterior`} 
            fill="#3f3f46" // zinc-700
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />

          {/* Ano Atual (Vermelho Shineray) */}
          <Bar 
            dataKey="anoAtual" 
            name={`Ano Atual`} 
            fill="#DC2626" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}