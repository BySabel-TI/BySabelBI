"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Package, 
  LogOut, 
  Settings,
  BarChart3,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context"; 
import { getUserRoleLabel } from "@/lib/auth-utils"; 

// --- SIDEBAR CONTEXT FOR MOBILE ---
type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

const menuItems = [
  { label: "Visão Geral", href: "/dashboard/geral", icon: LayoutDashboard },
  { label: "Filiais", href: "/dashboard/filiais", icon: Store },
  { label: "Vendedores", href: "/dashboard/vendedores", icon: Users },
  { label: "Estoque Motos", href: "/dashboard/estoque", icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 h-screen flex-col p-4 bg-background md:bg-transparent transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* O "MÓDULO" FLUTUANTE */}
        <div className="flex-1 flex flex-col rounded-2xl bg-card border border-border shadow-2xl shadow-black/5 dark:shadow-black/50 overflow-hidden relative transition-colors duration-300">
          
          {/* Efeito de Glow de Fundo */}
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-shineray-red/5 to-transparent pointer-events-none" />

          {/* === LOGO AREA === */}
          <div className="relative h-48 flex items-center justify-center px-4 border-b border-border transition-colors duration-300">
             <div className="relative w-full h-32 bg-white/90 dark:bg-white/90 backdrop-blur-md rounded-xl p-2 shadow-sm">
               <Image 
                 src="/logod.png" 
                 alt="Shineray Logo" 
                 fill
                 className="object-contain"
                 priority
               />
             </div>
             
             {/* Mobile Close Button (Absolute positioned to right) */}
             <button onClick={close} className="md:hidden absolute right-2 top-2 text-muted-foreground hover:text-foreground">
               <X size={20} />
             </button>
          </div>

          {/* === NAVIGATION === */}
          <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            <div className="px-2 mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
              Menu Principal
            </div>
            
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close} // Close on click (mobile)
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                    !isActive && "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50",
                    isActive && "text-shineray-red bg-shineray-red/10 border border-shineray-red/20 shadow-sm"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-r from-shineray-red/10 via-transparent to-transparent opacity-50" />
                  )}
                  
                  {isActive && (
                     <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-shineray-red shadow-[0_0_8px_#DC2626]"></div>
                  )}

                  <Icon 
                    size={18} 
                    className={cn(
                      "relative z-10 transition-transform duration-300",
                      isActive ? "text-shineray-red scale-110" : "text-zinc-400 group-hover:text-foreground"
                    )} 
                  />
                  
                  <span className="relative z-10 tracking-wide">{item.label}</span>

                  {(isActive) && (
                    <ChevronRight size={14} className="absolute right-3 text-shineray-red opacity-80" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* === FOOTER (USER PROFILE) === */}
          <div className="p-4 mt-auto">
            <Link href="/dashboard/perfil">
              <div className="rounded-xl bg-muted/30 border border-border p-3 hover:bg-muted/80 transition-colors duration-300 group cursor-pointer relative overflow-hidden">
                <div className="relative flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xs font-bold text-muted-foreground ring-2 ring-transparent group-hover:ring-border transition-all">
                     {user?.avatar || "U"}
                   </div>
                   <div className="flex flex-col flex-1 min-w-0">
                     <span className="text-sm font-bold text-foreground truncate transition-colors">
                       {user?.name || "Usuário"}
                     </span>
                     <span className="text-[10px] text-muted-foreground font-mono truncate uppercase">
                       {getUserRoleLabel(user?.role)}
                     </span>
                   </div>
                   <Settings size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
            
            <div className="flex justify-center mt-3">
               <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-shineray-red transition-colors uppercase tracking-widest"
                >
                 <LogOut size={12} /> Encerrar Sessão
               </button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}