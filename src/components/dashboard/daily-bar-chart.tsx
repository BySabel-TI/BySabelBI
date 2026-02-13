"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface DailyBarChartProps {
  data: { day: string; vendas: number; valor: number }[];
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-xs">Sem dados no período</div>;
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
          
          <XAxis 
            dataKey="day" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={5}
            interval={0} 
          />
          
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))', 
              color: 'hsl(var(--foreground))',
              borderRadius: '8px'
            }}
            labelFormatter={(label) => `Dia ${label}`}
            // CORREÇÃO AQUI: (value?: number) e fallback (value || 0)
            formatter={(value?: number) => [value || 0, 'Vendas']}
          />
          
          <Bar 
            dataKey="vendas" 
            fill="hsl(var(--primary))" 
            radius={[2, 2, 0, 0]}
            fillOpacity={0.7}
            activeBar={{ fillOpacity: 1 }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}