import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { NotificacoesBell } from "./NotificacoesBell";
import { EmpresaProvider } from "@/contexts/EmpresaContext";
import { NotificacoesProvider } from "@/contexts/NotificacoesContext";

export function AppLayout() {
  return (
    <EmpresaProvider>
      <NotificacoesProvider>
        <div className="min-h-screen bg-background">
          <AppSidebar />
          {/* Top bar */}
          <div className="fixed top-0 right-0 left-0 lg:left-64 h-14 bg-card/80 backdrop-blur-sm border-b border-border z-30 flex items-center justify-end px-4 lg:px-8 gap-3">
            <NotificacoesBell />
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">AD</span>
            </div>
          </div>
          <main className="lg:ml-64 min-h-screen pt-14">
            <div className="p-4 pt-6 lg:p-8 lg:pt-6">
              <Outlet />
            </div>
          </main>
        </div>
      </NotificacoesProvider>
    </EmpresaProvider>
  );
}
