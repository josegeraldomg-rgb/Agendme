import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Users, Clock, Plus, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { useDashboardStats } from "@/hooks/use-faturas";
import { useDashboardFluxoSemanal } from "@/hooks/use-dashboard-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgendamentos } from "@/hooks/use-agendamentos";
import { format } from "date-fns";

const DashboardPage = () => {
  const { empresa } = useEmpresa();
  const { data: stats, isLoading } = useDashboardStats();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: agendamentosHoje } = useAgendamentos({ data: today });
  const [periodo, setPeriodo] = useState<"semana" | "mes">("semana");
  const { data: fluxoData = [], isLoading: fluxoLoading } = useDashboardFluxoSemanal(periodo);

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
                  <p className="text-2xl font-bold text-foreground mt-1">{stats?.agendamentosHoje || 0}</p>
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
                <p className="text-sm text-muted-foreground">Total Agendamentos</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold text-foreground mt-1">{stats?.totalAgendamentos || 0}</p>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Fluxo Financeiro</CardTitle>
              <Select value={periodo} onValueChange={(v) => setPeriodo(v as "semana" | "mes")}>
                <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {fluxoLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : fluxoData.every((d) => d.receita === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <DollarSign className="h-10 w-10 opacity-20 mb-2" />
                  <p className="text-sm">Nenhuma receita no período</p>
                  <p className="text-xs">Registre receitas no Financeiro para ver o gráfico</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fluxoData} barGap={4}>
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
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    />
                    <Bar dataKey="receita" name="Receita" fill="hsl(var(--chart-receita))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
                (agendamentosHoje || []).slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-sm font-mono font-semibold text-muted-foreground w-12">
                      {item.hora_inicio?.slice(0, 5)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.clientes?.nome || "Paciente"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.servicos?.nome} • {item.profissionais_clinica?.nome}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === "confirmado" ? "bg-success/15 text-success" :
                      item.status === "agendado" ? "bg-warning/15 text-warning" :
                      item.status === "em_atendimento" ? "bg-primary/15 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {item.status === "confirmado" ? "Confirmado" :
                       item.status === "agendado" ? "Agendado" :
                       item.status === "em_atendimento" ? "Em atendimento" :
                       item.status}
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
