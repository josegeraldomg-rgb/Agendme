import { useState } from "react";
import { cn } from "@/lib/utils";

const mockAssinaturas = [
  { id: "a1", empresa: "Clínica Beleza Pura", plano: "Profissional", status: "ativa", proxima: "25/03/2026" },
  { id: "a2", empresa: "Studio Ana Costa", plano: "Básico", status: "ativa", proxima: "01/04/2026" },
  { id: "a3", empresa: "Estética Renovar", plano: "Premium", status: "ativa", proxima: "15/04/2026" },
  { id: "a4", empresa: "Espaço Zen", plano: "Básico", status: "inadimplente", proxima: "10/03/2026" },
  { id: "a5", empresa: "BeautyCare", plano: "Básico", status: "cancelada", proxima: "—" },
  { id: "a6", empresa: "Corpo e Mente", plano: "Profissional", status: "inadimplente", proxima: "05/03/2026" },
  { id: "a7", empresa: "Clínica Vitalidade", plano: "Premium", status: "ativa", proxima: "28/03/2026" },
  { id: "a8", empresa: "Clínica Derma+", plano: "Profissional", status: "ativa", proxima: "20/04/2026" },
];

const statusStyle: Record<string, string> = {
  ativa: "bg-success/10 text-success",
  inadimplente: "bg-warning/10 text-warning",
  cancelada: "bg-destructive/10 text-destructive",
};

const filters = ["Todas", "Ativa", "Inadimplente", "Cancelada"];

export default function SaasAssinaturasPage() {
  const [filter, setFilter] = useState("Todas");

  const filtered = filter === "Todas"
    ? mockAssinaturas
    : mockAssinaturas.filter((a) => a.status === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>

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
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Plano</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Próx. Cobrança</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-medium text-foreground">{a.empresa}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{a.plano}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[a.status])}>{a.status}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{a.proxima}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
