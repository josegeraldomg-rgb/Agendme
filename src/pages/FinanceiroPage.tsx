import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Plus, ArrowUpRight, ArrowDownRight, DollarSign, Users, Percent,
  CalendarDays, Lock, TrendingUp, Receipt, Settings2, Wallet,
  MoreHorizontal, Pencil, Check, AlertCircle, FileText, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ═══════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════

interface Profissional {
  id: string;
  nome: string;
  avatar: string;
}

interface ComissaoServico {
  id: string;
  servicoId: string;
  servicoNome: string;
  percentualEmpresa: number;
  percentualProfissional: number;
}

interface ComissaoPagamento {
  id: string;
  meioPagamento: "dinheiro" | "pix" | "cartao" | "mercado_pago";
  percentualEmpresa: number;
  percentualProfissional: number;
}

interface ReceitaServico {
  id: string;
  paciente: string;
  profissionalId: string;
  servicoNome: string;
  valorTotal: number;
  meioPagamento: "dinheiro" | "pix" | "cartao" | "mercado_pago";
  dataAtendimento: string;
  comissaoEmpresa: number;
  comissaoProfissional: number;
}

interface RepasseProfissional {
  id: string;
  profissionalId: string;
  valorPago: number;
  dataPagamento: string;
  periodoInicio: string;
  periodoFim: string;
  observacao: string;
}

interface AjusteFinanceiro {
  id: string;
  profissionalId: string;
  valor: number;
  tipo: "adicao" | "desconto";
  motivo: string;
  criadoEm: string;
}

interface FechamentoPeriodo {
  id: string;
  dataInicio: string;
  dataFim: string;
  status: "aberto" | "fechado";
  criadoEm: string;
  receitaTotal: number;
  comissaoTotal: number;
}

// ═══════════════════════════════════════════════════
//  Mock Data
// ═══════════════════════════════════════════════════

const profissionais: Profissional[] = [
  { id: "p1", nome: "Dra. Ana Silva", avatar: "AS" },
  { id: "p2", nome: "Dr. Carlos Mendes", avatar: "CM" },
  { id: "p3", nome: "Dra. Mariana Costa", avatar: "MC" },
];

const initialComissoesServico: ComissaoServico[] = [
  { id: "cs1", servicoId: "s1", servicoNome: "Limpeza de Pele", percentualEmpresa: 40, percentualProfissional: 60 },
  { id: "cs2", servicoId: "s2", servicoNome: "Peeling Químico", percentualEmpresa: 45, percentualProfissional: 55 },
  { id: "cs3", servicoId: "s3", servicoNome: "Microagulhamento", percentualEmpresa: 50, percentualProfissional: 50 },
  { id: "cs4", servicoId: "s4", servicoNome: "Botox", percentualEmpresa: 35, percentualProfissional: 65 },
  { id: "cs5", servicoId: "s5", servicoNome: "Drenagem Linfática", percentualEmpresa: 40, percentualProfissional: 60 },
  { id: "cs6", servicoId: "s6", servicoNome: "Criolipólise", percentualEmpresa: 50, percentualProfissional: 50 },
  { id: "cs7", servicoId: "s7", servicoNome: "Depilação a Laser", percentualEmpresa: 45, percentualProfissional: 55 },
];

const initialComissoesPagamento: ComissaoPagamento[] = [
  { id: "cp1", meioPagamento: "dinheiro", percentualEmpresa: 40, percentualProfissional: 60 },
  { id: "cp2", meioPagamento: "pix", percentualEmpresa: 40, percentualProfissional: 60 },
  { id: "cp3", meioPagamento: "cartao", percentualEmpresa: 45, percentualProfissional: 55 },
  { id: "cp4", meioPagamento: "mercado_pago", percentualEmpresa: 42, percentualProfissional: 58 },
];

