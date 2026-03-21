import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockEmpresas = [
  { id: "e1", nome: "Clínica Beleza Pura", slug: "beleza-pura", email: "contato@belezapura.com", plano: "Profissional", status: "ativa" as const, proxima_cobranca: "25/03/2026" },
  { id: "e2", nome: "Studio Ana Costa", slug: "studio-ana", email: "ana@studio.com", plano: "Básico", status: "ativa" as const, proxima_cobranca: "01/04/2026" },
  { id: "e3", nome: "Estética Renovar", slug: "estetica-renovar", email: "admin@renovar.com", plano: "Premium", status: "ativa" as const, proxima_cobranca: "15/04/2026" },
  { id: "e4", nome: "Espaço Zen", slug: "espaco-zen", email: "contato@zen.com", plano: "Básico", status: "inadimplente" as const, proxima_cobranca: "10/03/2026" },
  { id: "e5", nome: "Clínica Derma+", slug: "derma-plus", email: "adm@dermaplus.com", plano: "Profissional", status: "ativa" as const, proxima_cobranca: "20/04/2026" },
  { id: "e6", nome: "BeautyCare", slug: "beautycare", email: "info@beautycare.com", plano: "Básico", status: "suspensa" as const, proxima_cobranca: "—" },
  { id: "e7", nome: "Clínica Vitalidade", slug: "vitalidade", email: "contato@vitalidade.com", plano: "Premium", status: "ativa" as const, proxima_cobranca: "28/03/2026" },
  { id: "e8", nome: "Corpo e Mente", slug: "corpo-mente", email: "admin@corpoemente.com", plano: "Profissional", status: "inadimplente" as const, proxima_cobranca: "05/03/2026" },
];

const statusStyle: Record<string, string> = {
  ativa: "bg-success/10 text-success",
  inadimplente: "bg-warning/10 text-warning",
  suspensa: "bg-destructive/10 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
};

export default function SaasEmpresasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockEmpresas.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Gestão de Empresas</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 rounded-xl" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Empresa</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Plano</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Próx. Cobrança</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
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
                      <span className="font-medium text-foreground">{emp.nome}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{emp.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{emp.plano}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[emp.status])}>{emp.status}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{emp.proxima_cobranca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
