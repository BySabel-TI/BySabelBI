"use client";

import * as React from "react";
import { format, subDays, startOfMonth, startOfYear, endOfMonth, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Assumindo que você tem componentes UI básicos
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFilterStore } from "@/store/useFilterStore";

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  // Conecta com o Zustand Global
  const { periodo, setPeriodo } = useFilterStore();
  
  // Estado local para o calendário (antes de aplicar)
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: periodo.from,
    to: periodo.to,
  });

  // Sincroniza estado local quando o global muda
  React.useEffect(() => {
    setDate({ from: periodo.from, to: periodo.to });
  }, [periodo]);

  // Função para aplicar a data no sistema
  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      setPeriodo({ from: newDate.from, to: newDate.to });
    }
  };

  // Atalhos Rápidos (Presets)
  const presets = [
    {
      label: "Hoje",
      getValue: () => ({ from: new Date(), to: new Date() }),
    },
    {
      label: "Ontem",
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      label: "Últimos 7 dias",
      getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
      label: "Este Mês",
      getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }),
    },
    {
      label: "Mês Passado",
      getValue: () => {
        const lastMonth = subDays(startOfMonth(new Date()), 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
    },
    {
      label: "Ano Atual (2026)",
      getValue: () => ({ from: startOfYear(new Date()), to: new Date() }),
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-shineray-red" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/y")} -{" "}
                  {format(date.to, "dd/MM/y")}
                </>
              ) : (
                format(date.from, "dd/MM/y")
              )
            ) : (
              <span>Selecione uma data</span>
            )}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="end">
          <div className="flex">
            {/* Barra Lateral de Atalhos */}
            <div className="flex flex-col gap-1 p-2 border-r border-zinc-800 bg-zinc-900/50 min-w-[140px]">
              <span className="text-[10px] font-bold text-zinc-500 uppercase px-2 py-1 mb-1">Período Rápido</span>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleSelect(preset.getValue())}
                  className="text-xs text-left px-2 py-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* O Calendário Visual */}
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={ptBR}
                className="bg-zinc-950 text-zinc-200"
                classNames={{
                  day_selected: "bg-shineray-red text-white hover:bg-red-700 hover:text-white focus:bg-red-700 focus:text-white",
                  day_today: "bg-zinc-800 text-zinc-100",
                  day_outside: "text-zinc-700 opacity-50",
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}