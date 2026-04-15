import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3, TrendingUp, TrendingDown, Users, Calendar, DollarSign,
  Download, FileText, FileSpreadsheet, FileDown, Activity, Target,
  UserCheck, Clock, ArrowUpRight, ArrowDownRight, PieChart,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { useRelatoriosKpis, useReceitaMensal, useDesempenhoProfissionais } from "@/hooks/use-relatorios";


// --- Mock Data ---
const receitaMensal = [
  { mes: "Jan", receita: 42500, despesa: 18200 },
  { mes: "Fev", receita: 38900, despesa: 17800 },
  { mes: "Mar", receita: 51200, despesa: 19500 },
  { mes: "Abr", receita: 47800, despesa: 18900 },
  { mes: "Mai", receita: 55300, despesa: 20100 },
  { mes: "Jun", receita: 61400, despesa: 21300 },
];

const ocupacaoSemanal = [
  { dia: "Seg", ocupacao: 85 },
  { dia: "Ter", ocupacao: 92 },
  { dia: "Qua", ocupacao: 78 },
  { dia: "Qui", ocupacao: 95 },
  { dia: "Sex", ocupacao: 88 },
  { dia: "Sáb", ocupacao: 65 },
];

const profissionaisDesempenho = [
  { nome: "Dr. Carlos Silva", atendimentos: 142, receita: 28400, comissao: 8520, taxa: 94 },
  { nome: "Dra. Ana Souza", atendimentos: 128, receita: 25600, comissao: 7680, taxa: 91 },
  { nome: "Dr. Pedro Lima", atendimentos: 115, receita: 23000, comissao: 6900, taxa: 88 },
  { nome: "Dra. Maria Santos", atendimentos: 98, receita: 19600, comissao: 5880, taxa: 85 },
];

const pacientesCrescimento = [
  { mes: "Jan", novos: 32, ativos: 245, inativos: 18 },
  { mes: "Fev", novos: 28, ativos: 255, inativos: 15 },
  { mes: "Mar", novos: 41, ativos: 281, inativos: 12 },
  { mes: "Abr", novos: 35, ativos: 304, inativos: 20 },
  { mes: "Mai", novos: 45, ativos: 329, inativos: 14 },
  { mes: "Jun", novos: 52, ativos: 367, inativos: 11 },
];

const receitaPorMeio = [
  { nome: "Cartão", valor: 45200, cor: "hsl(var(--primary))" },
  { nome: "PIX", valor: 32800, cor: "hsl(var(--chart-2))" },
  { nome: "Dinheiro", valor: 12400, cor: "hsl(var(--chart-3))" },
  { nome: "Mercado Pago", valor: 8600, cor: "hsl(var(--chart-4))" },
];

const faltasMensal = [
  { mes: "Jan", faltas: 12, confirmados: 88 },
  { mes: "Fev", faltas: 8, confirmados: 92 },
  { mes: "Mar", faltas: 15, confirmados: 85 },
  { mes: "Abr", faltas: 10, confirmados: 90 },
  { mes: "Mai", faltas: 7, confirmados: 93 },
  { mes: "Jun", faltas: 5, confirmados: 95 },
];

const historico = [
  { id: "1", nome: "Financeiro Mensal - Junho", tipo: "financeiro", formato: "PDF", data: "2024-06-30" },
  { id: "2", nome: "Desempenho Profissionais - Q2", tipo: "profissional", formato: "Excel", data: "2024-06-28" },
  { id: "3", nome: "Ocupação Agenda - Junho", tipo: "agenda", formato: "CSV", data: "2024-06-25" },
  { id: "4", nome: "Pacientes Novos - Junho", tipo: "paciente", formato: "PDF", data: "2024-06-20" },
];