const initialReceitas: ReceitaServico[] = [
  { id: "r1", paciente: "Maria Silva", profissionalId: "p1", servicoNome: "Limpeza de Pele", valorTotal: 150, meioPagamento: "pix", dataAtendimento: "21/03/2026", comissaoEmpresa: 60, comissaoProfissional: 90 },
  { id: "r2", paciente: "Carlos Souza", profissionalId: "p2", servicoNome: "Peeling Químico", valorTotal: 280, meioPagamento: "cartao", dataAtendimento: "21/03/2026", comissaoEmpresa: 126, comissaoProfissional: 154 },
  { id: "r3", paciente: "Ana Oliveira", profissionalId: "p1", servicoNome: "Botox", valorTotal: 800, meioPagamento: "cartao", dataAtendimento: "20/03/2026", comissaoEmpresa: 280, comissaoProfissional: 520 },
  { id: "r4", paciente: "Pedro Santos", profissionalId: "p3", servicoNome: "Drenagem Linfática", valorTotal: 120, meioPagamento: "dinheiro", dataAtendimento: "20/03/2026", comissaoEmpresa: 48, comissaoProfissional: 72 },
  { id: "r5", paciente: "Lucia Mendes", profissionalId: "p2", servicoNome: "Microagulhamento", valorTotal: 350, meioPagamento: "pix", dataAtendimento: "19/03/2026", comissaoEmpresa: 175, comissaoProfissional: 175 },
  { id: "r6", paciente: "João Lima", profissionalId: "p3", servicoNome: "Criolipólise", valorTotal: 500, meioPagamento: "mercado_pago", dataAtendimento: "19/03/2026", comissaoEmpresa: 250, comissaoProfissional: 250 },
  { id: "r7", paciente: "Fernanda Costa", profissionalId: "p1", servicoNome: "Depilação a Laser", valorTotal: 200, meioPagamento: "pix", dataAtendimento: "18/03/2026", comissaoEmpresa: 90, comissaoProfissional: 110 },
  { id: "r8", paciente: "Roberto Alves", profissionalId: "p2", servicoNome: "Limpeza de Pele", valorTotal: 150, meioPagamento: "dinheiro", dataAtendimento: "18/03/2026", comissaoEmpresa: 60, comissaoProfissional: 90 },
];

const initialRepasses: RepasseProfissional[] = [
  { id: "rp1", profissionalId: "p1", valorPago: 720, dataPagamento: "15/03/2026", periodoInicio: "01/03/2026", periodoFim: "15/03/2026", observacao: "Quinzena 1 de março" },
  { id: "rp2", profissionalId: "p2", valorPago: 419, dataPagamento: "15/03/2026", periodoInicio: "01/03/2026", periodoFim: "15/03/2026", observacao: "Quinzena 1 de março" },
  { id: "rp3", profissionalId: "p3", valorPago: 322, dataPagamento: "15/03/2026", periodoInicio: "01/03/2026", periodoFim: "15/03/2026", observacao: "Quinzena 1 de março" },
];

const initialAjustes: AjusteFinanceiro[] = [
  { id: "aj1", profissionalId: "p1", valor: 50, tipo: "adicao", motivo: "Bônus por pontualidade", criadoEm: "18/03/2026" },
  { id: "aj2", profissionalId: "p2", valor: 30, tipo: "desconto", motivo: "Adiantamento quinzenal", criadoEm: "17/03/2026" },
];

const initialFechamentos: FechamentoPeriodo[] = [
  { id: "f1", dataInicio: "01/02/2026", dataFim: "28/02/2026", status: "fechado", criadoEm: "01/03/2026", receitaTotal: 15200, comissaoTotal: 8890 },
  { id: "f2", dataInicio: "01/03/2026", dataFim: "15/03/2026", status: "fechado", criadoEm: "16/03/2026", receitaTotal: 8750, comissaoTotal: 5120 },
  { id: "f3", dataInicio: "16/03/2026", dataFim: "31/03/2026", status: "aberto", criadoEm: "16/03/2026", receitaTotal: 2550, comissaoTotal: 1461 },
];

const meioPagamentoLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  mercado_pago: "Mercado Pago",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-receita))",
  "hsl(var(--chart-despesa))",
  "hsl(var(--warning))",
];

// ═══════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════

function getProfNome(id: string) {
  return profissionais.find((p) => p.id === id)?.nome || "—";
}
function getProfAvatar(id: string) {
  return profissionais.find((p) => p.id === id)?.avatar || "??";
}

