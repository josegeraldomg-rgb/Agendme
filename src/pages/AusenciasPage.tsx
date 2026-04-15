import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, CalendarOff, Flag, Trash2, Clock, User,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useAusencias, useCreateAusencia, useDeleteAusencia, useFeriados, useCreateFeriado, useDeleteFeriado } from "@/hooks/use-ausencias";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";

const TIPOS_AUSENCIA = [
  { value: "folga", label: "Folga" },
  { value: "ferias", label: "Férias" },
  { value: "bloqueio", label: "Bloqueio" },
  { value: "outro", label: "Outro" },
];

function useProfissionais() {
  const empresaId = useEmpresaId();
  return useQuery({
    queryKey: ["profissionais", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("profissionais_clinica")
        .select("id, nome, ativo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

const AusenciasPage = () => {
  const { data: ausencias, isLoading: loadingAus } = useAusencias();
  const { data: feriados, isLoading: loadingFer } = useFeriados();
  const { data: profissionais } = useProfissionais();
  const createAusencia = useCreateAusencia();
  const deleteAusencia = useDeleteAusencia();
  const createFeriado = useCreateFeriado();
  const deleteFeriado = useDeleteFeriado();

  // ── Absence form ──
  const [openDialog, setOpenDialog] = useState(false);
  const [formProf, setFormProf] = useState("");
  const [formDataInicio, setFormDataInicio] = useState<Date | undefined>();
  const [formDataFim, setFormDataFim] = useState<Date | undefined>();
  const [formDiaTodo, setFormDiaTodo] = useState(true);
  const [formHoraInicio, setFormHoraInicio] = useState("08:00");
  const [formHoraFim, setFormHoraFim] = useState("18:00");
  const [formMotivo, setFormMotivo] = useState("");
  const [formTipo, setFormTipo] = useState("folga");

  // ── Holiday form ──
  const [openFeriadoDialog, setOpenFeriadoDialog] = useState(false);
  const [feriadoData, setFeriadoData] = useState<Date | undefined>();
  const [feriadoNome, setFeriadoNome] = useState("");
  const [feriadoRecorrente, setFeriadoRecorrente] = useState(false);

  const resetForm = () => {
    setFormProf("");
    setFormDataInicio(undefined);
    setFormDataFim(undefined);
    setFormDiaTodo(true);
    setFormHoraInicio("08:00");
    setFormHoraFim("18:00");
    setFormMotivo("");
    setFormTipo("folga");
  };

  const handleSaveAusencia = () => {
    if (!formProf || !formDataInicio || !formMotivo) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const dataFim = formDataFim || formDataInicio;
    createAusencia.mutate(
      {
        profissional_id: formProf,
        data_inicio: format(formDataInicio, "yyyy-MM-dd"),
        data_fim: format(dataFim, "yyyy-MM-dd"),
        dia_todo: formDiaTodo,
        hora_inicio: formDiaTodo ? null : formHoraInicio,
        hora_fim: formDiaTodo ? null : formHoraFim,
        motivo: formMotivo,
        tipo: formTipo,
      },
      {
        onSuccess: () => {
          resetForm();
          setOpenDialog(false);
        },
      }
    );
  };

  const handleSaveFeriado = () => {
    if (!feriadoData || !feriadoNome) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createFeriado.mutate(
      {
        data: format(feriadoData, "yyyy-MM-dd"),
        nome: feriadoNome,
        recorrente: feriadoRecorrente,
      },
      {
        onSuccess: () => {
          setFeriadoData(undefined);
          setFeriadoNome("");
          setFeriadoRecorrente(false);
          setOpenFeriadoDialog(false);
        },
      }
    );
  };

  const formatDateRange = (a: NonNullable<typeof ausencias>[0]) => {
    const inicio = format(new Date(a.data_inicio), "dd/MM/yyyy", { locale: ptBR });
    const fim = format(new Date(a.data_fim), "dd/MM/yyyy", { locale: ptBR });
    if (inicio === fim) {
      if (a.dia_todo) return `${inicio} — Dia todo`;
      return `${inicio} — ${a.hora_inicio || ""} às ${a.hora_fim || ""}`;
    }
    return `${inicio} a ${fim}`;
  };

  const isLoading = loadingAus || loadingFer;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-80" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ausências & Feriados</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie bloqueios de agenda e feriados da clínica
          </p>
        </div>
      </div>

      <Tabs defaultValue="ausencias" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="ausencias" className="gap-2">
            <CalendarOff className="h-4 w-4" />
            Ausências ({ausencias?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="feriados" className="gap-2">
            <Flag className="h-4 w-4" />
            Feriados ({feriados?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ═══════ TAB: Ausências ═══════ */}
        <TabsContent value="ausencias" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => { resetForm(); setOpenDialog(true); }}>
              <Plus className="h-4 w-4" />
              Nova Ausência
            </Button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {(ausencias || []).length === 0 && (
              <Card className="p-8">
                <p className="text-sm text-muted-foreground text-center">Nenhuma ausência registrada.</p>
              </Card>
            )}
            {(ausencias || []).map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {a.profissionais_clinica?.nome || "Profissional"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs capitalize">{a.tipo || "folga"}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateRange(a)}
                          </span>
                        </div>
                        {a.motivo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Motivo: {a.motivo}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => deleteAusencia.mutate(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ═══════ TAB: Feriados ═══════ */}
        <TabsContent value="feriados" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setOpenFeriadoDialog(true)}>
              <Plus className="h-4 w-4" />
              Novo Feriado
            </Button>
          </div>

          <div className="space-y-2">
            {(feriados || []).length === 0 && (
              <Card className="p-8">
                <p className="text-sm text-muted-foreground text-center">Nenhum feriado cadastrado.</p>
              </Card>
            )}
            {(feriados || []).map((f) => (
              <Card key={f.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Flag className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(f.data), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          {f.recorrente && (
                            <Badge variant="secondary" className="text-[10px]">Recorrente</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteFeriado.mutate(f.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Ausência Dialog ── */}
      <Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Ausência Programada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Profissional *</Label>
              <Select value={formProf} onValueChange={setFormProf}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {(profissionais || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formTipo} onValueChange={setFormTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_AUSENCIA.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motivo *</Label>
                <Input
                  placeholder="Ex: Consulta médica..."
                  value={formMotivo}
                  onChange={(e) => setFormMotivo(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <div className="border border-input rounded-md">
                  <Calendar
                    mode="single"
                    selected={formDataInicio}
                    onSelect={setFormDataInicio}
                    locale={ptBR}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <div className="border border-input rounded-md">
                  <Calendar
                    mode="single"
                    selected={formDataFim}
                    onSelect={setFormDataFim}
                    locale={ptBR}
                    disabled={(date) => formDataInicio ? date < formDataInicio : false}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dia todo</p>
                <p className="text-xs text-muted-foreground">Bloquear o dia inteiro</p>
              </div>
              <Switch checked={formDiaTodo} onCheckedChange={setFormDiaTodo} />
            </div>

            {!formDiaTodo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input type="time" value={formHoraInicio} onChange={(e) => setFormHoraInicio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input type="time" value={formHoraFim} onChange={(e) => setFormHoraFim(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveAusencia} disabled={createAusencia.isPending}>
              {createAusencia.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Feriado Dialog ── */}
      <Dialog open={openFeriadoDialog} onOpenChange={setOpenFeriadoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Feriado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Aniversário da cidade"
                value={feriadoNome}
                onChange={(e) => setFeriadoNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data *</Label>
              <div className="border border-input rounded-md">
                <Calendar
                  mode="single"
                  selected={feriadoData}
                  onSelect={setFeriadoData}
                  locale={ptBR}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Recorrente</p>
                <p className="text-xs text-muted-foreground">Repetir todos os anos</p>
              </div>
              <Switch checked={feriadoRecorrente} onCheckedChange={setFeriadoRecorrente} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenFeriadoDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveFeriado} disabled={createFeriado.isPending}>
              {createFeriado.isPending ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AusenciasPage;
