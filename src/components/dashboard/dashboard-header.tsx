"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Menu } from "lucide-react";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";
import { FilialSelect } from "@/components/dashboard/filial-select";
import { ThemeToggle } from "@/components/providers/theme-toggle"; 
import { useAuth } from "@/contexts/auth-context";
import { getUserRoleLabel } from "@/lib/auth-utils";
import { useSidebar } from "@/components/layout/app-sidebar"; // Ajuste se necessário

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Define o título baseado na URL atual
  const getPageTitle = () => {
    if (pathname.includes("/filiais")) return "Filiais & Unidades";
    if (pathname.includes("/vendedores")) return "Time de Vendas";
    if (pathname.includes("/estoque")) return "Gestão de Estoque";
    return "Visão Geral"; // Padrão
  };

  const getPageSubtitle = () => {
    if (pathname.includes("/filiais")) return "Comparativo e performance individual";
    return "Acompanhamento em tempo real";
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col md:flex-row h-auto md:h-16 items-start md:items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl transition-colors duration-300">
      
      {/* Título Dinâmico */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          {getPageTitle()}
        </h1>
        <span className="text-xs text-muted-foreground">
          {getPageSubtitle()}
        </span>
      </div>

      {/* Área de Ações e Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        
        {/* 2. Seletor de Datas (Conectado à Store) */}
        <CalendarDateRangePicker />

        {/* Divisor Visual (Oculto no mobile) */}
        <div className="hidden sm:block w-px h-6 bg-border mx-1"></div>

        {/* Grupo de Ações de Sistema */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          
          {/* 3. Botão de Tema */}
          <ThemeToggle />

          {/* Botão de Notificação */}
          <button className="relative p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-shineray-red rounded-full animate-pulse ring-2 ring-background"></span>
          </button>

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