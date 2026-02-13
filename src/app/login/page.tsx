"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Schema de Validação
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await signIn(data.email, data.password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/geral");
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-shineray-red/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-tr from-shineray-red to-red-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-red-900/20 mb-4 transform rotate-3">
             <span className="text-white font-bold text-2xl tracking-tighter italic">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Acesse o painel administrativo da Shineray
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 ml-1">E-mail Corporativo</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-shineray-red transition-colors" size={18} />
              <input 
                {...register("email")}
                type="email" 
                placeholder="seunome@shineray.com"
                className={cn(
                  "w-full bg-zinc-950/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-shineray-red/50 focus:ring-1 focus:ring-shineray-red/50 transition-all",
                  errors.email && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                )}
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
             <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-zinc-300">Senha de Acesso</label>
                <Link href="/forgot-password" className="text-xs text-shineray-red hover:text-red-400 transition-colors">
                  Esqueceu a senha?
                </Link>
             </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-shineray-red transition-colors" size={18} />
              <input 
                {...register("password")}
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className={cn(
                  "w-full bg-zinc-950/50 border border-zinc-800 rounded-lg pl-10 pr-10 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-shineray-red/50 focus:ring-1 focus:ring-shineray-red/50 transition-all",
                  errors.password && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500 ml-1">{errors.password.message}</span>}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 text-center animate-in shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-shineray-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Validando...
              </>
            ) : (
              "Entrar no Dashboard"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
            <p className="text-xs text-zinc-500">
                &copy; 2026 Shineray do Brasil. Todos os direitos reservados.
            </p>
        </div>

      </div>
    </div>
  );
}
