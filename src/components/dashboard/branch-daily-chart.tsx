"use client";

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface BranchDailyChartProps {
  data: { day: string; vendas: number; media: number }[];
}

export function BranchDailyChart({ data }: BranchDailyChartProps) {
  if (!data || data.length === 0) return <div className="text-xs text-muted-foreground">Sem dados</div>;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          
          <XAxis 
            dataKey="day" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))', 
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
          
          <Bar 
            dataKey="vendas" 
            name="Vendas" 
            barSize={20} 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            fillOpacity={0.8}
          />
          
          <Line 
            type="monotone" 
            dataKey="media" 
            name="Média"
            stroke="#fbbf24" 
            strokeWidth={3}
            dot={false}
          />
          
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}