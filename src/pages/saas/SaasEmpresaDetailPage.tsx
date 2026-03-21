import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Phone, CreditCard, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

const empresas: Record<string, { nome: string; email: string; telefone: string; plano: string; status: string; proxima_cobranca: string; criado_em: string }> = {
  e1: { nome: "Clínica Beleza Pura", email: "contato@belezapura.com", telefone: "(11) 3333-4444", plano: "Profissional", status: "ativa", proxima_cobranca: "25/03/2026", criado_em: "18/01/2026" },
  e2: { nome: "Studio Ana Costa", email: "ana@studio.com", telefone: "(21) 2222-5555", plano: "Básico", status: "ativa", proxima_cobranca: "01/04/2026", criado_em: "10/02/2026" },
  e3: { nome: "Estética Renovar", email: "admin@renovar.com", telefone: "(31) 8888-9999", plano: "Premium", status: "ativa", proxima_cobranca: "15/04/2026", criado_em: "12/03/2026" },
  e4: { nome: "Espaço Zen", email: "contato@zen.com", telefone: "(11) 7777-1111", plano: "Básico", status: "inadimplente", proxima_cobranca: "10/03/2026", criado_em: "05/12/2025" },
  e5: { nome: "Clínica Derma+", email: "adm@dermaplus.com", telefone: "(41) 6666-2222", plano: "Profissional", status: "ativa", proxima_cobranca: "20/04/2026", criado_em: "08/03/2026" },
  e6: { nome: "BeautyCare", email: "info@beautycare.com", telefone: "(51) 5555-3333", plano: "Básico", status: "suspensa", proxima_cobranca: "—", criado_em: "20/08/2025" },
  e7: { nome: "Clínica Vitalidade", email: "contato@vitalidade.com", telefone: "(11) 4444-6666", plano: "Premium", status: "ativa", proxima_cobranca: "28/03/2026", criado_em: "15/01/2026" },
  e8: { nome: "Corpo e Mente", email: "admin@corpoemente.com", telefone: "(21) 9999-8888", plano: "Profissional", status: "inadimplente", proxima_cobranca: "05/03/2026", criado_em: "22/11/2025" },
};

const statusStyle: Record<string, string> = {
  ativa: "bg-success/10 text-success",
  inadimplente: "bg-warning/10 text-warning",
  suspensa: "bg-destructive/10 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
};

export default function SaasEmpresaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const empresa = empresas[id || ""];
  const [status, setStatus] = useState(empresa?.status || "");

  if (!empresa) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Empresa não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/saas/empresas")}>Voltar</Button>
      </div>
    );
  }

  const handleSuspend = () => {
    setStatus("suspensa");
    toast({ title: "Empresa suspensa", description: "O acesso foi bloqueado." });
  };

  const handleReactivate = () => {
    setStatus("ativa");
    toast({ title: "Empresa reativada! ✅" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/saas/empresas")} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{empresa.nome}</h1>
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle[status])}>{status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Dados da Empresa</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">{empresa.nome}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{empresa.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{empresa.telefone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Cadastrada em {empresa.criado_em}</span>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Plano e Assinatura</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">Plano: <strong>{empresa.plano}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Próxima cobrança: {empresa.proxima_cobranca}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl text-xs">Alterar Plano</Button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Ações</h2>
        <div className="flex flex-wrap gap-3">
          {status !== "suspensa" && status !== "cancelada" && (
            <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleSuspend}>
              Suspender Empresa
            </Button>
          )}
          {status === "suspensa" && (
            <Button size="sm" className="rounded-xl" onClick={handleReactivate}>
              Reativar Empresa
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-xl">Alterar Plano</Button>
        </div>
      </div>
    </div>
  );
}
