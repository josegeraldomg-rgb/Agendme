import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──

interface HorarioConfig {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  intervaloMinutos: number;
  ativo: boolean;
}

interface ProfissionalConfig {
  id: string;
  nome: string;
  avatar: string;
  especialidade: string;
  horarios: HorarioConfig[];
}

const DIAS_SEMANA = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

const INTERVALOS = [
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 40, label: "40 min" },
  { value: 45, label: "45 min" },
  { value: 50, label: "50 min" },
  { value: 60, label: "60 min" },
];

// ── Mock Data ──

const initialProfissionais: ProfissionalConfig[] = [
  {
    id: "p1", nome: "Dra. Ana Silva", avatar: "AS", especialidade: "Dermatologista",
    horarios: [
      { id: "h1", diaSemana: 1, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h2", diaSemana: 2, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h3", diaSemana: 3, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h4", diaSemana: 4, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h5", diaSemana: 5, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
    ],
  },
  {
    id: "p2", nome: "Dr. Carlos Mendes", avatar: "CM", especialidade: "Esteticista",
    horarios: [
      { id: "h6", diaSemana: 1, horaInicio: "09:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h7", diaSemana: 2, horaInicio: "09:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h8", diaSemana: 3, horaInicio: "09:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h9", diaSemana: 4, horaInicio: "09:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h10", diaSemana: 5, horaInicio: "09:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
    ],
  },
  {
    id: "p3", nome: "Dra. Mariana Costa", avatar: "MC", especialidade: "Fisioterapeuta",
    horarios: [
      { id: "h11", diaSemana: 1, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h12", diaSemana: 3, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
      { id: "h13", diaSemana: 5, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30, ativo: true },
    ],
  },
];

// ── Component ──

const HorariosPage = () => {
  const [profissionais, setProfissionais] = useState<ProfissionalConfig[]>(initialProfissionais);
  const [selectedProf, setSelectedProf] = useState<string>(profissionais[0]?.id || "");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioConfig | null>(null);
  const [form, setForm] = useState({
    diaSemana: 1,
    horaInicio: "08:00",
    horaFim: "17:00",
    intervaloMinutos: 30,
  });

  const currentProf = profissionais.find((p) => p.id === selectedProf);

  // ── Handlers ──

  const openNew = () => {
    setEditingHorario(null);
    // Find first weekday not yet configured
    const usedDays = new Set(currentProf?.horarios.map((h) => h.diaSemana) || []);
    const nextDay = DIAS_SEMANA.find((d) => !usedDays.has(d.value))?.value ?? 1;
    setForm({ diaSemana: nextDay, horaInicio: "08:00", horaFim: "17:00", intervaloMinutos: 30 });
    setDialogOpen(true);
  };

  const openEdit = (h: HorarioConfig) => {
    setEditingHorario(h);
    setForm({ diaSemana: h.diaSemana, horaInicio: h.horaInicio, horaFim: h.horaFim, intervaloMinutos: h.intervaloMinutos });
    setDialogOpen(true);
  };

  const save = () => {
    if (form.horaInicio >= form.horaFim) {
      toast({ title: "Horário inválido", description: "O horário de início deve ser anterior ao fim.", variant: "destructive" });
      return;
    }
    setProfissionais((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProf) return p;
        if (editingHorario) {
          return { ...p, horarios: p.horarios.map((h) => h.id === editingHorario.id ? { ...h, ...form } : h) };
        }
        // Check duplicate day
        if (p.horarios.some((h) => h.diaSemana === form.diaSemana)) {
          toast({ title: "Dia já configurado", description: "Edite o horário existente.", variant: "destructive" });
          return p;
        }
        return { ...p, horarios: [...p.horarios, { id: `h-${Date.now()}`, ...form, ativo: true }].sort((a, b) => a.diaSemana - b.diaSemana) };
      })
    );
    setDialogOpen(false);
    toast({ title: editingHorario ? "Horário atualizado" : "Horário adicionado" });
  };

  const remove = (horarioId: string) => {
    setProfissionais((prev) =>
      prev.map((p) => p.id !== selectedProf ? p : { ...p, horarios: p.horarios.filter((h) => h.id !== horarioId) })
    );
    toast({ title: "Horário removido" });
  };

  const toggleAtivo = (horarioId: string) => {
    setProfissionais((prev) =>
      prev.map((p) => p.id !== selectedProf ? p : { ...p, horarios: p.horarios.map((h) => h.id === horarioId ? { ...h, ativo: !h.ativo } : h) })
    );
  };

  // Calculate total weekly hours
  const totalHoras = currentProf?.horarios
    .filter((h) => h.ativo)
    .reduce((acc, h) => {
      const [hi, mi] = h.horaInicio.split(":").map(Number);
      const [hf, mf] = h.horaFim.split(":").map(Number);
      return acc + (hf * 60 + mf - hi * 60 - mi) / 60;
    }, 0) || 0;

  const totalSlots = currentProf?.horarios
    .filter((h) => h.ativo)
    .reduce((acc, h) => {
      const [hi, mi] = h.horaInicio.split(":").map(Number);
      const [hf, mf] = h.horaFim.split(":").map(Number);
      const totalMin = hf * 60 + mf - hi * 60 - mi;
      return acc + Math.floor(totalMin / h.intervaloMinutos);
    }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horários de Funcionamento</h1>
          <p className="text-muted-foreground text-sm">Configure os dias e horários de atendimento por profissional</p>
        </div>
      </div>

      {/* Professional selector */}
      <div className="flex gap-3 flex-wrap">
        {profissionais.map((prof) => (
          <button
            key={prof.id}
            onClick={() => setSelectedProf(prof.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
              selectedProf === prof.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              selectedProf === prof.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <span className="text-xs font-bold">{prof.avatar}</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{prof.nome}</p>
              <p className="text-xs text-muted-foreground">{prof.especialidade}</p>
            </div>
          </button>
        ))}
      </div>

      {currentProf && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Dias ativos</p>
              <p className="text-2xl font-bold text-foreground">{currentProf.horarios.filter((h) => h.ativo).length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Horas/semana</p>
              <p className="text-2xl font-bold text-primary">{totalHoras.toFixed(0)}h</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Slots/semana</p>
              <p className="text-2xl font-bold text-foreground">{totalSlots}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Dias livres</p>
              <p className="text-2xl font-bold text-muted-foreground">{7 - currentProf.horarios.filter((h) => h.ativo).length}</p>
            </Card>
          </div>

          {/* Week grid */}
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Grade semanal — {currentProf.nome}</h2>
              <Button size="sm" className="gap-1.5" onClick={openNew}>
                <Plus className="h-4 w-4" />
                Adicionar dia
              </Button>
            </div>
            <CardContent className="p-5">
              {/* Visual week overview */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {DIAS_SEMANA.map((dia) => {
                  const horario = currentProf.horarios.find((h) => h.diaSemana === dia.value);
                  const isActive = horario?.ativo;
                  return (
                    <div
                      key={dia.value}
                      className={cn(
                        "rounded-xl border p-3 text-center transition-all",
                        isActive
                          ? "border-primary/40 bg-primary/5"
                          : horario
                          ? "border-warning/40 bg-warning/5"
                          : "border-border bg-muted/30"
                      )}
                    >
                      <p className={cn(
                        "text-xs font-semibold mb-1",
                        isActive ? "text-primary" : horario ? "text-warning" : "text-muted-foreground"
                      )}>
                        {dia.short}
                      </p>
                      {horario ? (
                        <>
                          <p className="text-[11px] text-foreground font-medium">{horario.horaInicio}</p>
                          <p className="text-[10px] text-muted-foreground">às</p>
                          <p className="text-[11px] text-foreground font-medium">{horario.horaFim}</p>
                          <Badge variant={isActive ? "default" : "secondary"} className="text-[9px] mt-1.5 px-1.5">
                            {horario.intervaloMinutos}min
                          </Badge>
                        </>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-2">Folga</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator className="mb-4" />

              {/* Detailed list */}
              <div className="space-y-2">
                {currentProf.horarios.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum horário configurado para este profissional.</p>
                )}
                {currentProf.horarios
                  .sort((a, b) => a.diaSemana - b.diaSemana)
                  .map((h) => {
                    const dia = DIAS_SEMANA.find((d) => d.value === h.diaSemana);
                    const [hi, mi] = h.horaInicio.split(":").map(Number);
                    const [hf, mf] = h.horaFim.split(":").map(Number);
                    const totalMin = hf * 60 + mf - hi * 60 - mi;
                    const slots = Math.floor(totalMin / h.intervaloMinutos);
                    return (
                      <div key={h.id} className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-colors group",
                        h.ativo ? "bg-muted/40 hover:bg-muted/60" : "bg-muted/20 opacity-60"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <p className="text-sm font-medium text-foreground">{dia?.label}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{h.horaInicio} — {h.horaFim}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Intervalo: {h.intervaloMinutos}min
                          </Badge>
                          <span className="text-xs text-muted-foreground">{slots} slots • {(totalMin / 60).toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={h.ativo} onCheckedChange={() => toggleAtivo(h.id)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => openEdit(h)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => remove(h.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHorario ? "Editar Horário" : "Novo Horário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Dia da semana</Label>
              <Select
                value={String(form.diaSemana)}
                onValueChange={(v) => setForm((p) => ({ ...p, diaSemana: parseInt(v) }))}
                disabled={!!editingHorario}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horário de início</Label>
                <Input type="time" value={form.horaInicio} onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))} />
              </div>
              <div>
                <Label>Horário de fim</Label>
                <Input type="time" value={form.horaFim} onChange={(e) => setForm((p) => ({ ...p, horaFim: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Intervalo entre atendimentos</Label>
              <Select value={String(form.intervaloMinutos)} onValueChange={(v) => setForm((p) => ({ ...p, intervaloMinutos: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INTERVALOS.map((i) => (
                    <SelectItem key={i.value} value={String(i.value)}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Preview */}
            <div className="rounded-lg bg-muted/60 border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Pré-visualização:</p>
              <p className="text-sm text-foreground">
                {(() => {
                  const [hi, mi] = form.horaInicio.split(":").map(Number);
                  const [hf, mf] = form.horaFim.split(":").map(Number);
                  const totalMin = hf * 60 + mf - hi * 60 - mi;
                  if (totalMin <= 0) return "Horário inválido";
                  const slots = Math.floor(totalMin / form.intervaloMinutos);
                  return `${slots} slots de ${form.intervaloMinutos}min • ${(totalMin / 60).toFixed(1)}h de atendimento`;
                })()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{editingHorario ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorariosPage;
