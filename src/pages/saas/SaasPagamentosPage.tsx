import { useState } from "react";
import { cn } from "@/lib/utils";

const mockPagamentos = [
  { id: "p1", empresa: "Clínica Beleza Pura", valor: 199.90, status: "pago", data: "25/02/2026" },
  { id: "p2", empresa: "Studio Ana Costa", valor: 99.90, status: "pago", data: "01/03/2026" },
  { id: "p3", empresa: "Estética Renovar", valor: 399.90, status: "pago", data: "15/02/2026" },
  { id: "p4", empresa: "Espaço Zen", valor: 99.90, status: "vencido", data: "10/03/2026" },
  { id: "p5", empresa: "Clínica Derma+", valor: 199.90, status: "pago", data: "20/02/2026" },
  { id: "p6", empresa: "BeautyCare", valor: 99.90, status: "vencido", data: "15/02/2026" },
  { id: "p7", empresa: "Clínica Vitalidade", valor: 399.90, status: "pendente", data: "28/03/2026" },
  { id: "p8", empresa: "Corpo e Mente", valor: 199.90, status: "vencido", data: "05/03/2026" },
];

const statusStyle: Record<string, string> = {
  pago: "bg-success/10 text-success",
  pendente: "bg-warning/10 text-warning",
  vencido: "bg-destructive/10 text-destructive",
};

const filters = ["Todos", "Pago", "Pendente", "Vencido"];

export default function SaasPagamentosPage() {
  const [filter, setFilter] = useState("Todos");

  const filtered = filter === "Todos"
    ? mockPagamentos
    : mockPagamentos.filter((p) => p.status === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>

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

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Empresa</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Valor</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-medium text-foreground">{p.empresa}</td>
                  <td className="py-3 px-4 text-primary font-semibold">R$ {p.valor.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[p.status])}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{p.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
