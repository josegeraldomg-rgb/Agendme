import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Clock, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Seg", receita: 1200, despesa: 400 },
  { name: "Ter", receita: 1800, despesa: 300 },
  { name: "Qua", receita: 950, despesa: 600 },
  { name: "Qui", receita: 2200, despesa: 500 },
  { name: "Sex", receita: 1600, despesa: 350 },
  { name: "Sáb", receita: 800, despesa: 200 },
];

const proximosAtendimentos = [
  { hora: "09:00", paciente: "Maria Silva", servico: "Consulta", profissional: "Dr. João", status: "confirmado" },
  { hora: "10:00", paciente: "Carlos Souza", servico: "Retorno", profissional: "Dr. João", status: "pendente" },
  { hora: "11:30", paciente: "Ana Oliveira", servico: "Avaliação", profissional: "Dra. Paula", status: "confirmado" },
  { hora: "14:00", paciente: "Pedro Santos", servico: "Fisioterapia", profissional: "Dr. Ricardo", status: "pendente" },
  { hora: "15:30", paciente: "Lucia Mendes", servico: "Consulta", profissional: "Dra. Paula", status: "confirmado" },
];

const statusColors: Record<string, string> = {
  confirmado: "bg-success/15 text-success",
  pendente: "bg-warning/15 text-warning",
  cancelado: "bg-destructive/15 text-destructive",
};

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral da sua clínica</p>
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
                <p className="text-2xl font-bold text-foreground mt-1">12</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +8% vs ontem
                </p>
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
                <p className="text-sm text-muted-foreground">Receita do Dia</p>
                <p className="text-2xl font-bold text-foreground mt-1">R$ 3.450</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +12% vs ontem
                </p>
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
                <p className="text-2xl font-bold text-foreground mt-1">284</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +3 esta semana
                </p>
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
                <p className="text-sm text-muted-foreground">Taxa de Faltas</p>
                <p className="text-2xl font-bold text-foreground mt-1">4.2%</p>
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" /> -2% vs mês anterior
                </p>
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
        {/* Chart */}
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

        {/* Upcoming */}
        <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "380ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Próximos Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximosAtendimentos.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-sm font-mono font-semibold text-muted-foreground w-12">{item.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.paciente}</p>
                    <p className="text-xs text-muted-foreground">{item.servico} • {item.profissional}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                    {item.status === "confirmado" ? "Confirmado" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
