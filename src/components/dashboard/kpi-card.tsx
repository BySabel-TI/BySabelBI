import { cn } from "@/lib/utils"; 
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  active?: boolean;
  delta?: number;
}

export function KpiCard({ title, value, subtitle, icon, active, delta }: KpiCardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;
  const isZero = delta !== undefined && delta === 0;

  return (
    <div className={cn(
      "flex flex-col p-4 rounded-xl border transition-all duration-300",
      "bg-card text-card-foreground shadow-sm",
      active 
        ? "border-shineray-red shadow-[0_0_15px_rgba(220,38,38,0.25)] ring-1 ring-shineray-red/20" 
        : "border-border hover:border-shineray-red/50"
    )}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
        {icon && <div className="text-shineray-red">{icon}</div>}
      </div>
      
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>

        {delta !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border shrink-0",
            isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            isNegative && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
            isZero && "bg-muted text-muted-foreground border-border"
          )}>
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {isZero && <Minus size={12} />}
            <span>
              {isPositive ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
            </span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}