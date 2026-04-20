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
  UserCheck, Clock, ArrowUpRight, ArrowDownRight, PieChart, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import {
  useRelatoriosKpis, useReceitaMensal, useDesempenhoProfissionais,
  useReceitaPorMeio, useOcupacaoSemanal, useFaltasVsConfirmacoes, usePacientesCrescimento,
} from "@/hooks/use-relatorios";


function KpiCard({ title, value, change, positive, icon: Icon, loading }: {
  title: string; value: string; change: string; positive: boolean; icon: React.ElementType; loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change && (
                <div className="flex items-center gap-1 text-xs">
                  {positive ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                  )}
                  <span className={positive ? "text-emerald-500" : "text-destructive"}>{change}</span>
                  <span className="text-muted-foreground">vs mês anterior</span>
                </div>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="h-10 w-10 opacity-20 mb-3" />
      <p className="text-sm">{text}</p>
      <p className="text-xs mt-1">Os dados serão preenchidos conforme forem registrados</p>
    </div>
  );
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("mensal");
  const { data: kpis, isLoading: kpisLoading } = useRelatoriosKpis();
  const { data: receitaMensalData = [], isLoading: receitaLoading } = useReceitaMensal();
  const { data: profsData = [], isLoading: profsLoading } = useDesempenhoProfissionais();
  const { data: receitaPorMeio = [] } = useReceitaPorMeio();
  const { data: ocupacaoData = [] } = useOcupacaoSemanal();
  const { data: faltasData = [] } = useFaltasVsConfirmacoes();
  const { data: pacientesData = [] } = usePacientesCrescimento();

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const pct = (a: number, b: number) => b === 0 ? "" : `${((a - b) / b * 100).toFixed(1)}%`;
  const positivo = (a: number, b: number) => a >= b;

  // Calcular totais reais para aba financeiro
  const receitaBruta = receitaMensalData.reduce((sum, m) => sum + (m.receita || 0), 0);

  // Pacientes stats
  const pacientesAtivos = pacientesData.length > 0 ? pacientesData[pacientesData.length - 1].ativos : 0;
  const pacientesNovos = pacientesData.length > 0 ? pacientesData[pacientesData.length - 1].novos : 0;

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
        <KpiCard
          title="Receita Total"
          value={fmt(kpis?.receitaMes || 0)}
          change={pct(kpis?.receitaMes || 0, kpis?.receitaMesAnterior || 0)}
          positive={positivo(kpis?.receitaMes || 0, kpis?.receitaMesAnterior || 0)}
          icon={DollarSign}
          loading={kpisLoading}
        />
        <KpiCard
          title="Agendamentos"
          value={String(kpis?.agendamentosMes || 0)}
          change={pct(kpis?.agendamentosMes || 0, kpis?.agendamentosMesAnterior || 0)}
          positive={positivo(kpis?.agendamentosMes || 0, kpis?.agendamentosMesAnterior || 0)}
          icon={Activity}
          loading={kpisLoading}
        />
        <KpiCard
          title="Pacientes Ativos"
          value={String(kpis?.totalPacientes || 0)}
          change=""
          positive
          icon={Users}
          loading={kpisLoading}
        />
        <KpiCard
          title="Cancelamentos"
          value={String(kpis?.cancelamentos || 0)}
          change=""
          positive={false}
          icon={Target}
          loading={kpisLoading}
        />
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
                <CardTitle className="text-base">Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {receitaLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : receitaMensalData.length === 0 || receitaMensalData.every(m => m.receita === 0) ? (
                    <EmptyState icon={DollarSign} text="Nenhuma receita registrada" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={receitaMensalData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mes" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                        <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Receita por Meio de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {receitaPorMeio.length === 0 ? (
                    <EmptyState icon={PieChart} text="Nenhuma receita registrada" />
                  ) : (
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
                  )}
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
                {faltasData.length === 0 || faltasData.every(d => d.faltas === 0 && d.confirmados === 0) ? (
                  <EmptyState icon={Calendar} text="Nenhum agendamento registrado" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={faltasData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Legend />
                      <Area type="monotone" dataKey="confirmados" name="Confirmados %" fill="hsl(var(--primary))" fillOpacity={0.15} stroke="hsl(var(--primary))" />
                      <Area type="monotone" dataKey="faltas" name="Faltas %" fill="hsl(var(--destructive))" fillOpacity={0.15} stroke="hsl(var(--destructive))" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
              <p className="text-3xl font-bold text-foreground mt-1">{fmt(receitaBruta)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">Receita Mês Atual</p>
              <p className="text-3xl font-bold text-foreground mt-1">{fmt(kpis?.receitaMes || 0)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">Mês Anterior</p>
              <p className="text-3xl font-bold text-muted-foreground mt-1">{fmt(kpis?.receitaMesAnterior || 0)}</p>
            </CardContent></Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Receita Mensal</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {receitaMensalData.length === 0 ? (
                  <EmptyState icon={DollarSign} text="Nenhuma receita registrada" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={receitaMensalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                      <Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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
                {ocupacaoData.length === 0 || ocupacaoData.every(d => d.ocupacao === 0) ? (
                  <EmptyState icon={Calendar} text="Nenhum agendamento registrado neste mês" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ocupacaoData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="dia" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="ocupacao" name="Ocupação" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Agendamentos (mês)</p>
              <p className="text-2xl font-bold text-foreground">{kpis?.agendamentosMes || 0}</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <Activity className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Total Geral</p>
              <p className="text-2xl font-bold text-foreground">{kpis?.totalAgendamentos || 0}</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <UserCheck className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">Cancelamentos (mês)</p>
              <p className="text-2xl font-bold text-destructive">{kpis?.cancelamentos || 0}</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* Profissionais */}
        <TabsContent value="profissionais" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Desempenho por Profissional</CardTitle></CardHeader>
            <CardContent>
              {profsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : profsData.length === 0 ? (
                <EmptyState icon={Users} text="Nenhum atendimento registrado neste mês" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead className="text-center">Atendimentos</TableHead>
                      <TableHead className="text-center">Cancelamentos</TableHead>
                      <TableHead className="text-center">Taxa Presença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profsData.map(p => {
                      const taxa = p.atendimentos > 0
                        ? Math.round((p.atendimentos / (p.atendimentos + p.cancelamentos + 1)) * 100)
                        : 0;
                      return (
                        <TableRow key={p.nome}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell className="text-center">{p.atendimentos}</TableCell>
                          <TableCell className="text-center">{p.cancelamentos}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-center">
                              <Progress value={taxa} className="h-2 w-20" />
                              <span className="text-xs text-muted-foreground">{taxa}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pacientes */}
        <TabsContent value="pacientes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Crescimento de Pacientes</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {pacientesData.length === 0 || pacientesData.every(d => d.novos === 0 && d.ativos === 0) ? (
                  <EmptyState icon={Users} text="Nenhum paciente cadastrado" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pacientesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Legend />
                      <Area type="monotone" dataKey="ativos" name="Ativos" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Area type="monotone" dataKey="novos" name="Novos" fill="hsl(var(--chart-2))" fillOpacity={0.2} stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-5 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-foreground">{pacientesAtivos}</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Novos (mês)</p>
              <p className="text-2xl font-bold text-foreground">{pacientesNovos}</p>
            </CardContent></Card>
            <Card><CardContent className="p-5 text-center">
              <TrendingDown className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">Total Geral</p>
              <p className="text-2xl font-bold text-foreground">{kpis?.totalPacientes || 0}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
