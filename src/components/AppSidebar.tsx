import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  MessageCircle,
  CalendarOff,
  Clock,
  Settings,
  Menu,
  X,
  ChevronsUpDown,
  Building2,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useEmpresa } from "@/contexts/EmpresaContext";
import logo from "@/assets/logo-agendme.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/horarios", label: "Horários", icon: Clock },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/servicos", label: "Serviços", icon: Briefcase },
  { to: "/prontuario", label: "Prontuário", icon: FileText },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/ausencias", label: "Ausências", icon: CalendarOff },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { empresa, empresas, switchEmpresa } = useEmpresa();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-card p-2 shadow-md border border-border"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col sidebar-gradient transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header — Empresa selector */}
        <div className="flex h-auto items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 w-full rounded-lg px-2 py-2 hover:bg-sidebar-accent/60 transition-colors text-left">
                <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">
                    {empresa?.nome || "Selecionar Empresa"}
                  </p>
                  <p className="text-[10px] text-sidebar-muted truncate">
                    Plano {empresa?.plano}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-sidebar-muted shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Trocar Empresa</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {empresas.map((emp) => (
                <DropdownMenuItem
                  key={emp.id}
                  onClick={() => switchEmpresa(emp.id)}
                  className={cn(
                    "gap-2 cursor-pointer",
                    empresa?.id === emp.id && "bg-accent"
                  )}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.plano}</p>
                  </div>
                  {emp.status !== "ativa" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning capitalize">
                      {emp.status}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/saas/dashboard")}
                className="gap-2 cursor-pointer text-muted-foreground"
              >
                <img src={logo} alt="Agend.me" className="h-4 w-4" />
                <span className="text-xs">Painel SaaS</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-sidebar-muted ml-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-sidebar-muted")} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/configuracoes"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
          >
            <Settings className="h-5 w-5 text-sidebar-muted" />
            Configurações
          </NavLink>
          <div className="mt-3 px-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-semibold text-sidebar-accent-foreground">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">Admin</p>
                <p className="text-xs text-sidebar-muted truncate">admin@clinica.com</p>
              </div>
              <button
                onClick={() => navigate("/saas/login")}
                className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
