"use client";

import { CheckCircle2, Target } from "lucide-react";

interface GoalProgressCardProps {
  currentUnits: number;
  targetUnits: number;
  label?: string; // "Meta da Loja" ou "Sua Meta"
}

export function GoalProgressCard({ currentUnits, targetUnits, label = "Meta Mensal" }: GoalProgressCardProps) {
  // Regra de Ouro: Se não tem meta definida (>0), o componente nem aparece.
  if (!targetUnits || targetUnits <= 0) return null;

  const progress = Math.min((currentUnits / targetUnits) * 100, 100);
  const isCompleted = currentUnits >= targetUnits;
  const remaining = Math.max(targetUnits - currentUnits, 0);

  return (
    <div className="relative overflow-hidden bg-card border border-border p-5 rounded-xl shadow-sm transition-all hover:border-primary/50 group">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target size={80} className="text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground">{currentUnits}</span>
              <span className="text-sm text-muted-foreground">/ {targetUnits} motos</span>
            </div>
          </div>
          
          <div className={`p-2 rounded-full ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
            {isCompleted ? <CheckCircle2 size={24} /> : <Target size={24} />}
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-xs font-medium">
          <span className={`${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
            {progress.toFixed(0)}% Concluído
          </span>
          {remaining > 0 ? (
            <span className="text-muted-foreground">Faltam {remaining}</span>
          ) : (
            <span className="text-emerald-500">Meta Batida! 🚀</span>
          )}
        </div>
      </div>
    </div>
  );
}
