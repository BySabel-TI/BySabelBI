import { cn } from "@/lib/utils"; 

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  active?: boolean; 
}

export function KpiCard({ title, value, subtitle, icon, active }: KpiCardProps) {
  return (
    <div className={cn(
      "flex flex-col p-4 rounded-xl border transition-all duration-300",
      
      // MUDANÇA 1: Cores de Fundo e Texto adaptáveis
      // bg-card: Branco (Light) / Preto Zinco (Dark)
      // text-card-foreground: Preto (Light) / Branco (Dark)
      "bg-card text-card-foreground shadow-sm",
      
      active 
        ? "border-shineray-red shadow-[0_0_15px_rgba(220,38,38,0.25)] ring-1 ring-shineray-red/20" 
        : "border-border hover:border-shineray-red/50"
    )}>
      <div className="flex justify-between items-start mb-2">
        {/* MUDANÇA 2: text-muted-foreground é o cinza ideal para rótulos em qualquer tema */}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
        {icon && <div className="text-shineray-red">{icon}</div>}
      </div>
      
      <div className="mt-1">
        {/* MUDANÇA 3: Removido 'text-white' para o texto aparecer no fundo branco do Light Mode */}
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}