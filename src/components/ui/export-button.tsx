"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, ExportColumn } from "@/lib/export";
import { cn } from "@/lib/utils";

interface ExportButtonProps<T> {
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Botão genérico que exporta os dados fornecidos para CSV (compatível com Excel pt-BR).
 * Fica desabilitado automaticamente quando não há linhas para exportar.
 */
export function ExportButton<T>({
  filename,
  rows,
  columns,
  label = "Exportar",
  className,
  disabled,
}: ExportButtonProps<T>) {
  const isEmpty = !rows || rows.length === 0;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isEmpty}
      onClick={() => exportToCsv(filename, rows, columns)}
      className={cn("gap-2 h-8", className)}
      title={isEmpty ? "Nada para exportar" : "Exportar para CSV (Excel)"}
    >
      <Download size={14} />
      {label}
    </Button>
  );
}
