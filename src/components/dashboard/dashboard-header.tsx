"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, RefreshCw } from "lucide-react";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { FilialSelect } from "@/components/dashboard/filial-select";
import { ThemeToggle } from "@/components/providers/theme-toggle"; 
import { useAuth } from "@/contexts/auth-context";
import { getUserRoleLabel } from "@/lib/auth-utils";
import { useFilterStore } from "@/store/useFilterStore";
import { clearSalesCache, getLastFetchTimestamp } from "@/services/sales-service";
import { format } from "date-fns";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const triggerRefresh = useFilterStore((state) => state.triggerRefresh);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Atualiza o timestamp quando novos dados são carregados
  useEffect(() => {
    const updateTime = () => {
      const ts = getLastFetchTimestamp();
      if (ts) {
        setLastUpdated(format(ts, "HH:mm:ss"));
      } else {
        setLastUpdated(format(new Date(), "HH:mm:ss"));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearSalesCache();
    triggerRefresh();
    setTimeout(() => {
      const ts = getLastFetchTimestamp() || new Date();
      setLastUpdated(format(ts, "HH:mm:ss"));
      setIsRefreshing(false);
    }, 600);
  };

  // Define o título baseado na URL atual
  const getPageTitle = () => {
    if (pathname.includes("/filiais")) return "Filiais & Unidades";
    if (pathname.includes("/vendedores")) return "Time de Vendas";
    if (pathname.includes("/estoque")) return "Gestão de Estoque";
    if (pathname.includes("/funcionarios")) return "Gestão de Funcionários";
    if (pathname.includes("/perfil")) return "Meu Perfil";
    return "Visão Geral";
  };

  const getPageSubtitle = () => {
    if (pathname.includes("/filiais")) return "Comparativo e performance individual";
    if (pathname.includes("/vendedores")) return "Desempenho por vendedor e filial";
    if (pathname.includes("/estoque")) return "Controle de modelos e pátios";
    if (pathname.includes("/funcionarios")) return "Cadastro e vinculação de vendedores";
    return "Acompanhamento em tempo real";
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col md:flex-row h-auto md:h-16 items-start md:items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl transition-colors duration-300">
      
      {/* Título Dinâmico & Timestamp */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          {getPageTitle()}
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getPageSubtitle()}</span>
          {lastUpdated && (
            <>
              <span>•</span>
              <span className="font-mono text-[11px] text-muted-foreground/80">
                Atualizado às {lastUpdated}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Área de Ações e Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        
        {/* Seletor de Filial (admin/diretor livre, gerente travado, vendedor oculto) */}
        <FilialSelect />

        {/* 2. Seletor de Datas (Conectado à Store) */}
        <CalendarDateRangePicker />

        {/* Divisor Visual (Oculto no mobile) */}
        <div className="hidden sm:block w-px h-6 bg-border mx-1"></div>

        {/* Grupo de Ações de Sistema */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          
          {/* Botão de Refresh Real */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border disabled:opacity-50"
            title="Atualizar dados (Ignorar cache)"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-shineray-red" : ""} />
          </button>

          {/* 3. Botão de Tema */}
          <ThemeToggle />

          {/* Botão de Notificação */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
              title="Notificações"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-shineray-red rounded-full ring-2 ring-background"></span>
            </button>

            {/* Popover Simples de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Notificações</h4>
                  <span className="text-[10px] bg-shineray-red/10 text-shineray-red font-semibold px-2 py-0.5 rounded-full">
                    Sistema OK
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conexão ativa com o ERP Microwork Cloud. Todas as filiais sincronizadas.
                </p>
              </div>
            )}
          </div>

          {/* Avatar do Usuário */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
             <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-foreground leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  {getUserRoleLabel(user?.role)}
                </p>
             </div>
             <Link href="/dashboard/perfil">
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 border border-border flex items-center justify-center text-muted-foreground shadow-sm group relative cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                   <span className="font-bold text-xs">{user?.avatar || "U"}</span>
                </div>
             </Link>
             
             <button 
               onClick={signOut}
               className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
               title="Sair do Sistema"
             >
               <LogOut size={18} />
             </button>
          </div>
        </div>

      </div>
    </header>
  );
}