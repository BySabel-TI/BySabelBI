"use client";

import React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO,
  getDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

interface DailyData {
  day: string;  // Formato "dd" ou "yyyy-MM-dd"
  vendas: number;
}

interface BCICalendarProps {
  data: DailyData[];
  currentDate: Date; // Para saber qual mês desenhar
}

export function BCICalendar({ data, currentDate }: BCICalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Helper para buscar dados do dia
  const getDataForDay = (date: Date) => {
    // Tenta encontrar por dia exato (se os dados vierem completos) ou apenas pelo dia do mês
    const dayStr = format(date, "dd");
    return data.find(d => d.day === dayStr || d.day === format(date, "yyyy-MM-dd"));
  };

  // Lógica de Cores BCI (Baseada na imagem: Vermelho < Laranja < Amarelo < Verde)
  // Como não temos a meta diária exata, vamos usar faixas relativas ou fixas por enquanto.
  // Idealmente, isso viria da meta. Vamos assumir um baseline razoável para motos (ex: 1 por dia é pouco, 5 é bom?)
  // Ajustando para um scale que pareça com a imagem (valores entre 10 e 30)
  const getBCIColor = (count: number) => {
    if (count === 0) return "bg-background text-muted-foreground hover:bg-muted"; // Sem vendas
    if (count < 12) return "bg-red-500 text-white hover:bg-red-600";
    if (count < 16) return "bg-orange-500 text-white hover:bg-orange-600";
    if (count < 22) return "bg-yellow-400 text-yellow-950 hover:bg-yellow-500";
    return "bg-emerald-500 text-white hover:bg-emerald-600";
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <CalendarIcon size={18} className="text-shineray-red" />
          Calendário de Vendas (BCI)
        </h3>
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-0">
        {/* Header da Semana */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-muted-foreground uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const dayData = getDataForDay(day);
            const count = dayData?.vendas || 0;
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all min-h-[48px] border border-transparent",
                  !isCurrentMonth && "opacity-30 grayscale",
                  isCurrentMonth && "cursor-pointer",
                  isCurrentMonth ? getBCIColor(count) : "bg-muted/20 text-muted-foreground"
                )}
                title={`${format(day, "dd/MM/yyyy")}: ${count} vendas`}
              >
                <div className="absolute top-1 right-2 text-[10px] font-medium opacity-50">
                  {format(day, "d")}
                </div>
                
                {isCurrentMonth && count > 0 && (
                  <span className="text-lg font-bold mt-2">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda simples */}
        <div className="flex items-center gap-4 mt-4 justify-center text-xs text-muted-foreground">
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Crítico</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Atenção</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> Bom</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Ótimo</div>
        </div>
      </div>
    </div>
  );
}
