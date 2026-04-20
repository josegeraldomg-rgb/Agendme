import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Home, CalendarDays, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientEmpresaProvider, useClientEmpresa } from "@/contexts/ClientEmpresaContext";

function ClientNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const navItems = [
    { icon: Home, label: "Início", path: `/app/${slug}` },
    { icon: CalendarDays, label: "Agendar", path: `/app/${slug}/agendar`, matchExact: true },
    { icon: Clock, label: "Histórico", path: `/app/${slug}/historico` },
    { icon: User, label: "Perfil", path: `/app/${slug}/perfil` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== `/app/${slug}` && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ClientNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-foreground">Empresa não encontrada</h1>
        <p className="text-muted-foreground text-sm">Verifique o link fornecido pela clínica.</p>
      </div>
    </div>
  );
}

function ClientLayoutInner() {
  const { empresa } = useClientEmpresa();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  if (!empresa) return <ClientNotFound />;

  const isLoginPage = location.pathname === `/app/${slug}/login`;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      <main className={isLoginPage ? "flex-1" : "flex-1 pb-20"}>
        <Outlet />
      </main>
      {!isLoginPage && <ClientNavBar />}
    </div>
  );
}

export function ClientLayout() {
  return (
    <ClientEmpresaProvider>
      <ClientLayoutInner />
    </ClientEmpresaProvider>
  );
}
