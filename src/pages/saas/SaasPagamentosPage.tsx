import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSaasPagamentos } from "@/hooks/use-saas";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusStyle: Record<string, string> = {
  pago: "bg-success/10 text-success",
  pendente: "bg-warning/10 text-warning",
  vencido: "bg-destructive/10 text-destructive",
  cancelado: "bg-muted text-muted-foreground",
};

const filters = ["todos", "pago", "pendente", "vencido"];
const filterLabels: Record<string, string> = { todos: "Todos", pago: "Pago", pendente: "Pendente", vencido: "Vencido" };

export default function SaasPagamentosPage() {
  const [filter, setFilter] = useState("todos");
  const { data: pagamentos = [], isLoading } = useSaasPagamentos(filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Pagamentos SaaS</h1>
        <p className="text-xs text-muted-foreground">
          Cobranças registradas via Mercado Pago ou manualmente
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border capitalize",
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

      {!isLoading && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Empresa</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Plano</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Valor</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Vencimento</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                      Nenhum pagamento registrado ainda.
                      <br />
                      <span className="text-xs">Os registros aparecerão após cobranças via Mercado Pago ou registros manuais.</span>
                    </td>
                  </tr>
                )}
                {pagamentos.map((p) => {
                  const nomeEmpresa = (p.empresas as { nome?: string } | null)?.nome || "—";
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium text-foreground">{nomeEmpresa}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground capitalize">{p.plano}</span>
                      </td>
                      <td className="py-3 px-4 text-primary font-semibold">
                        R$ {Number(p.valor).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[p.status] || statusStyle.cancelado)}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">
                        {p.data_vencimento ? format(parseISO(p.data_vencimento), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">
                        {p.data_pagamento ? format(parseISO(p.data_pagamento), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
