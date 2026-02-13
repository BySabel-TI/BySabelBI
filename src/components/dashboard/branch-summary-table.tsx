import { cn, formatBranchName } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

const SUMMARY_DATA = [
  { filial: "Matriz", qtd: 85, fat: 850000 },
  { filial: "Filial 01", qtd: 42, fat: 420000 },
  { filial: "Filial 02", qtd: 30, fat: 300000 },
  { filial: "Filial 03", qtd: 18, fat: 180000 },
];

export function BranchSummaryTable() {
  return (
    <div className="w-full h-full overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
          <tr>
            <th className="px-4 py-3 font-semibold">Filial</th>
            <th className="px-4 py-3 text-center">Qtd</th>

          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {SUMMARY_DATA.map((row) => {

            return (
              <tr key={row.filial} className="group hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-300 border-l-2 border-transparent group-hover:border-shineray-red transition-all">
                  {formatBranchName(row.filial)}
                </td>
                <td className="px-4 py-3 text-center text-zinc-400">
                  {row.qtd}
                </td>

                <td className="px-4 py-3 text-right font-medium text-zinc-200">
                  {formatCurrency(row.fat)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}