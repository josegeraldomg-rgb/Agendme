import { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import {
  Plus, ArrowUpRight, DollarSign, Users,
  TrendingUp, Receipt, Settings2, Wallet,
  Pencil, Check, AlertCircle, FileText, Loader2, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

import {
  useReceitas,
  useCreateReceita,
  useDeleteReceita,
  useComissoesConfig,
  useUpdateComissaoConfig,
  useRepasses,
  useCreateRepasse,
  useFinanceiroResumo,
  type MeioPagamento,
  type CreateReceitaInput,
} from "@/hooks/use-financeiro";
import { useProfissionais } from "@/hooks/use-agendamentos";
import { useClientes } from "@/hooks/use-clientes";
import { useServicos } from "@/hooks/use-servicos";

// ─── Constants ────────────────────────────────────────────────────────────────

const meioPagamentoLabels: Record<MeioPagamento, string> = {
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

// ─── Main Component ───────────────────────────────────────────────────────────

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

// ─── Tab: Visão Geral ─────────────────────────────────────────────────────────

function VisaoGeral() {
  const { data: receitas = [], isLoading } = useReceitas();
  const { data: repasses = [] } = useRepasses();

  const receitaTotal = receitas.reduce((a, r) => a + r.valor, 0);
  const comissaoTotal = receitas.reduce((a, r) => a + (r.comissao_profissional_valor ?? 0), 0);
  const lucroEmpresa = receitas.reduce((a, r) => a + (r.comissao_empresa_valor ?? 0), 0);
  const repassado = repasses.reduce((a, r) => a + r.valor, 0);
  const saldoPendente = comissaoTotal - repassado;

  // Chart: comissões por profissional
  const resumo = useFinanceiroResumo(receitas, repasses);
  const porProfissional = resumo.map((p) => ({
    name: p.nome.split(" ").slice(-1)[0],
    value: p.totalComissao,
  }));

  // Chart: receita por meio de pagamento
  const porMeio = Object.entries(
    receitas.reduce((acc, r) => {
      const label = meioPagamentoLabels[r.meio_pagamento] ?? r.meio_pagamento;
      acc[label] = (acc[label] || 0) + r.valor;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

      {receitas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma receita registrada ainda</p>
          <p className="text-xs mt-1">Vá para a aba "Receitas" para registrar a primeira</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Comissões por Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={porProfissional}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: R$${(value as number).toFixed(0)}`}
                      >
                        {porProfissional.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => `R$ ${v.toFixed(2)}`}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
                      <Tooltip
                        formatter={(v: number) => `R$ ${v.toFixed(2)}`}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Últimas Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {receitas.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {r.servicos?.nome ?? r.descricao ?? "—"} — {r.clientes?.nome ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.data_pagamento} • {meioPagamentoLabels[r.meio_pagamento]} • {r.profissionais_clinica?.nome ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-success">R$ {r.valor.toFixed(2)}</p>
                      {r.comissao_profissional_valor != null && (
                        <p className="text-[10px] text-muted-foreground">
                          Prof: R$ {r.comissao_profissional_valor.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Tab: Comissões Config ────────────────────────────────────────────────────

function ComissoesConfig() {
  const { data: comissoes = [], isLoading } = useComissoesConfig();
  const updateComissao = useUpdateComissaoConfig();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempEmpresa, setTempEmpresa] = useState(0);
  const [tempProf, setTempProf] = useState(0);

  const startEdit = (id: string, perc_empresa: number, perc_profissional: number) => {
    setEditingId(id);
    setTempEmpresa(perc_empresa);
    setTempProf(perc_profissional);
  };

  const saveEdit = (id: string) => {
    if (tempEmpresa + tempProf > 100) {
      return;
    }
    updateComissao.mutate(
      { id, perc_empresa: tempEmpresa, perc_profissional: tempProf },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const comissoesServico = comissoes.filter((c) => c.tipo === "servico");
  const comissoesPagamento = comissoes.filter((c) => c.tipo === "pagamento");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderTable = (items: typeof comissoes) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2.5 px-3 text-xs text-muted-foreground font-medium">Nome</th>
            <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium">% Empresa</th>
            <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium">% Profissional</th>
            <th className="text-center py-2.5 px-3 text-xs text-muted-foreground font-medium w-20">Ação</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const nome = c.referencia ?? c.servicos?.nome ?? c.meio_pagamento ?? c.tipo;
            const isEditing = editingId === c.id;
            return (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-3 font-medium text-foreground">{nome}</td>
                <td className="py-2.5 px-3 text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={tempEmpresa}
                      onChange={(e) => setTempEmpresa(Number(e.target.value))}
                      className="h-8 w-20 mx-auto text-center text-xs"
                      min={0}
                      max={100}
                    />
                  ) : (
                    <span className="text-foreground">{Number(c.perc_empresa)}%</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={tempProf}
                      onChange={(e) => setTempProf(Number(e.target.value))}
                      className="h-8 w-20 mx-auto text-center text-xs"
                      min={0}
                      max={100}
                    />
                  ) : (
                    <span className="text-foreground">{Number(c.perc_profissional)}%</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {isEditing ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveEdit(c.id)}
                      disabled={updateComissao.isPending}
                      className="h-7 w-7 p-0"
                    >
                      {updateComissao.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-success" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(c.id, Number(c.perc_empresa), Number(c.perc_profissional))}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                Nenhuma comissão configurada — adicione via Supabase ou seed data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Comissão por Serviço</CardTitle>
          </div>
        </CardHeader>
        <CardContent>{renderTable(comissoesServico)}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Comissão por Meio de Pagamento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>{renderTable(comissoesPagamento)}</CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Receitas ────────────────────────────────────────────────────────────

function ReceitasTab() {
  const { data: receitas = [], isLoading } = useReceitas();
  const { data: profissionais = [] } = useProfissionais();
  const { data: clientes = [] } = useClientes({ ativo: true });
  const { data: servicos = [] } = useServicos({ ativo: true });
  const createReceita = useCreateReceita();
  const deleteReceita = useDeleteReceita();

  const [filterProfId, setFilterProfId] = useState("all");
  const [filterMeio, setFilterMeio] = useState("all");
  const [showDialog, setShowDialog] = useState(false);

  // Form
  const [form, setForm] = useState<Partial<CreateReceitaInput>>({
    meio_pagamento: "pix",
    data_pagamento: new Date().toISOString().split("T")[0],
    valor: 0,
  });

  const filtered = useMemo(
    () =>
      receitas.filter((r) => {
        if (filterProfId !== "all" && r.profissional_id !== filterProfId) return false;
        if (filterMeio !== "all" && r.meio_pagamento !== filterMeio) return false;
        return true;
      }),
    [receitas, filterProfId, filterMeio]
  );

  const totalFiltered = filtered.reduce((a, r) => a + r.valor, 0);

  const handleSave = () => {
    if (!form.valor || !form.meio_pagamento || !form.data_pagamento) return;

    // Get commission config defaults
    const profissional = profissionais.find((p) => p.id === form.profissional_id);
    const _ = profissional; // used to avoid lint warning

    createReceita.mutate(
      {
        ...form,
        valor: Number(form.valor),
        meio_pagamento: form.meio_pagamento as MeioPagamento,
        data_pagamento: form.data_pagamento!,
      } as CreateReceitaInput,
      {
        onSuccess: () => {
          setShowDialog(false);
          setForm({ meio_pagamento: "pix", data_pagamento: new Date().toISOString().split("T")[0], valor: 0 });
        },
      }
    );
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filterProfId} onValueChange={setFilterProfId}>
          <SelectTrigger className="w-48 h-9 rounded-xl text-xs" id="filter-prof-rec">
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
          <SelectTrigger className="w-48 h-9 rounded-xl text-xs" id="filter-meio-rec">
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
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>
              {filtered.length} receitas •{" "}
              <strong className="text-foreground">R$ {totalFiltered.toFixed(2)}</strong>
            </span>
          )}
        </div>
        <Button
          id="btn-nova-receita"
          className="gap-2 rounded-xl"
          onClick={() => setShowDialog(true)}
        >
          <Plus className="h-4 w-4" /> Nova Receita
        </Button>
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
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhuma receita encontrada
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-4 text-muted-foreground">{r.data_pagamento}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{r.clientes?.nome ?? "—"}</td>
                      <td className="py-3 px-4 text-foreground hidden sm:table-cell">{r.servicos?.nome ?? r.descricao ?? "—"}</td>
                      <td className="py-3 px-4 text-foreground hidden md:table-cell">{r.profissionais_clinica?.nome ?? "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {meioPagamentoLabels[r.meio_pagamento]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">R$ {r.valor.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground hidden lg:table-cell">
                        R$ {(r.comissao_empresa_valor ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-primary font-medium hidden lg:table-cell">
                        R$ {(r.comissao_profissional_valor ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteReceita.mutate(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Nova Receita */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Receita</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Paciente</Label>
                <Select
                  value={form.paciente_id ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, paciente_id: v || null }))}
                >
                  <SelectTrigger className="mt-1" id="select-paciente-rec">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Profissional</Label>
                <Select
                  value={form.profissional_id ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, profissional_id: v || null }))}
                >
                  <SelectTrigger className="mt-1" id="select-prof-rec">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Serviço</Label>
              <Select
                value={form.servico_id ?? ""}
                onValueChange={(v) => setForm((f) => ({ ...f, servico_id: v || null }))}
              >
                <SelectTrigger className="mt-1" id="select-servico-rec">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor (R$) *</Label>
                <Input
                  id="input-valor-rec"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.valor ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Data *</Label>
                <Input
                  id="input-data-rec"
                  type="date"
                  value={form.data_pagamento ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, data_pagamento: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Meio de Pagamento *</Label>
                <Select
                  value={form.meio_pagamento}
                  onValueChange={(v) => setForm((f) => ({ ...f, meio_pagamento: v as MeioPagamento }))}
                >
                  <SelectTrigger className="mt-1" id="select-meio-rec">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(meioPagamentoLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">% Comissão Profissional</Label>
                <Input
                  id="input-comissao-rec"
                  type="number"
                  min={0}
                  max={100}
                  value={form.comissao_profissional_perc ?? ""}
                  onChange={(e) => {
                    const percProf = Number(e.target.value);
                    setForm((f) => ({
                      ...f,
                      comissao_profissional_perc: percProf,
                      comissao_empresa_perc: 100 - percProf,
                    }));
                  }}
                  placeholder="ex: 60"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button
              id="btn-salvar-receita"
              onClick={handleSave}
              disabled={createReceita.isPending || !form.valor}
            >
              {createReceita.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</>
              ) : (
                "Registrar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Por Profissional ────────────────────────────────────────────────────

function PorProfissionalTab() {
  const { data: receitas = [], isLoading } = useReceitas();
  const { data: repasses = [] } = useRepasses();

  const resumo = useFinanceiroResumo(receitas, repasses);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (resumo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground mt-4">
        <Users className="h-10 w-10 mb-3 opacity-30" />
        <p>Nenhuma receita registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resumo.map((p) => (
          <Card key={p.profissional_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{p.atendimentos} atendimentos</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total ganho</span>
                  <span className="font-medium text-foreground">R$ {p.totalComissao.toFixed(2)}</span>
                </div>
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

// ─── Tab: Repasses ────────────────────────────────────────────────────────────

function RepassesTab() {
  const { data: repasses = [], isLoading } = useRepasses();
  const { data: profissionais = [] } = useProfissionais();
  const createRepasse = useCreateRepasse();

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    profissional_id: "",
    valor: "",
    periodo_inicio: "",
    periodo_fim: "",
    meio_pagamento: "pix" as MeioPagamento,
    observacoes: "",
  });

  const handleSave = () => {
    if (!form.profissional_id || !form.valor || !form.periodo_inicio || !form.periodo_fim) return;
    createRepasse.mutate(
      {
        profissional_id: form.profissional_id,
        valor: Number(form.valor),
        periodo_inicio: form.periodo_inicio,
        periodo_fim: form.periodo_fim,
        meio_pagamento: form.meio_pagamento,
        observacoes: form.observacoes,
      },
      {
        onSuccess: () => {
          setShowDialog(false);
          setForm({ profissional_id: "", valor: "", periodo_inicio: "", periodo_fim: "", meio_pagamento: "pix", observacoes: "" });
        },
      }
    );
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Button id="btn-novo-repasse" className="gap-2 rounded-xl" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" /> Novo Repasse
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : repasses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhum repasse registrado
                    </td>
                  </tr>
                ) : (
                  repasses.map((rp) => (
                    <tr key={rp.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {(rp.profissionais_clinica?.nome ?? "?").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <span className="font-medium text-foreground">{rp.profissionais_clinica?.nome ?? "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{rp.periodo_inicio} — {rp.periodo_fim}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{rp.data_pagamento ?? "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell">{rp.observacoes ?? "—"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-success">R$ {rp.valor.toFixed(2)}</td>
                    </tr>
                  ))
                )}
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
              <Label className="text-xs">Profissional *</Label>
              <Select
                value={form.profissional_id}
                onValueChange={(v) => setForm((f) => ({ ...f, profissional_id: v }))}
              >
                <SelectTrigger className="mt-1 rounded-xl" id="select-prof-repasse">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor (R$) *</Label>
                <Input
                  id="input-valor-repasse"
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  className="mt-1 rounded-xl"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <Label className="text-xs">Meio de Pagamento</Label>
                <Select
                  value={form.meio_pagamento}
                  onValueChange={(v) => setForm((f) => ({ ...f, meio_pagamento: v as MeioPagamento }))}
                >
                  <SelectTrigger className="mt-1 rounded-xl" id="select-meio-repasse">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(meioPagamentoLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Período início *</Label>
                <Input
                  id="input-periodo-inicio"
                  type="date"
                  value={form.periodo_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, periodo_inicio: e.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Período fim *</Label>
                <Input
                  id="input-periodo-fim"
                  type="date"
                  value={form.periodo_fim}
                  onChange={(e) => setForm((f) => ({ ...f, periodo_fim: e.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Observação</Label>
              <Textarea
                id="textarea-obs-repasse"
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                className="mt-1 rounded-xl"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button
              id="btn-salvar-repasse"
              onClick={handleSave}
              disabled={createRepasse.isPending || !form.profissional_id || !form.valor}
              className="rounded-xl"
            >
              {createRepasse.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</>
              ) : (
                "Salvar Repasse"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Ajustes (UI simulation — DB table pending) ─────────────────────────

interface AjusteLocal {
  id: string;
  profissionale: string;
  valor: number;
  tipo: "adicao" | "desconto";
  motivo: string;
  criadoEm: string;
}

function AjustesTab() {
  const { data: profissionais = [] } = useProfissionais();
  const [ajustes, setAjustes] = useState<AjusteLocal[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    profissionalId: "",
    valor: "",
    tipo: "adicao" as "adicao" | "desconto",
    motivo: "",
  });

  const handleSave = () => {
    if (!form.profissionalId || !form.valor || !form.motivo.trim()) return;
    const nome = profissionais.find((p) => p.id === form.profissionalId)?.nome ?? "—";
    setAjustes((prev) => [
      {
        id: Date.now().toString(),
        profissionale: nome,
        valor: Number(form.valor),
        tipo: form.tipo,
        motivo: form.motivo,
        criadoEm: new Date().toLocaleDateString("pt-BR"),
      },
      ...prev,
    ]);
    setShowDialog(false);
    setForm({ profissionalId: "", valor: "", tipo: "adicao", motivo: "" });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Ajustes manuais (bônus e descontos) — persistência em DB em breve
        </p>
        <Button id="btn-novo-ajuste" className="gap-2 rounded-xl" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" /> Novo Ajuste
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Profissional</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Motivo</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Data</th>
                <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ajustes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    Nenhum ajuste registrado
                  </td>
                </tr>
              ) : (
                ajustes.map((aj) => (
                  <tr key={aj.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium text-foreground">{aj.profissionale}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={aj.tipo === "adicao"
                          ? "border-success/50 text-success"
                          : "border-destructive/50 text-destructive"
                        }
                      >
                        {aj.tipo === "adicao" ? "+ Bônus" : "- Desconto"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{aj.motivo}</td>
                    <td className="py-3 px-4 text-muted-foreground">{aj.criadoEm}</td>
                    <td className={cn("py-3 px-4 text-right font-semibold", aj.tipo === "adicao" ? "text-success" : "text-destructive")}>
                      {aj.tipo === "adicao" ? "+" : "-"}R$ {aj.valor.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Ajuste Financeiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Profissional *</Label>
              <Select
                value={form.profissionalId}
                onValueChange={(v) => setForm((f) => ({ ...f, profissionalId: v }))}
              >
                <SelectTrigger className="mt-1" id="select-prof-ajuste">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as "adicao" | "desconto" }))}
                >
                  <SelectTrigger className="mt-1" id="select-tipo-ajuste">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adicao">Bônus / Adição</SelectItem>
                    <SelectItem value="desconto">Desconto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valor (R$) *</Label>
                <Input
                  id="input-valor-ajuste"
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  className="mt-1"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Motivo *</Label>
              <Input
                id="input-motivo-ajuste"
                value={form.motivo}
                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                className="mt-1"
                placeholder="Descreva o motivo do ajuste..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button id="btn-salvar-ajuste" onClick={handleSave} disabled={!form.profissionalId || !form.valor || !form.motivo}>
              Registrar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Fechamento (UI simulation) ─────────────────────────────────────────

function FechamentoTab() {
  const { data: receitas = [] } = useReceitas();
  const { data: repasses = [] } = useRepasses();

  const receitaTotal = receitas.reduce((a, r) => a + r.valor, 0);
  const comissaoTotal = receitas.reduce((a, r) => a + (r.comissao_profissional_valor ?? 0), 0);
  const repassado = repasses.reduce((a, r) => a + r.valor, 0);
  const pendente = comissaoTotal - repassado;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-muted-foreground">
          Gestão de períodos de fechamento — integração DB em breve
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Receita do Período", value: receitaTotal, color: "text-success" },
          { label: "Comissões Totais", value: comissaoTotal, color: "text-primary" },
          { label: "Já Repassado", value: repassado, color: "text-muted-foreground" },
          { label: "Pendente", value: pendente, color: pendente > 0 ? "text-warning" : "text-success" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={cn("text-xl font-bold", s.color)}>R$ {s.value.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
