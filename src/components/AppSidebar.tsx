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
  Shield,
  Video,
  BarChart3,
  ChevronDown,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavGroup {
  label: string;
  items: { to: string; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/agenda", label: "Agenda", icon: Calendar },
      { to: "/horarios", label: "Horários", icon: Clock },
    ],
  },
  {
    label: "Clínica",
    items: [
      { to: "/pacientes", label: "Pacientes", icon: Users },
      { to: "/servicos", label: "Serviços", icon: Briefcase },
      { to: "/prontuario", label: "Prontuário", icon: FileText },
      { to: "/teleconsulta", label: "Teleconsulta", icon: Video },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/financeiro", label: "Financeiro", icon: DollarSign },
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { to: "/ausencias", label: "Ausências", icon: CalendarOff },
    ],
  },
  {
    label: "Administração",
    items: [
      { to: "/usuarios", label: "Permissões", icon: Shield },
    ],
  },
];

function SidebarGroup({ group, pathname, onNavigate }: { group: NavGroup; pathname: string; onNavigate: () => void }) {
  const isGroupActive = group.items.some((item) => pathname === item.to);
  const [open, setOpen] = useState<boolean>(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors">
        {group.label}
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pb-2">
        {group.items.map((item) => {
          const isActive = pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-primary" : "text-sidebar-muted")} />
              {item.label}
            </NavLink>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { empresa, empresas, switchEmpresa } = useEmpresa();

  const closeMobile = () => setMobileOpen(false);

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
          onClick={closeMobile}
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
          <button onClick={closeMobile} className="lg:hidden text-sidebar-muted ml-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navGroups.map((group) => (
            <SidebarGroup
              key={group.label}
              group={group}
              pathname={location.pathname}
              onNavigate={closeMobile}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/configuracoes"
            onClick={closeMobile}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === "/configuracoes"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className={cn("h-4.5 w-4.5", location.pathname === "/configuracoes" ? "text-primary" : "text-sidebar-muted")} />
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
