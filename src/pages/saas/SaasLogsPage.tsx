import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Activity, Database, Globe, Loader2 } from "lucide-react";
import { useSaasAuditLogs } from "@/hooks/use-saas";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const origemIcons: Record<string, React.ElementType> = {
  painel: Activity,
  api: Globe,
  agente_bolso: Database,
  webhook: Globe,
};

const filters = ["todos", "painel", "api", "webhook", "agente_bolso"];
const filterLabels: Record<string, string> = {
  todos: "Todos",
  painel: "Painel",
  api: "API",
  webhook: "Webhook",
  agente_bolso: "Agente",
};

export default function SaasLogsPage() {
  const [filter, setFilter] = useState("todos");
  const { data: logs = [], isLoading } = useSaasAuditLogs(100, filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Logs de Sistema</h1>

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
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="space-y-2">
        {!isLoading && logs.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-10">
            Nenhum log registrado ainda. As ações no sistema serão registradas automaticamente.
          </p>
        )}

        {logs.map((log) => {
          const Icon = origemIcons[log.origem || "painel"] || Activity;
          const empresaNome = (log.empresas as { nome?: string } | null)?.nome;
          const dataFormatada = log.created_at
            ? format(parseISO(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
            : "—";

          return (
            <div key={log.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">{log.acao}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {empresaNome && (
                    <span className="text-[10px] text-muted-foreground font-medium">{empresaNome}</span>
                  )}
                  {log.tabela && (
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{log.tabela}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground uppercase">{log.origem || "painel"}</span>
                  <span className="text-[10px] text-muted-foreground">{dataFormatada}</span>
                </div>
              </div>
              <div className="shrink-0">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
