// Utilitário de exportação de dados para CSV — sem dependências externas.
// Otimizado para Excel em pt-BR: usa ";" como separador de colunas e prefixo
// BOM (UTF-8) para que acentuação e caracteres especiais sejam reconhecidos.

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

function escapeCsvValue(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  // Precisa de aspas se contiver o separador (;), aspas ou quebra de linha.
  if (/[";\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converte linhas + colunas em CSV e dispara o download no navegador.
 * @param filename nome do arquivo (extensão .csv adicionada se ausente)
 * @param rows     dados a exportar
 * @param columns  definição de cabeçalho + como extrair cada célula
 */
export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: ExportColumn<T>[]
): void {
  if (typeof window === "undefined") return;

  const headerLine = columns.map((c) => escapeCsvValue(c.header)).join(";");
  const bodyLines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(c.accessor(row))).join(";")
  );

  const BOM = String.fromCharCode(0xfeff); // Excel reconhece UTF-8 (acentuação correta)
  const csv = BOM + [headerLine, ...bodyLines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Monta um sufixo de data legível para nomes de arquivo (ex: "2026-07-23").
 */
export function fileDateSuffix(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
