"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { Store, ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ID_TO_NORMALIZED_NAME } from "@/lib/seller-map";

export function FilialSelect() {
  const { filial, setFilial, userRole } = useFilterStore();
  const isLocked = userRole === 'manager';

  // Gera a lista dinamicamente baseada na constante oficial
  const filiais = [
    { id: "all", name: "Todas as Lojas" },
    ...Object.entries(ID_TO_NORMALIZED_NAME)
      .filter(([id]) => id !== "99") // Ignora "Sem Loja"
      .map(([id, name]) => ({ id, name }))
  ];

  return (
    <div className="relative w-full md:w-[220px]">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
        {isLocked ? <Lock size={14} className="text-shineray-red" /> : <Store size={16} />}
      </div>

      <select
        value={filial}
        disabled={isLocked}
        onChange={(e) => setFilial(e.target.value)}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-input",
          "bg-background text-foreground pl-10 pr-8 text-sm",
          "shadow-sm transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "hover:bg-accent hover:text-accent-foreground",
          isLocked && "opacity-80 cursor-not-allowed bg-muted text-muted-foreground border-dashed"
        )}
      >
        {filiais.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {!isLocked && <ChevronDown size={14} className="opacity-50" />}
      </div>
    </div>
  );
}