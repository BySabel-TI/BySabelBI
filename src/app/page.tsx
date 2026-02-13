import { redirect } from "next/navigation";

export default function Home() {
  // Redireciona a raiz "/" imediatamente para a visão geral
  redirect("/dashboard/geral");
}