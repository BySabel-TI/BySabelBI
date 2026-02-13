"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Save, Search, Target, Loader2 } from "lucide-react";
import { SalesGoal, fetchGoals, upsertGoal } from "@/services/goals-service";
import { getBranchBySeller, normalizeBranchName, ID_TO_NORMALIZED_NAME } from "@/lib/seller-map";

interface GoalManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string; // Ex: "01 - Ananindeua" ou "all"
  currentMonth: Date;
  onSuccess: () => void;
  sellersList: { name: string; avatar: string }[]; // Lista de vendedores ativos para exibir
}

export function GoalManagerModal({ isOpen, onClose, branchId, currentMonth, onSuccess, sellersList }: GoalManagerModalProps) {
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadGoals();
    }
  }, [isOpen, branchId, currentMonth]);

  async function loadGoals() {
    setLoading(true);
    try {
      const data = await fetchGoals(currentMonth, branchId === 'all' ? undefined : branchId);
      // Mapeia para formato fácil de ler: { "JOAO SILVA": 50 }
      const map: Record<string, number> = {};
      data.forEach(g => {
        map[g.seller_name] = g.target_units;
      });
      setGoals(map);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Salva apenas os que tem valor > 0 ou que já existiam
      const promises = Object.entries(goals).map(([sellerName, units]) => {
         let targetBranch = branchId;
         
         // Se estiver em "Todas as Lojas", tenta descobrir a filial do vendedor
         if (targetBranch === 'all') {
            const mapped = getBranchBySeller(sellerName);
            const normalized = normalizeBranchName(mapped);
            // Tenta achar a chave no mapa de IDs (ex: "01 - Ananindeua" -> 1, mas upsertGoal espera string ou o formato que o banco usa)
            // Assumindo que o banco aceita o nome normalizado "01 - Ananindeua"
            targetBranch = normalized;
         }

         return upsertGoal({
           seller_name: sellerName,
           branch_id: targetBranch, 
           month: format(currentMonth, "yyyy-MM-dd"),
           target_units: Number(units),
           target_amount: 0 // Implementar depois se quiser financeiro
         });
      });
      
      await Promise.all(promises);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao salvar metas");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  // Filtragem local
  const filteredSellers = sellersList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="text-primary" /> 
              Gerenciar Metas
            </h2>
            <p className="text-sm text-muted-foreground">
              {branchId === 'all' ? 'Todas as Lojas' : branchId} • {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search & Toolbar */}
        <div className="p-4 border-b border-border bg-card">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
             <input 
               type="text" 
               placeholder="Buscar vendedor..." 
               className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* Lista de Vendedores */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
             filteredSellers.map(seller => (
               <div key={seller.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                      {seller.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-xs text-muted-foreground">Vendedor</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-muted-foreground text-right hidden md:block">Meta (motos):</span>
                   <input 
                     type="number" 
                     className="w-24 bg-background border border-border rounded-md px-3 py-2 text-right font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                     placeholder="0"
                     value={goals[seller.name] || ""}
                     onChange={(e) => setGoals(prev => ({ ...prev, [seller.name]: Number(e.target.value) }))}
                   />
                 </div>
               </div>
             ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/30 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar Metas
          </button>
        </div>

      </div>
    </div>
  );
}
