import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { NotificacoesBell } from "./NotificacoesBell";
import { EmpresaProvider } from "@/contexts/EmpresaContext";
import { NotificacoesProvider } from "@/contexts/NotificacoesContext";
import { WhiteLabelProvider } from "@/contexts/WhiteLabelContext";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { profile } = useAuth();
  const initials = profile?.nome
    ? profile.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <EmpresaProvider>
      <WhiteLabelProvider>
        <NotificacoesProvider>
          <div className="min-h-screen bg-background">
            <AppSidebar />
            <div className="fixed top-0 right-0 left-0 lg:left-64 h-14 bg-card/80 backdrop-blur-sm border-b border-border z-30 flex items-center justify-end px-4 lg:px-8 gap-3">
              <NotificacoesBell />
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{initials}</span>
              </div>
            </div>
            <main className="lg:ml-64 min-h-screen pt-14">
              <div className="p-4 pt-6 lg:p-8 lg:pt-6">
                <Outlet />
              </div>
            </main>
          </div>
        </NotificacoesProvider>
      </WhiteLabelProvider>
    </EmpresaProvider>
  );
}