// ═══════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════

const FinanceiroPage = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground text-sm">Comissões, receitas e repasses financeiros</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="visao-geral" className="text-xs rounded-lg">Visão Geral</TabsTrigger>
          <TabsTrigger value="comissoes" className="text-xs rounded-lg">Comissões</TabsTrigger>
          <TabsTrigger value="receitas" className="text-xs rounded-lg">Receitas</TabsTrigger>
          <TabsTrigger value="profissionais" className="text-xs rounded-lg">Por Profissional</TabsTrigger>
          <TabsTrigger value="repasses" className="text-xs rounded-lg">Repasses</TabsTrigger>
          <TabsTrigger value="ajustes" className="text-xs rounded-lg">Ajustes</TabsTrigger>
          <TabsTrigger value="fechamento" className="text-xs rounded-lg">Fechamento</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral"><VisaoGeral /></TabsContent>
        <TabsContent value="comissoes"><ComissoesConfig /></TabsContent>
        <TabsContent value="receitas"><ReceitasTab /></TabsContent>
        <TabsContent value="profissionais"><PorProfissionalTab /></TabsContent>
        <TabsContent value="repasses"><RepassesTab /></TabsContent>
        <TabsContent value="ajustes"><AjustesTab /></TabsContent>
        <TabsContent value="fechamento"><FechamentoTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceiroPage;

// ═══════════════════════════════════════════════════
//  Tab: Visão Geral
// ═══════════════════════════════════════════════════

