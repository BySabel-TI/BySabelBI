"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const forgotSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err) {
      // Falha silenciosa ou mensagem genérica
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-shineray-red/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o Login
        </Link>
        
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">E-mail enviado!</h2>
            <p className="text-sm text-zinc-400">
              Verifique sua caixa de entrada. Enviamos um link para redefinição de senha.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Voltar para o Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="relative w-[500px] h-32 mx-auto mb-4 flex items-center justify-center">
                 <Image src="/logo.png" alt="Shineray By Sabel Logo" fill className="object-contain scale-125" priority />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Senha</h1>
              <p className="text-sm text-zinc-400 mt-2">
                Informe seu e-mail corporativo para receber as instruções.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-shineray-red hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Link de Recuperação"
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
