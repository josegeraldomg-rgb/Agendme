import { Building2, TrendingUp, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaasKpis, useSaasReceitaMensal, useSaasEmpresasCrescimento, useSaasEmpresas } from "@/hooks/use-saas";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SaasDashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useSaasKpis();
  const { data: receitaData = [] } = useSaasReceitaMensal();
  const { data: crescimentoData = [] } = useSaasEmpresasCrescimento();
  const { data: empresas = [], isLoading: empLoading } = useSaasEmpresas();

  const recentes = empresas.slice(0, 5);

  const kpiCards = [
    { label: "Total Empresas",   value: String(kpis?.total || 0),        icon: Building2,     trend: `+${kpis?.novasMes || 0} este mês`, up: true,  color: "text-primary" },
    { label: "Empresas Ativas",  value: String(kpis?.ativas || 0),        icon: TrendingUp,    trend: `${Math.round((kpis?.ativas || 0) / Math.max(kpis?.total || 1, 1) * 100)}%`, up: true, color: "text-success" },
    { label: "Inadimplentes",    value: String(kpis?.inadimplentes || 0), icon: AlertTriangle,  trend: kpis?.inadimplentes ? "Atenção" : "OK", up: false, color: "text-warning" },
    { label: "MRR",              value: (kpis?.mrr || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), icon: DollarSign, trend: "Mês atual", up: true, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard SaaS</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5">
            {kpisLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? "text-success" : "text-warning"}`}>
                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Receita Mensal (MRR)</h2>
          {receitaData.length === 0 ? (
            <p className="text-xs text-center text-muted-foreground py-8">Sem dados de pagamento ainda.<br/>Os gráficos serão preenchidos conforme cobranças forem registradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={receitaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Crescimento de Empresas</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={crescimentoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Line type="monotone" dataKey="empresas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Acumulado" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Últimas Empresas Cadastradas</h2>
        {empLoading ? (
          <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Empresa</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Plano</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium hidden sm:table-cell">Status</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{e.nome}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground capitalize">{e.plano}</span>
                    </td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${e.status === "ativa" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{e.status}</span>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs">
                      {e.created_at ? format(parseISO(e.created_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
