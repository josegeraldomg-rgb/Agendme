import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockHistory = [
  { id: "1", servico: "Limpeza de Pele", profissional: "Dra. Ana Silva", data: "18/03/2026", hora: "10:00", status: "concluido" },
  { id: "2", servico: "Peeling Químico", profissional: "Dr. Carlos Mendes", data: "15/03/2026", hora: "14:30", status: "concluido" },
  { id: "3", servico: "Botox", profissional: "Dra. Mariana Costa", data: "22/03/2026", hora: "09:00", status: "confirmado" },
  { id: "4", servico: "Depilação a Laser", profissional: "Dra. Ana Silva", data: "10/03/2026", hora: "16:00", status: "cancelado" },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  concluido: { label: "Concluído", icon: CheckCircle2, className: "bg-success/10 text-success" },
  confirmado: { label: "Confirmado", icon: Clock, className: "bg-primary/10 text-primary" },
  cancelado: { label: "Cancelado", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

export default function ClientHistoryPage() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
        <h1 className="text-lg font-bold text-foreground">Meu Histórico</h1>
      </div>

      <div className="p-4 space-y-3">
        {mockHistory.map((item) => {
          const config = statusConfig[item.status] || statusConfig.concluido;
          const Icon = config.icon;
          return (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">{item.servico}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.profissional}</p>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] font-medium gap-1", config.className)}>
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{item.data}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.hora}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
