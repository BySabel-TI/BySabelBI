"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useFilterStore } from "@/store/useFilterStore";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { setUserAccess } = useFilterStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
       if (!isAuthenticated) {
         router.push("/login");
       } else if (user) {
         // Sincroniza permissões com a Store de Filtros
         setUserAccess(user.role, user.branchId);
       }
    }
  }, [isLoading, isAuthenticated, user, router, setUserAccess]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-shineray-red" size={48} />
      </div>
    );
  }

  // Se não estiver autenticado (e já parou de carregar), não renderiza nada enquanto redireciona
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
