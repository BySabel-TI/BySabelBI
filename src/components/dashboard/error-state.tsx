"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Estado de erro amigável com opção de nova tentativa. */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-4 text-center py-16 " +
        (className || "min-h-[40vh]")
      }
    >
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="text-red-500" size={28} />
      </div>
      <div>
        <p className="font-semibold text-foreground">Não foi possível carregar os dados</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          {message || "Ocorreu um erro ao sincronizar com o Microwork Cloud."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-shineray-red hover:bg-shineray-red/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
