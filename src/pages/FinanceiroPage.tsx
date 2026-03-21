import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const fluxoCaixa = [
  { mes: "Jan", receita: 18500, despesa: 8200 },
  { mes: "Fev", receita: 21000, despesa: 9100 },
  { mes: "Mar", receita: 19800, despesa: 7800 },
];

const movimentos = [
  { data: "21/03", descricao: "Consulta - Maria Silva", tipo: "receita", valor: 250, meio: "PIX" },
  { data: "21/03", descricao: "Material de escritório", tipo: "despesa", valor: 89.90, meio: "Cartão" },
  { data: "20/03", descricao: "Sessão Fisioterapia - Carlos Souza", tipo: "receita", valor: 180, meio: "Dinheiro" },
  { data: "20/03", descricao: "Conta de luz", tipo: "despesa", valor: 420, meio: "PIX" },
  { data: "19/03", descricao: "Consulta - Ana Oliveira", tipo: "receita", valor: 250, meio: "Cartão" },
  { data: "19/03", descricao: "Retorno - Pedro Santos", tipo: "receita", valor: 150, meio: "PIX" },
];

const FinanceiroPage = () => {
  const totalReceita = movimentos.filter(m => m.tipo === "receita").reduce((a, m) => a + m.valor, 0);
  const totalDespesa = movimentos.filter(m => m.tipo === "despesa").reduce((a, m) => a + m.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground text-sm">Controle de receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Receita
          </Button>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-success mt-1">R$ {totalReceita.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-destructive mt-1">R$ {totalDespesa.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-2xl font-bold text-foreground mt-1">R$ {(totalReceita - totalDespesa).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoCaixa} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 13 }} formatter={(v: number) => `R$ ${v}`} />
                <Bar dataKey="receita" fill="hsl(var(--chart-receita))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="hsl(var(--chart-despesa))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {movimentos.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${m.tipo === "receita" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {m.tipo === "receita" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.descricao}</p>
                    <p className="text-xs text-muted-foreground">{m.data} • {m.meio}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${m.tipo === "receita" ? "text-success" : "text-destructive"}`}>
                  {m.tipo === "receita" ? "+" : "-"} R$ {m.valor.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroPage;
