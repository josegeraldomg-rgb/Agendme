import { Building2, TrendingUp, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const kpis = [
  { label: "Total Empresas", value: "142", icon: Building2, trend: "+8", up: true, color: "text-primary" },
  { label: "Empresas Ativas", value: "128", icon: TrendingUp, trend: "+5", up: true, color: "text-success" },
  { label: "Inadimplentes", value: "9", icon: AlertTriangle, trend: "+2", up: false, color: "text-warning" },
  { label: "MRR", value: "R$ 42.600", icon: DollarSign, trend: "+12%", up: true, color: "text-primary" },
];

const revenueData = [
  { mes: "Jan", receita: 28000 }, { mes: "Fev", receita: 31000 }, { mes: "Mar", receita: 33500 },
  { mes: "Abr", receita: 35200 }, { mes: "Mai", receita: 38000 }, { mes: "Jun", receita: 42600 },
];

const growthData = [
  { mes: "Jan", empresas: 98 }, { mes: "Fev", empresas: 105 }, { mes: "Mar", empresas: 112 },
  { mes: "Abr", empresas: 122 }, { mes: "Mai", empresas: 134 }, { mes: "Jun", empresas: 142 },
];

const recentCompanies = [
  { nome: "Clínica Beleza Pura", plano: "Profissional", data: "18/03/2026" },
  { nome: "Studio Ana Costa", plano: "Básico", data: "15/03/2026" },
  { nome: "Estética Renovar", plano: "Premium", data: "12/03/2026" },
  { nome: "Espaço Zen", plano: "Básico", data: "10/03/2026" },
  { nome: "Clínica Derma+", plano: "Profissional", data: "08/03/2026" },
];

export default function SaasDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard SaaS</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? "text-success" : "text-destructive"}`}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Receita Mensal (MRR)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Crescimento de Empresas</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Line type="monotone" dataKey="empresas" stroke="hsl(var(--chart-confirmado))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-confirmado))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Últimas Empresas Cadastradas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs text-muted-foreground font-medium">Empresa</th>
                <th className="text-left py-2 text-xs text-muted-foreground font-medium">Plano</th>
                <th className="text-left py-2 text-xs text-muted-foreground font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {recentCompanies.map((c, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{c.nome}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">{c.plano}</span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{c.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
