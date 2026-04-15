import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSaasEmpresas } from "@/hooks/use-saas";

const statusStyle: Record<string, string> = {
  ativa: "bg-success/10 text-success",
  inadimplente: "bg-warning/10 text-warning",
  suspensa: "bg-destructive/10 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
};

export default function SaasEmpresasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: empresas = [], isLoading } = useSaasEmpresas(search);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Gestão de Empresas</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 rounded-xl"
        />
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
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Plano</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {empresas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhuma empresa encontrada.
                    </td>
                  </tr>
                )}
                {empresas.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/saas/empresa/${emp.id}`)}
                    className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{emp.nome}</span>
                          <p className="text-xs text-muted-foreground">{emp.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{emp.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground capitalize">{emp.plano}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[emp.status] || statusStyle.cancelada)}>
                        {emp.status}
                      </span>
                    </td>
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
