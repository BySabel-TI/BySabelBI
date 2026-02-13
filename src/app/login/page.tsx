"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
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
      if (result && result.error) {
        setError(result.error);
      } else {
        // Sucesso
        router.push("/dashboard/geral");
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a] text-white selection:bg-shineray-red/30">
      
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 animate-gradient-slow bg-size-[400%_400%]" />
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-shineray-red/10 via-transparent to-transparent opacity-50" />
      </div>

      {/* Floating Orbs/Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-shineray-red/20 rounded-full blur-[120px] mix-blend-screen animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] mix-blend-screen animate-float-delayed" />
      </div>

      <div className="w-full relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Logo Section - Integrado e Harmônico */}
        <div className="relative z-20 flex flex-col items-center -mb-20 md:-mb-24 animate-fade-in-down">
             <div className="relative w-[500px] h-32 md:w-[700px] md:h-48 transition-transform duration-700 hover:scale-105">
                 <Image 
                   src="/logo.png" 
                   alt="Shineray By Sabel Logo" 
                   fill 
                   className="object-contain drop-shadow-[0_0_25px_rgba(220,38,38,0.3)]"
                   priority
                 />
             </div>
        </div>

        {/* Login Card - Premium Glassmorphism */}
        <div className="w-full max-w-[400px] relative z-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/80 animate-fade-in-up ring-1 ring-white/5">
          
          <div className="text-center mb-8 mt-12">
             <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-md">Bem-vindo</h1>
             <p className="text-zinc-400 font-light text-sm">Acesse o painel <span className="text-shineray-red font-semibold drop-shadow-sm">Shineray By Sabel</span></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1 uppercase tracking-wider">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl transition-all duration-300 group-hover:bg-white/10" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-shineray-red transition-colors duration-300" size={18} />
                <input 
                  {...register("email")}
                  type="email" 
                  placeholder="seu@email.com"
                  className={cn(
                    "w-full bg-transparent border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-shineray-red/50 focus:ring-1 focus:ring-shineray-red/50 transition-all duration-300 relative z-10 shadow-inner",
                    errors.email && "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                  )}
                />
              </div>
              {errors.email && <span className="text-xs text-red-400 ml-1 block animate-in slide-in-from-left-2">{errors.email?.message}</span>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Senha</label>
                <Link 
                  href="/forgot-password"
                  className="text-xs text-shineray-red hover:text-red-400 transition-colors font-medium hover:underline decoration-shineray-red/30 underline-offset-4"
                >
                  Esqueceu?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl transition-all duration-300 group-hover:bg-white/10" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-shineray-red transition-colors duration-300" size={18} />
                <input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={cn(
                    "w-full bg-transparent border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-shineray-red/50 focus:ring-1 focus:ring-shineray-red/50 transition-all duration-300 relative z-10 shadow-inner",
                    errors.password && "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors focus:outline-none z-20 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-400 ml-1 block animate-in slide-in-from-left-2">{errors.password?.message}</span>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs animate-in zoom-in-95 duration-300">
                <div className="w-1 h-8 bg-red-500 rounded-full" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative overflow-hidden bg-white text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin text-zinc-600" />
                  <span>Acessando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer inside Card */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium">
                  Sistema de Gestão Integrada
              </p>
              <p className="text-[10px] text-zinc-600">
                  &copy; {new Date().getFullYear()} Shineray By Sabel. Todos os direitos reservados.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}

