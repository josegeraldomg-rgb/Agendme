import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHorarios, useCreateHorario, useUpdateHorario, useDeleteHorario } from "@/hooks/use-horarios";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";

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

function useProfissionais() {
  const empresaId = useEmpresaId();
  return useQuery({
    queryKey: ["profissionais", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("profissionais_clinica")
        .select("id, nome, avatar_url, especialidades, ativo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

const HorariosPage = () => {
  const { data: profissionais, isLoading: loadingProfs } = useProfissionais();
  const [selectedProf, setSelectedProf] = useState<string>("");
  const { data: horarios, isLoading: loadingHorarios } = useHorarios(selectedProf || undefined);
  const createHorario = useCreateHorario();
  const updateHorario = useUpdateHorario();
  const deleteHorario = useDeleteHorario();

  // Auto-select first professional
  if (!selectedProf && profissionais && profissionais.length > 0) {
    setSelectedProf(profissionais[0].id);
  }

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    dia_semana: 1,
    hora_inicio: "08:00",
    hora_fim: "17:00",
    intervalo_minutos: 30,
  });

  const currentProf = profissionais?.find((p) => p.id === selectedProf);
  const profHorarios = horarios || [];

  const openNew = () => {
    setEditingId(null);
    const usedDays = new Set(profHorarios.map((h) => h.dia_semana));
    const nextDay = DIAS_SEMANA.find((d) => !usedDays.has(d.value))?.value ?? 1;
    setForm({ dia_semana: nextDay, hora_inicio: "08:00", hora_fim: "17:00", intervalo_minutos: 30 });
    setDialogOpen(true);
  };

  const openEdit = (h: NonNullable<typeof horarios>[0]) => {
    setEditingId(h.id);
    setForm({
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fim: h.hora_fim,
      intervalo_minutos: h.intervalo_minutos ?? 30,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (form.hora_inicio >= form.hora_fim) {
      toast({ title: "Horário inválido", description: "O horário de início deve ser anterior ao fim.", variant: "destructive" });
      return;
    }
    if (editingId) {
      updateHorario.mutate({ id: editingId, ...form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      if (!selectedProf) return;
      // Check duplicate day
      if (profHorarios.some((h) => h.dia_semana === form.dia_semana)) {
        toast({ title: "Dia já configurado", description: "Edite o horário existente.", variant: "destructive" });
        return;
      }
      createHorario.mutate(
        { profissional_id: selectedProf, ...form },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  // Calculate total weekly hours
  const activeHorarios = profHorarios.filter((h) => h.ativo);
  const totalHoras = activeHorarios.reduce((acc, h) => {
    const [hi, mi] = h.hora_inicio.split(":").map(Number);
    const [hf, mf] = h.hora_fim.split(":").map(Number);
    return acc + (hf * 60 + mf - hi * 60 - mi) / 60;
  }, 0);

  const totalSlots = activeHorarios.reduce((acc, h) => {
    const [hi, mi] = h.hora_inicio.split(":").map(Number);
    const [hf, mf] = h.hora_fim.split(":").map(Number);
    const totalMin = hf * 60 + mf - hi * 60 - mi;
    return acc + Math.floor(totalMin / (h.intervalo_minutos || 30));
  }, 0);

  if (loadingProfs) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-48" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

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
        {(profissionais || []).map((prof) => (
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
              <span className="text-xs font-bold">
                {prof.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{prof.nome}</p>
              <p className="text-xs text-muted-foreground">{prof.especialidades?.[0] || "Profissional"}</p>
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
              <p className="text-2xl font-bold text-foreground">{activeHorarios.length}</p>
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
              <p className="text-2xl font-bold text-muted-foreground">{7 - activeHorarios.length}</p>
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
              {loadingHorarios ? (
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
              ) : (
                <>
                  {/* Visual week overview */}
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {DIAS_SEMANA.map((dia) => {
                      const horario = profHorarios.find((h) => h.dia_semana === dia.value);
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
                              <p className="text-[11px] text-foreground font-medium">{horario.hora_inicio}</p>
                              <p className="text-[10px] text-muted-foreground">às</p>
                              <p className="text-[11px] text-foreground font-medium">{horario.hora_fim}</p>
                              <Badge variant={isActive ? "default" : "secondary"} className="text-[9px] mt-1.5 px-1.5">
                                {horario.intervalo_minutos}min
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
                    {profHorarios.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">Nenhum horário configurado para este profissional.</p>
                    )}
                    {[...profHorarios]
                      .sort((a, b) => a.dia_semana - b.dia_semana)
                      .map((h) => {
                        const dia = DIAS_SEMANA.find((d) => d.value === h.dia_semana);
                        const [hi, mi] = h.hora_inicio.split(":").map(Number);
                        const [hf, mf] = h.hora_fim.split(":").map(Number);
                        const totalMin = hf * 60 + mf - hi * 60 - mi;
                        const slots = Math.floor(totalMin / (h.intervalo_minutos || 30));
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
                                <span>{h.hora_inicio} — {h.hora_fim}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Intervalo: {h.intervalo_minutos}min
                              </Badge>
                              <span className="text-xs text-muted-foreground">{slots} slots • {(totalMin / 60).toFixed(1)}h</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={h.ativo ?? true}
                                onCheckedChange={(v) => updateHorario.mutate({ id: h.id, ativo: v })}
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => openEdit(h)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteHorario.mutate(h.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Horário" : "Novo Horário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Dia da semana</Label>
              <Select
                value={String(form.dia_semana)}
                onValueChange={(v) => setForm((p) => ({ ...p, dia_semana: parseInt(v) }))}
                disabled={!!editingId}
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
                <Input type="time" value={form.hora_inicio} onChange={(e) => setForm((p) => ({ ...p, hora_inicio: e.target.value }))} />
              </div>
              <div>
                <Label>Horário de fim</Label>
                <Input type="time" value={form.hora_fim} onChange={(e) => setForm((p) => ({ ...p, hora_fim: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Intervalo entre atendimentos</Label>
              <Select value={String(form.intervalo_minutos)} onValueChange={(v) => setForm((p) => ({ ...p, intervalo_minutos: parseInt(v) }))}>
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
                  const [hi, mi] = form.hora_inicio.split(":").map(Number);
                  const [hf, mf] = form.hora_fim.split(":").map(Number);
                  const totalMin = hf * 60 + mf - hi * 60 - mi;
                  if (totalMin <= 0) return "Horário inválido";
                  const slots = Math.floor(totalMin / form.intervalo_minutos);
                  return `${slots} slots de ${form.intervalo_minutos}min • ${(totalMin / 60).toFixed(1)}h de atendimento`;
                })()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={createHorario.isPending || updateHorario.isPending}>
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorariosPage;
