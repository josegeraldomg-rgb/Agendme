import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Clock, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { useDashboardStats } from "@/hooks/use-faturas";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgendamentos } from "@/hooks/use-agendamentos";
import { format } from "date-fns";

const chartData = [
  { name: "Seg", receita: 1200, despesa: 400 },
  { name: "Ter", receita: 1800, despesa: 300 },
  { name: "Qua", receita: 950, despesa: 600 },
  { name: "Qui", receita: 2200, despesa: 500 },
  { name: "Sex", receita: 1600, despesa: 350 },
  { name: "Sáb", receita: 800, despesa: 200 },
];

const DashboardPage = () => {
  const { empresa } = useEmpresa();
  const { data: stats, isLoading } = useDashboardStats();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: agendamentosHoje } = useAgendamentos({ data_aula: today });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Página Inicial</h1>
          <p className="text-muted-foreground text-sm">Visão geral — {empresa?.nome}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in" style={{ animationDelay: "0ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold text-foreground mt-1">{agendamentosHoje?.length || 0}</p>
                )}
              </div>
              <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "80ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                {isLoading ? <Skeleton className="h-8 w-24 mt-1" /> : (
                  <p className="text-2xl font-bold text-foreground mt-1">
                    R$ {(stats?.receitaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "160ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold text-foreground mt-1">{stats?.totalClientes || 0}</p>
                )}
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: "240ms" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturas Pendentes</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold text-foreground mt-1">{stats?.faturasPendentes || 0}</p>
                )}
              </div>
              <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Fluxo Financeiro Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                    }}
                    formatter={(value: number) => `R$ ${value}`}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--chart-receita))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="hsl(var(--chart-despesa))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "380ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Agendamentos de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(agendamentosHoje || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum agendamento hoje</p>
              ) : (
                (agendamentosHoje || []).slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-sm font-mono font-semibold text-muted-foreground w-12">
                      {item.horario_inicio?.slice(0, 5)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {(item as any).turmas?.nome || "Turma"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.horario_inicio?.slice(0, 5)} — {item.horario_fim?.slice(0, 5)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === "confirmado" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}>
                      {item.status || "Agendado"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
