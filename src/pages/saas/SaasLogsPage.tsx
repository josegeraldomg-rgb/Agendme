import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Webhook, MessageCircle, CreditCard } from "lucide-react";

const mockLogs = [
  { id: "l1", tipo: "asaas", descricao: "Cobrança criada para Clínica Beleza Pura — R$ 199,90", status: "sucesso", data: "21/03/2026 09:15" },
  { id: "l2", tipo: "whatsapp", descricao: "Lembrete enviado para paciente Maria — Clínica Beleza Pura", status: "sucesso", data: "21/03/2026 08:00" },
  { id: "l3", tipo: "asaas", descricao: "Falha ao processar pagamento — Espaço Zen (cartão recusado)", status: "erro", data: "20/03/2026 14:30" },
  { id: "l4", tipo: "webhook", descricao: "Webhook ASAAS recebido — payment_confirmed — Clínica Derma+", status: "sucesso", data: "20/03/2026 10:22" },
  { id: "l5", tipo: "whatsapp", descricao: "Erro ao enviar confirmação — Corpo e Mente (número inválido)", status: "erro", data: "19/03/2026 16:45" },
  { id: "l6", tipo: "asaas", descricao: "Assinatura atualizada — Studio Ana Costa → Profissional", status: "sucesso", data: "19/03/2026 11:00" },
  { id: "l7", tipo: "webhook", descricao: "Webhook ASAAS recebido — subscription_cancelled — BeautyCare", status: "sucesso", data: "18/03/2026 09:05" },
  { id: "l8", tipo: "asaas", descricao: "Cobrança vencida — Corpo e Mente — R$ 199,90", status: "erro", data: "17/03/2026 00:01" },
];

const tipoIcons: Record<string, React.ElementType> = {
  asaas: CreditCard,
  whatsapp: MessageCircle,
  webhook: Webhook,
};

const filters = ["Todos", "Sucesso", "Erro"];

export default function SaasLogsPage() {
  const [filter, setFilter] = useState("Todos");

  const filtered = filter === "Todos"
    ? mockLogs
    : mockLogs.filter((l) => l.status === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Logs de Integração</h1>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((log) => {
          const Icon = tipoIcons[log.tipo] || Webhook;
          return (
            <div key={log.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                log.status === "sucesso" ? "bg-success/10" : "bg-destructive/10"
              )}>
                <Icon className={cn("h-4 w-4", log.status === "sucesso" ? "text-success" : "text-destructive")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{log.descricao}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">{log.tipo}</span>
                  <span className="text-[10px] text-muted-foreground">{log.data}</span>
                </div>
              </div>
              <div className="shrink-0">
                {log.status === "sucesso" ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
