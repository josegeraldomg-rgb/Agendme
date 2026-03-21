import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Eye, CheckCheck, Clock, Calendar, DollarSign, MessageCircle, Settings, Megaphone } from "lucide-react";
import { useNotificacoes, NotificacaoTipo } from "@/contexts/NotificacoesContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tipoIcons: Record<NotificacaoTipo, typeof Bell> = {
  sistema: Settings,
  agenda: Calendar,
  financeiro: DollarSign,
  whatsapp: MessageCircle,
  administrativo: Megaphone,
};

const tipoColor: Record<NotificacaoTipo, string> = {
  sistema: "bg-muted text-muted-foreground",
  agenda: "bg-primary/15 text-primary",
  financeiro: "bg-success/15 text-success",
  whatsapp: "bg-success/15 text-success",
  administrativo: "bg-warning/15 text-warning",
};

export function NotificacoesBell() {
  const { notificacoes, unreadCount, marcarLida, marcarTodasLidas } = useNotificacoes();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = notificacoes.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-destructive-foreground px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[380px] bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={marcarTodasLidas} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" /> Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Sem notificações</div>
            ) : (
              recent.map(n => {
                const Icon = tipoIcons[n.tipo];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/50 ${n.status === "nao_lida" ? "bg-accent/20" : ""}`}
                    onClick={() => { marcarLida(n.id); }}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${tipoColor[n.tipo]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-semibold text-foreground truncate ${n.status === "nao_lida" ? "" : "opacity-60"}`}>{n.titulo}</p>
                        {n.status === "nao_lida" && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.mensagem}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {n.criadoEm}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border">
            <button
              onClick={() => { setOpen(false); navigate("/notificacoes"); }}
              className="text-xs text-primary hover:underline w-full text-center"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
