import { CalendarDays, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useClientEmpresa } from "@/contexts/ClientEmpresaContext";
import { useClientHistorico } from "@/hooks/use-client-portal";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  concluido: { label: "Concluído", icon: CheckCircle2, className: "bg-success/10 text-success" },
  confirmado: { label: "Confirmado", icon: Clock, className: "bg-primary/10 text-primary" },
  pendente:   { label: "Pendente",  icon: Clock,        className: "bg-warning/10 text-warning" },
  cancelado:  { label: "Cancelado", icon: XCircle,      className: "bg-destructive/10 text-destructive" },
};

export default function ClientHistoryPage() {
  const { empresa } = useClientEmpresa();
  const { data: historico = [], isLoading } = useClientHistorico(empresa?.id);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
        <h1 className="text-lg font-bold text-foreground">Meu Histórico</h1>
      </div>

      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && historico.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">
            Você ainda não tem agendamentos.
          </p>
        )}

        {historico.map((item) => {
          const config = statusConfig[item.status] || statusConfig.confirmado;
          const Icon = config.icon;
          const dataHora = parseISO(item.data_hora);
          const dataFormatada = format(dataHora, "dd/MM/yyyy", { locale: ptBR });
          const horaFormatada = format(dataHora, "HH:mm");
          const servicoNome = (item.servicos as { nome?: string } | null)?.nome || "Serviço";
          const profNome = (item.profissionais_clinica as { nome?: string } | null)?.nome || "";

          return (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">{servicoNome}</h3>
                  {profNome && <p className="text-xs text-muted-foreground mt-0.5">{profNome}</p>}
                </div>
                <Badge variant="secondary" className={cn("text-[10px] font-medium gap-1", config.className)}>
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{dataFormatada}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{horaFormatada}</span>
              </div>
              {item.observacoes && (
                <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">{item.observacoes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
