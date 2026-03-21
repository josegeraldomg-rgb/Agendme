import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, CalendarDays, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/app" },
  { icon: CalendarDays, label: "Agendar", path: "/app/agendar", matchExact: true },
  { icon: Clock, label: "Histórico", path: "/app/historico" },
  { icon: User, label: "Perfil", path: "/app/perfil" },
];

export function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/app" && location.pathname.startsWith(item.path));
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
    </div>
  );
}
