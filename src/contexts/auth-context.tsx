"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User as DashboardUser, AuthContextType, UserRole } from "@/types/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { loadSellerBranchMap } from "@/services/employees-service";

// Estendemos o tipo User padrão para incluir role do profile
interface UserProfile extends DashboardUser {
  branch_access?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuta mudanças de auth (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session);
      } else {
        setUser(null);
        setLoading(false);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchProfile(session: Session) {
    try {
      // Carrega em paralelo: perfil do usuário + mapa vendedor→filial (global).
      const [{ data: profile, error }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle(), // maybeSingle para não estourar erro se não existir
        loadSellerBranchMap(), // popula o override do seller-map (fallback estático se falhar)
      ]);

      if (error) {
        console.error("Erro Supabase:", error);
        throw error;
      }

      // Se não tiver perfil ainda (trigger falhou ou delay), usa dados da sessão
      const finalRole = profile?.role ? (profile.role as UserRole) : "seller";

      setUser({
        id: session.user.id,
        email: session.user.email!,
        name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email!,
        role: finalRole,
        avatar: profile?.avatar_url || "U",
        branchId: profile?.branch_id ?? undefined,
        sellerName: profile?.seller_name ?? undefined,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil (Catch):", JSON.stringify(error, null, 2));
      
      // Fallback para não travar o app
      setUser({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.email?.split("@")[0] || "Usuário",
        role: "seller",
        avatar: "U",
      });

    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading: loading,
        signIn, 
        signOut,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Helpers
function translateAuthError(msg: string) {
  if (msg.includes("Invalid login credentials")) return "Email ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Email não confirmado.";
  return "Erro ao realizar login. Tente novamente.";
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