function KpiCard({ title, value, change, positive, icon: Icon }: {
  title: string; value: string; change: string; positive: boolean; icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className="flex items-center gap-1 text-xs">
              {positive ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-destructive" />
              )}
              <span className={positive ? "text-emerald-500" : "text-destructive"}>{change}</span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("mensal");
  const { data: kpis, isLoading: kpisLoading } = useRelatoriosKpis();
  const { data: receitaMensalData = receitaMensal } = useReceitaMensal();
  const { data: profsData } = useDesempenhoProfissionais();

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const pct = (a: number, b: number) => b === 0 ? "0%" : `${((a - b) / b * 100).toFixed(1)}%`;
  const positivo = (a: number, b: number) => a >= b;

  const chartData = receitaMensalData.length > 0 ? receitaMensalData : receitaMensal;
  const profsDisplay = profsData && profsData.length > 0 ? profsData.map(p => ({
    nome: p.nome,
    atendimentos: p.atendimentos,
    receita: 0, // receita por profissional requires join with financeiro_receitas (Épico futura)
    comissao: 0,
    taxa: p.atendimentos > 0 ? Math.round((p.atendimentos / (p.atendimentos + p.cancelamentos + 1)) * 100) : 0,
  })) : profissionaisDesempenho;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios & BI</h1>
          <p className="text-sm text-muted-foreground">Inteligência analítica para decisões estratégicas</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <KpiCard
              title="Receita Total"
              value={fmt(kpis?.receitaMes || 0)}
              change={pct(kpis?.receitaMes || 0, kpis?.receitaMesAnterior || 0)}
              positive={positivo(kpis?.receitaMes || 0, kpis?.receitaMesAnterior || 0)}
              icon={DollarSign}
            />
            <KpiCard
              title="Agendamentos"
              value={String(kpis?.agendamentosMes || 0)}
              change={pct(kpis?.agendamentosMes || 0, kpis?.agendamentosMesAnterior || 0)}
              positive={positivo(kpis?.agendamentosMes || 0, kpis?.agendamentosMesAnterior || 0)}
              icon={Activity}
            />
            <KpiCard
              title="Pacientes Ativos"
              value={String(kpis?.totalPacientes || 0)}
              change=""
              positive
              icon={Users}
            />
            <KpiCard
              title="Cancelamentos"
              value={String(kpis?.cancelamentos || 0)}
              change=""
              positive={false}
              icon={Target}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="exportar">Exportar</TabsTrigger>
        </TabsList>

        {/* Dashboard Geral */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Receita vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={receitaMensal}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="mes" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Legend />
                      <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Receita por Meio de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={receitaPorMeio} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={90} label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                        {receitaPorMeio.map((entry, i) => (
                          <Cell key={i} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Taxa de Faltas vs Confirmações (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={faltasMensal}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Area type="monotone" dataKey="confirmados" name="Confirmados %" fill="hsl(var(--primary))" fillOpacity={0.15} stroke="hsl(var(--primary))" />
                    <Area type="monotone" dataKey="faltas" name="Faltas %" fill="hsl(var(--destructive))" fillOpacity={0.15} stroke="hsl(var(--destructive))" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
              <p className="text-3xl font-bold text-foreground mt-1">R$ 297.100</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-3xl font-bold text-foreground mt-1">R$ 115.800</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">R$ 181.300</p>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Receita Mensal</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={receitaMensal}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                    <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Ticket Médio por Serviço</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: "Consulta Dermatológica", ticket: 250, total: 38 },
                  { nome: "Limpeza de Pele", ticket: 180, total: 52 },
                  { nome: "Peeling", ticket: 320, total: 28 },
                  { nome: "Botox", ticket: 450, total: 15 },
                ].map(s => (
                  <div key={s.nome} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.total} atendimentos</p>
                    </div>
                    <Badge variant="secondary">R$ {s.ticket}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda */}
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Ocupação da Agenda por Dia</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ocupacaoSemanal}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="dia" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="ocupacao" name="Ocupação" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Horários Disponíveis</p>
              <p className="text-2xl font-bold text-foreground">48</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Horários Ocupados</p>
              <p className="text-2xl font-bold text-foreground">252</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <UserCheck className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Cancelamentos</p>
              <p className="text-2xl font-bold text-destructive">18</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* Profissionais */}
        <TabsContent value="profissionais" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Desempenho por Profissional</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-center">Atendimentos</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-center">Taxa Presença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profissionaisDesempenho.map(p => (
                    <TableRow key={p.nome}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell className="text-center">{p.atendimentos}</TableCell>
                      <TableCell className="text-right">R$ {p.receita.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right">R$ {p.comissao.toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={p.taxa} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{p.taxa}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Receita por Profissional</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profissionaisDesempenho} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="nome" type="category" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                    <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pacientes */}
        <TabsContent value="pacientes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Crescimento de Pacientes</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pacientesCrescimento}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Area type="monotone" dataKey="ativos" name="Ativos" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Area type="monotone" dataKey="novos" name="Novos" fill="hsl(var(--chart-2))" fillOpacity={0.2} stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-foreground">367</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Novos (mês)</p>
              <p className="text-2xl font-bold text-foreground">52</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <TrendingDown className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">Inativos (mês)</p>
              <p className="text-2xl font-bold text-foreground">11</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* Exportar */}
        <TabsContent value="exportar" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Exportar PDF", desc: "Relatório formatado com gráficos", icon: FileText, fmt: "PDF" },
              { label: "Exportar CSV", desc: "Dados tabulares para análise", icon: FileDown, fmt: "CSV" },
              { label: "Exportar Excel", desc: "Planilha completa com abas", icon: FileSpreadsheet, fmt: "Excel" },
            ].map(e => (
              <Card key={e.fmt} className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <e.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{e.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{e.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Download className="h-3.5 w-3.5 mr-1" /> {e.fmt}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Histórico de Exportações</CardTitle>
              <CardDescription>Relatórios gerados anteriormente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.nome}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{h.tipo}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{h.formato}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{new Date(h.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
