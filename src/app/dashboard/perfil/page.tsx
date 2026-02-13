"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User, Lock } from "lucide-react";
import { updateProfile, updateUserPassword } from "@/services/profile-service";
import { cn } from "@/lib/utils";

// Schema para dados pessoais
const profileSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  avatar_url: z.string().optional(),
});

// Schema para senha
const passwordSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function PerfilPage() {
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Dados Pessoais
  const {
      register,
      handleSubmit,
      setValue,
      formState: { errors, isSubmitting: isProfileSubmitting },
    } = useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
    });

  // Form Senha
  const {
      register: registerPass,
      handleSubmit: handleSubmitPass,
      reset: resetPass,
      formState: { errors: errorsPass, isSubmitting: isPassSubmitting },
    } = useForm<PasswordForm>({
      resolver: zodResolver(passwordSchema),
    });

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      setValue("full_name", user.name);
      setValue("avatar_url", user.avatar || "");
    }
  }, [user, setValue]);

  async function onUpdateProfile(data: ProfileForm) {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      if (!user) return;
      await updateProfile(user.id, {
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        email: user.email, 
      });
      setSuccessMsg("Perfil atualizado com sucesso! (Recarregue para ver mudanças no menu)");
      // O ideal seria atualizar o contexto, mas um refresh simples resolve por enquanto ou o próprio supabase listener
    } catch (err: any) {
      setErrorMsg("Erro ao atualizar perfil: " + err.message);
    }
  }

  async function onUpdatePassword(data: PasswordForm) {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateUserPassword(data.password);
      setSuccessMsg("Senha alterada com sucesso!");
      resetPass();
    } catch (err: any) {
      setErrorMsg("Erro ao alterar senha: " + err.message);
    }
  }

  // Avatares pré-definidos (iniciais ou cores)
  const PRESET_AVATARS = ["U", "A", "G", "D", "S", "M", "R", "J"];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais e segurança.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* === CARD DADOS PESSOAIS === */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <User size={20} />
            </div>
            <h2 className="font-semibold text-lg">Informações Pessoais</h2>
          </div>

          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
            
            {/* Avatar Selection Simple */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Avatar (Exibição)</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setValue("avatar_url", av)}
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center font-bold transition-all",
                      "hover:bg-primary/20 hover:border-primary",
                      // Lógica visual simples para seleção (não perfeita sem watch, mas funcional no clique)
                      "bg-secondary border-border"
                    )}
                  >
                    {av}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center mt-2">
                 <input 
                   {...register("avatar_url")} 
                   className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm" 
                   placeholder="Ou digite Iniciais (Ex: AB)"
                   maxLength={3}
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
              <input
                {...register("full_name")}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="Seu nome"
              />
              {errors.full_name && <span className="text-xs text-red-500">{errors.full_name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                disabled
                value={user?.email || ""}
                className="w-full bg-muted border border-transparent rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <span className="text-xs text-muted-foreground">O email não pode ser alterado.</span>
            </div>

            <div className="pt-2">
               <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
               >
                 {isProfileSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 Salvar Alterações
               </button>
            </div>
          </form>
        </div>

        {/* === CARD SENHA === */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Lock size={20} />
            </div>
            <h2 className="font-semibold text-lg">Segurança</h2>
          </div>

          <form onSubmit={handleSubmitPass(onUpdatePassword)} className="space-y-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nova Senha</label>
              <input
                type="password"
                {...registerPass("password")}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="••••••"
              />
              {errorsPass.password && <span className="text-xs text-red-500">{errorsPass.password.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirmar Nova Senha</label>
              <input
                type="password"
                {...registerPass("confirmPassword")}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="••••••"
              />
              {errorsPass.confirmPassword && <span className="text-xs text-red-500">{errorsPass.confirmPassword.message}</span>}
            </div>

             <div className="pt-2">
               <button
                  type="submit"
                  disabled={isPassSubmitting}
                  className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
               >
                 {isPassSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 Redefinir Senha
               </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
