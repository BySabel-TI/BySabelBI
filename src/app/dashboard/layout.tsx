import { AppSidebar, SidebarProvider } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background overflow-hidden">
          {/* Sidebar Fixa a Esquerda */}
          <AppSidebar />

          {/* Área de Conteúdo (Scrollável) */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}