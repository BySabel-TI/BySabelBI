"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/store/useFilterStore";

export function CalendarDateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { periodo, setPeriodo } = useFilterStore();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: periodo.from,
    to: periodo.to,
  });

  // Presets de Data
  const handlePresetChange = (value: string) => {
    const today = new Date();
    let newDate: DateRange = { from: today, to: today };

    switch (value) {
      case "today":
        newDate = { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        newDate = { from: yesterday, to: yesterday };
        break;
      case "last7":
        newDate = { from: subDays(today, 7), to: today };
        break;
      case "last30":
        newDate = { from: subDays(today, 30), to: today };
        break;
      case "thisMonth":
        newDate = { from: startOfMonth(today), to: today };
        break;
      case "lastMonth":
        const lastMonthStart = startOfMonth(subMonths(today, 1));
        const lastMonthEnd = endOfMonth(subMonths(today, 1));
        newDate = { from: lastMonthStart, to: lastMonthEnd };
        break;
      case "thisYear":
        newDate = { from: startOfYear(today), to: today };
        break;
    }

    setDate(newDate);
    if (newDate.from && newDate.to) {
      setPeriodo(newDate as { from: Date; to: Date });
    }
  };

  React.useEffect(() => {
    if (date?.from && date?.to) {
      // Evita loop infinito checando se mudou
      if (date.from.getTime() !== periodo.from.getTime() || date.to.getTime() !== periodo.to.getTime()) {
         setPeriodo({ from: date.from, to: date.to });
      }
    }
  }, [date, setPeriodo, periodo]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[260px] justify-start text-left font-normal h-9",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3 border-b border-border">
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período rápido" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last7">Últimos 7 dias</SelectItem>
                <SelectItem value="last30">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este Mês</SelectItem>
                <SelectItem value="lastMonth">Mês Passado</SelectItem>
                <SelectItem value="thisYear">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range: DateRange | undefined) => setDate(range)}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}