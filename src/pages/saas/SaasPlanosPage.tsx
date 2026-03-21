import { useState } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  valor_mensal: number;
  limite_usuarios: number;
  limite_agendamentos: number;
  ativo: boolean;
}

const initialPlanos: Plano[] = [
  { id: "1", nome: "Básico", descricao: "Ideal para profissionais autônomos", valor_mensal: 99.90, limite_usuarios: 2, limite_agendamentos: 100, ativo: true },
  { id: "2", nome: "Profissional", descricao: "Para clínicas pequenas e médias", valor_mensal: 199.90, limite_usuarios: 5, limite_agendamentos: 500, ativo: true },
  { id: "3", nome: "Premium", descricao: "Para clínicas grandes com múltiplos profissionais", valor_mensal: 399.90, limite_usuarios: 15, limite_agendamentos: 2000, ativo: true },
  { id: "4", nome: "Enterprise", descricao: "Plano personalizado para redes", valor_mensal: 799.90, limite_usuarios: 50, limite_agendamentos: 10000, ativo: false },
];

export default function SaasPlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>(initialPlanos);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", valor_mensal: "", limite_usuarios: "", limite_agendamentos: "" });

  const handleSave = () => {
    if (!form.nome.trim() || !form.valor_mensal) {
      toast({ title: "Preencha nome e valor", variant: "destructive" });
      return;
    }
    setPlanos((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        nome: form.nome,
        descricao: form.descricao,
        valor_mensal: parseFloat(form.valor_mensal),
        limite_usuarios: parseInt(form.limite_usuarios) || 0,
        limite_agendamentos: parseInt(form.limite_agendamentos) || 0,
        ativo: true,
      },
    ]);
    setForm({ nome: "", descricao: "", valor_mensal: "", limite_usuarios: "", limite_agendamentos: "" });
    setOpen(false);
    toast({ title: "Plano criado com sucesso! ✅" });
  };

  const toggleAtivo = (id: string) => {
    setPlanos((prev) => prev.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Planos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Novo Plano</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Plano</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-sm">Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Profissional" className="mt-1 h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm">Descrição</Label>
                <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição do plano" className="mt-1 rounded-xl" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Valor mensal (R$) *</Label>
                  <Input value={form.valor_mensal} onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })} type="number" placeholder="199.90" className="mt-1 h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-sm">Limite usuários</Label>
                  <Input value={form.limite_usuarios} onChange={(e) => setForm({ ...form, limite_usuarios: e.target.value })} type="number" placeholder="5" className="mt-1 h-11 rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Limite agendamentos/mês</Label>
                <Input value={form.limite_agendamentos} onChange={(e) => setForm({ ...form, limite_agendamentos: e.target.value })} type="number" placeholder="500" className="mt-1 h-11 rounded-xl" />
              </div>
              <Button className="w-full h-11 rounded-xl font-semibold" onClick={handleSave}>Salvar Plano</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {planos.map((plano) => (
          <div key={plano.id} className={`bg-card rounded-xl border p-5 transition-opacity ${plano.ativo ? "border-border" : "border-border opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{plano.nome}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{plano.descricao}</p>
              </div>
              <button onClick={() => toggleAtivo(plano.id)} title={plano.ativo ? "Desativar" : "Ativar"}>
                {plano.ativo ? (
                  <ToggleRight className="h-6 w-6 text-success" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-2xl font-bold text-primary">R$ {plano.valor_mensal.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{plano.limite_usuarios} usuários</span>
              <span>{plano.limite_agendamentos.toLocaleString("pt-BR")} agendamentos/mês</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${plano.ativo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {plano.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
