import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  FileStack,
  DollarSign,
  ScrollText,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/saas/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/saas/planos", label: "Planos", icon: CreditCard },
  { to: "/saas/empresas", label: "Empresas", icon: Building2 },
  { to: "/saas/assinaturas", label: "Assinaturas", icon: FileStack },
  { to: "/saas/pagamentos", label: "Pagamentos", icon: DollarSign },
  { to: "/saas/logs", label: "Logs", icon: ScrollText },
  { to: "/saas/permissoes", label: "Permissões", icon: ShieldCheck },
];

export function SaasSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-card p-2 shadow-md border border-border"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col sidebar-gradient transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <span className="text-lg font-bold text-sidebar-accent-foreground">Agend.me</span>
              <p className="text-[10px] text-sidebar-muted -mt-0.5">Painel SaaS</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-sidebar-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
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

        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/saas/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 text-sidebar-muted" />
            Sair
          </NavLink>
          <div className="mt-3 px-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">SA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">SaaS Admin</p>
                <p className="text-xs text-sidebar-muted truncate">admin@agend.me</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