function VisaoGeral() {
  const receitaTotal = initialReceitas.reduce((a, r) => a + r.valorTotal, 0);
  const comissaoTotal = initialReceitas.reduce((a, r) => a + r.comissaoProfissional, 0);
  const lucroEmpresa = initialReceitas.reduce((a, r) => a + r.comissaoEmpresa, 0);
  const repassado = initialRepasses.reduce((a, r) => a + r.valorPago, 0);
  const saldoPendente = comissaoTotal - repassado;

  const porProfissional = profissionais.map((p) => {
    const receitas = initialReceitas.filter((r) => r.profissionalId === p.id);
    const total = receitas.reduce((a, r) => a + r.comissaoProfissional, 0);
    return { name: p.nome.split(" ").slice(-1)[0], value: total };
  });

  const porMeio = Object.entries(
    initialReceitas.reduce((acc, r) => {
      const label = meioPagamentoLabels[r.meioPagamento];
      acc[label] = (acc[label] || 0) + r.valorTotal;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 mt-4">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Receita Total", value: receitaTotal, icon: DollarSign, color: "text-success" },
          { label: "Comissões Profissionais", value: comissaoTotal, icon: Users, color: "text-primary" },
          { label: "Lucro Empresa", value: lucroEmpresa, icon: TrendingUp, color: "text-chart-receita" },
          { label: "Já Repassado", value: repassado, icon: Wallet, color: "text-muted-foreground" },
          { label: "Saldo Pendente", value: saldoPendente, icon: AlertCircle, color: "text-warning" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className={cn("text-xl font-bold", kpi.color)}>
                R$ {kpi.value.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart: by Professional */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Comissões por Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porProfissional} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: R$${value}`}>
                    {porProfissional.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart: by Payment Method */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Receita por Meio de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porMeio}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent revenues */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Últimas Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {initialReceitas.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.servicoNome} — {r.paciente}</p>
                    <p className="text-xs text-muted-foreground">{r.dataAtendimento} • {meioPagamentoLabels[r.meioPagamento]} • {getProfNome(r.profissionalId)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">R$ {r.valorTotal.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">Prof: R$ {r.comissaoProfissional.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Tab: Comissões Config
// ═══════════════════════════════════════════════════

function ComissoesConfig() {
  const [comissoesServico, setComissoesServico] = useState(initialComissoesServico);
  const [comissoesPagamento, setComissoesPagamento] = useState(initialComissoesPagamento);
  const [editingServico, setEditingServico] = useState<string | null>(null);
  const [editingPagamento, setEditingPagamento] = useState<string | null>(null);
  const [tempPercEmpresa, setTempPercEmpresa] = useState(0);
  const [tempPercProf, setTempPercProf] = useState(0);

  const startEditServico = (cs: ComissaoServico) => {
    setEditingServico(cs.id);
    setTempPercEmpresa(cs.percentualEmpresa);
    setTempPercProf(cs.percentualProfissional);
  };

  const saveServico = (id: string) => {
    if (tempPercEmpresa + tempPercProf > 100) {
      toast({ title: "Soma dos percentuais não pode ultrapassar 100%", variant: "destructive" });
      return;
    }
    setComissoesServico((prev) =>
      prev.map((cs) => cs.id === id ? { ...cs, percentualEmpresa: tempPercEmpresa, percentualProfissional: tempPercProf } : cs)
    );
    setEditingServico(null);
    toast({ title: "Comissão atualizada ✅" });
  };

  const startEditPagamento = (cp: ComissaoPagamento) => {
    setEditingPagamento(cp.id);
    setTempPercEmpresa(cp.percentualEmpresa);
    setTempPercProf(cp.percentualProfissional);
  };

  const savePagamento = (id: string) => {
    if (tempPercEmpresa + tempPercProf > 100) {
      toast({ title: "Soma dos percentuais não pode ultrapassar 100%", variant: "destructive" });
      return;
    }
    setComissoesPagamento((prev) =>
      prev.map((cp) => cp.id === id ? { ...cp, percentualEmpresa: tempPercEmpresa, percentualProfissional: tempPercProf } : cp)
    );
    setEditingPagamento(null);
    toast({ title: "Comissão atualizada ✅" });
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Per service */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Comissão por Serviço</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs text-muted-foreground font-medium">Serviço</th>
                  <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium">% Empresa</th>
                  <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium">% Profissional</th>
                  <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium w-20">Ação</th>
                </tr>
              </thead>
              <tbody>
                {comissoesServico.map((cs) => (
                  <tr key={cs.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium text-foreground">{cs.servicoNome}</td>
                    <td className="py-2.5 px-3 text-center">
                      {editingServico === cs.id ? (
                        <Input type="number" value={tempPercEmpresa} onChange={(e) => setTempPercEmpresa(Number(e.target.value))} className="h-8 w-20 mx-auto text-center text-xs" min={0} max={100} />
                      ) : (
                        <span className="text-foreground">{cs.percentualEmpresa}%</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {editingServico === cs.id ? (
                        <Input type="number" value={tempPercProf} onChange={(e) => setTempPercProf(Number(e.target.value))} className="h-8 w-20 mx-auto text-center text-xs" min={0} max={100} />
                      ) : (
                        <span className="text-foreground">{cs.percentualProfissional}%</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {editingServico === cs.id ? (
                        <Button size="sm" variant="ghost" onClick={() => saveServico(cs.id)} className="h-7 w-7 p-0">
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEditServico(cs)} className="h-7 w-7 p-0">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Per payment method */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Comissão por Meio de Pagamento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs text-muted-foreground font-medium">Meio de Pagamento</th>
                  <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium">% Empresa</th>
                  <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium">% Profissional</th>
                  <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium w-20">Ação</th>
                </tr>
              </thead>
              <tbody>
                {comissoesPagamento.map((cp) => (
                  <tr key={cp.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium text-foreground">{meioPagamentoLabels[cp.meioPagamento]}</td>
                    <td className="py-2.5 px-3 text-center">
                      {editingPagamento === cp.id ? (
                        <Input type="number" value={tempPercEmpresa} onChange={(e) => setTempPercEmpresa(Number(e.target.value))} className="h-8 w-20 mx-auto text-center text-xs" min={0} max={100} />
                      ) : (
                        <span className="text-foreground">{cp.percentualEmpresa}%</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {editingPagamento === cp.id ? (
                        <Input type="number" value={tempPercProf} onChange={(e) => setTempPercProf(Number(e.target.value))} className="h-8 w-20 mx-auto text-center text-xs" min={0} max={100} />
                      ) : (
                        <span className="text-foreground">{cp.percentualProfissional}%</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {editingPagamento === cp.id ? (
                        <Button size="sm" variant="ghost" onClick={() => savePagamento(cp.id)} className="h-7 w-7 p-0">
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEditPagamento(cp)} className="h-7 w-7 p-0">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Tab: Receitas
// ═══════════════════════════════════════════════════

function ReceitasTab() {
  const [receitas] = useState(initialReceitas);
  const [filterProf, setFilterProf] = useState("all");
  const [filterMeio, setFilterMeio] = useState("all");

  const filtered = receitas.filter((r) => {
    if (filterProf !== "all" && r.profissionalId !== filterProf) return false;
    if (filterMeio !== "all" && r.meioPagamento !== filterMeio) return false;
    return true;
  });

  const totalFiltered = filtered.reduce((a, r) => a + r.valorTotal, 0);

  return (
    <div className="space-y-4 mt-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterProf} onValueChange={setFilterProf}>
          <SelectTrigger className="w-48 h-9 rounded-xl text-xs">
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos profissionais</SelectItem>
            {profissionais.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMeio} onValueChange={setFilterMeio}>
          <SelectTrigger className="w-48 h-9 rounded-xl text-xs">
            <SelectValue placeholder="Meio de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos meios</SelectItem>
            {Object.entries(meioPagamentoLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Receipt className="h-4 w-4" />
          <span>{filtered.length} receitas • <strong className="text-foreground">R$ {totalFiltered.toFixed(2)}</strong></span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Paciente</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Serviço</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Profissional</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Meio</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Valor</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium hidden lg:table-cell">Empresa</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium hidden lg:table-cell">Profissional</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-4 text-muted-foreground">{r.dataAtendimento}</td>
                    <td className="py-3 px-4 font-medium text-foreground">{r.paciente}</td>
                    <td className="py-3 px-4 text-foreground hidden sm:table-cell">{r.servicoNome}</td>
                    <td className="py-3 px-4 text-foreground hidden md:table-cell">{getProfNome(r.profissionalId)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px]">{meioPagamentoLabels[r.meioPagamento]}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">R$ {r.valorTotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground hidden lg:table-cell">R$ {r.comissaoEmpresa.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-primary font-medium hidden lg:table-cell">R$ {r.comissaoProfissional.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Tab: Por Profissional
// ═══════════════════════════════════════════════════

function PorProfissionalTab() {
  const profData = profissionais.map((p) => {
    const receitas = initialReceitas.filter((r) => r.profissionalId === p.id);
    const totalGanho = receitas.reduce((a, r) => a + r.comissaoProfissional, 0);
    const totalRepassado = initialRepasses
      .filter((rp) => rp.profissionalId === p.id)
      .reduce((a, rp) => a + rp.valorPago, 0);
    const ajustesAdd = initialAjustes
      .filter((aj) => aj.profissionalId === p.id && aj.tipo === "adicao")
      .reduce((a, aj) => a + aj.valor, 0);
    const ajustesSub = initialAjustes
      .filter((aj) => aj.profissionalId === p.id && aj.tipo === "desconto")
      .reduce((a, aj) => a + aj.valor, 0);
    const saldoPendente = totalGanho + ajustesAdd - ajustesSub - totalRepassado;
    return { ...p, totalGanho, totalRepassado, ajustesAdd, ajustesSub, saldoPendente, atendimentos: receitas.length };
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profData.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{p.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{p.atendimentos} atendimentos</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total ganho</span>
                  <span className="font-medium text-foreground">R$ {p.totalGanho.toFixed(2)}</span>
                </div>
                {p.ajustesAdd > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">+ Ajustes</span>
                    <span className="font-medium text-success">R$ {p.ajustesAdd.toFixed(2)}</span>
                  </div>
                )}
                {p.ajustesSub > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">- Descontos</span>
                    <span className="font-medium text-destructive">R$ {p.ajustesSub.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Já repassado</span>
                  <span className="font-medium text-muted-foreground">R$ {p.totalRepassado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Saldo pendente</span>
                  <span className={cn("font-bold", p.saldoPendente > 0 ? "text-warning" : "text-success")}>
                    R$ {p.saldoPendente.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Tab: Repasses
// ═══════════════════════════════════════════════════

function RepassesTab() {
  const [repasses, setRepasses] = useState(initialRepasses);
  const [showDialog, setShowDialog] = useState(false);
  const [newRepasse, setNewRepasse] = useState({ profissionalId: "", valorPago: "", periodoInicio: "", periodoFim: "", observacao: "" });

  const handleSave = () => {
    if (!newRepasse.profissionalId || !newRepasse.valorPago) {
      toast({ title: "Preencha profissional e valor", variant: "destructive" });
      return;
    }
    const repasse: RepasseProfissional = {
      id: `rp${Date.now()}`,
      profissionalId: newRepasse.profissionalId,
      valorPago: Number(newRepasse.valorPago),
      dataPagamento: new Date().toLocaleDateString("pt-BR"),
      periodoInicio: newRepasse.periodoInicio,
      periodoFim: newRepasse.periodoFim,
      observacao: newRepasse.observacao,
    };
    setRepasses((prev) => [repasse, ...prev]);
    setShowDialog(false);
    setNewRepasse({ profissionalId: "", valorPago: "", periodoInicio: "", periodoFim: "", observacao: "" });
    toast({ title: "Repasse registrado! ✅" });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Button className="gap-2 rounded-xl" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          Novo Repasse
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Profissional</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Período</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Data Pgto</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Observação</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {repasses.map((rp) => (
                  <tr key={rp.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {getProfAvatar(rp.profissionalId)}
                        </div>
                        <span className="font-medium text-foreground">{getProfNome(rp.profissionalId)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{rp.periodoInicio} — {rp.periodoFim}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{rp.dataPagamento}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell">{rp.observacao}</td>
                    <td className="py-3 px-4 text-right font-semibold text-success">R$ {rp.valorPago.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Repasse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Profissional</Label>
              <Select value={newRepasse.profissionalId} onValueChange={(v) => setNewRepasse((p) => ({ ...p, profissionalId: v }))}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input type="number" value={newRepasse.valorPago} onChange={(e) => setNewRepasse((p) => ({ ...p, valorPago: e.target.value }))} className="mt-1 rounded-xl" placeholder="0.00" min={0} step={0.01} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Período início</Label>
                <Input type="date" value={newRepasse.periodoInicio} onChange={(e) => setNewRepasse((p) => ({ ...p, periodoInicio: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Período fim</Label>
                <Input type="date" value={newRepasse.periodoFim} onChange={(e) => setNewRepasse((p) => ({ ...p, periodoFim: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Observação</Label>
              <Textarea value={newRepasse.observacao} onChange={(e) => setNewRepasse((p) => ({ ...p, observacao: e.target.value }))} className="mt-1 rounded-xl" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-xl">Salvar Repasse</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Tab: Ajustes
// ═══════════════════════════════════════════════════

function AjustesTab() {
  const [ajustes, setAjustes] = useState(initialAjustes);
  const [showDialog, setShowDialog] = useState(false);
  const [newAjuste, setNewAjuste] = useState({ profissionalId: "", valor: "", tipo: "adicao" as "adicao" | "desconto", motivo: "" });

  const handleSave = () => {
    if (!newAjuste.profissionalId || !newAjuste.valor || !newAjuste.motivo.trim()) {
      toast({ title: "Preencha todos os campos (motivo é obrigatório)", variant: "destructive" });
      return;
    }
    const ajuste: AjusteFinanceiro = {
      id: `aj${Date.now()}`,
      profissionalId: newAjuste.profissionalId,
      valor: Number(newAjuste.valor),
      tipo: newAjuste.tipo,
      motivo: newAjuste.motivo,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
    };
    setAjustes((prev) => [ajuste, ...prev]);
    setShowDialog(false);
    setNewAjuste({ profissionalId: "", valor: "", tipo: "adicao", motivo: "" });
    toast({ title: "Ajuste registrado! ✅" });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Button className="gap-2 rounded-xl" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          Novo Ajuste
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Profissional</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Motivo</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Data</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {ajustes.map((aj) => (
                  <tr key={aj.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium text-foreground">{getProfNome(aj.profissionalId)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={aj.tipo === "adicao" ? "default" : "destructive"} className="text-[10px]">
                        {aj.tipo === "adicao" ? "Adição" : "Desconto"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs hidden sm:table-cell">{aj.motivo}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{aj.criadoEm}</td>
                    <td className={cn("py-3 px-4 text-right font-semibold", aj.tipo === "adicao" ? "text-success" : "text-destructive")}>
                      {aj.tipo === "adicao" ? "+" : "-"} R$ {aj.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Ajuste Financeiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Profissional</Label>
              <Select value={newAjuste.profissionalId} onValueChange={(v) => setNewAjuste((p) => ({ ...p, profissionalId: v }))}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={newAjuste.tipo} onValueChange={(v) => setNewAjuste((p) => ({ ...p, tipo: v as "adicao" | "desconto" }))}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adicao">Adição (bônus)</SelectItem>
                  <SelectItem value="desconto">Desconto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input type="number" value={newAjuste.valor} onChange={(e) => setNewAjuste((p) => ({ ...p, valor: e.target.value }))} className="mt-1 rounded-xl" placeholder="0.00" min={0} step={0.01} />
            </div>
            <div>
              <Label className="text-xs">Motivo (obrigatório)</Label>
              <Textarea value={newAjuste.motivo} onChange={(e) => setNewAjuste((p) => ({ ...p, motivo: e.target.value }))} className="mt-1 rounded-xl" rows={2} placeholder="Descreva o motivo do ajuste..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-xl">Salvar Ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Tab: Fechamento
// ═══════════════════════════════════════════════════

function FechamentoTab() {
  const [fechamentos, setFechamentos] = useState(initialFechamentos);
  const [showDialog, setShowDialog] = useState(false);
  const [newFechamento, setNewFechamento] = useState({ dataInicio: "", dataFim: "" });

  const handleClose = () => {
    if (!newFechamento.dataInicio || !newFechamento.dataFim) {
      toast({ title: "Preencha as datas", variant: "destructive" });
      return;
    }
    const f: FechamentoPeriodo = {
      id: `f${Date.now()}`,
      dataInicio: new Date(newFechamento.dataInicio).toLocaleDateString("pt-BR"),
      dataFim: new Date(newFechamento.dataFim).toLocaleDateString("pt-BR"),
      status: "fechado",
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      receitaTotal: initialReceitas.reduce((a, r) => a + r.valorTotal, 0),
      comissaoTotal: initialReceitas.reduce((a, r) => a + r.comissaoProfissional, 0),
    };
    setFechamentos((prev) => [f, ...prev]);
    setShowDialog(false);
    setNewFechamento({ dataInicio: "", dataFim: "" });
    toast({ title: "Período fechado! 🔒", description: "Os valores deste período não poderão mais ser alterados." });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Button className="gap-2 rounded-xl" onClick={() => setShowDialog(true)}>
          <Lock className="h-4 w-4" />
          Fechar Período
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fechamentos.map((f) => (
          <Card key={f.id} className={cn("transition-shadow", f.status === "fechado" && "opacity-80")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{f.dataInicio} — {f.dataFim}</span>
                </div>
                <Badge variant={f.status === "fechado" ? "secondary" : "default"} className="text-[10px]">
                  {f.status === "fechado" ? (
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Fechado</span>
                  ) : "Aberto"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receita total</span>
                  <span className="font-medium text-foreground">R$ {f.receitaTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comissões pagas</span>
                  <span className="font-medium text-primary">R$ {f.comissaoTotal.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lucro empresa</span>
                  <span className="font-bold text-success">R$ {(f.receitaTotal - f.comissaoTotal).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Fechado em {f.criadoEm}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              Fechar Período Financeiro
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ao fechar um período, os valores de comissão e repasse não poderão ser alterados. Essa ação é irreversível.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Data início</Label>
                <Input type="date" value={newFechamento.dataInicio} onChange={(e) => setNewFechamento((p) => ({ ...p, dataInicio: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Data fim</Label>
                <Input type="date" value={newFechamento.dataFim} onChange={(e) => setNewFechamento((p) => ({ ...p, dataFim: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleClose} className="rounded-xl gap-2" variant="destructive">
              <Lock className="h-4 w-4" />
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
