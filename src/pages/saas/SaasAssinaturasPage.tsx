import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSaasEmpresas } from "@/hooks/use-saas";

const statusStyle: Record<string, string> = {
  ativa: "bg-success/10 text-success",
  inadimplente: "bg-warning/10 text-warning",
  suspensa: "bg-destructive/10 text-destructive",
  cancelada: "bg-destructive/10 text-destructive",
};

const filters = ["Todas", "Ativa", "Inadimplente", "Suspensa", "Cancelada"];

export default function SaasAssinaturasPage() {
  const [filter, setFilter] = useState("Todas");
  const { data: empresas = [], isLoading } = useSaasEmpresas();

  const filtered = filter === "Todas"
    ? empresas
    : empresas.filter((e) => e.status === filter.toLowerCase());

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
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Email</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhuma assinatura encontrada.
                    </td>
                  </tr>
                )}
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{e.nome}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground capitalize">{e.plano}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[e.status] || statusStyle.cancelada)}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs hidden sm:table-cell">{e.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
