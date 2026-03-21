import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  CalendarOff,
  Flag,
  Trash2,
  Bell,
  Clock,
  User,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

/* ── Types ── */
interface Ausencia {
  id: string;
  profissional: string;
  dataInicio: Date;
  dataFim: Date;
  horaInicio?: string;
  horaFim?: string;
  diaTodo: boolean;
  motivo: string;
  observacao?: string;
  lembrete: boolean;
  lembreteAntecedencia?: string;
}

interface Feriado {
  data: Date;
  nome: string;
  nacional: boolean;
}

/* ── Brazilian holidays 2026 ── */
const feriadosNacionais2026: Feriado[] = [
  { data: new Date(2026, 0, 1), nome: "Confraternização Universal", nacional: true },
  { data: new Date(2026, 1, 16), nome: "Carnaval", nacional: true },
  { data: new Date(2026, 1, 17), nome: "Carnaval", nacional: true },
  { data: new Date(2026, 3, 3), nome: "Sexta-feira Santa", nacional: true },
  { data: new Date(2026, 3, 21), nome: "Tiradentes", nacional: true },
  { data: new Date(2026, 4, 1), nome: "Dia do Trabalho", nacional: true },
  { data: new Date(2026, 5, 4), nome: "Corpus Christi", nacional: true },
  { data: new Date(2026, 8, 7), nome: "Independência do Brasil", nacional: true },
  { data: new Date(2026, 9, 12), nome: "Nossa Sra. Aparecida", nacional: true },
  { data: new Date(2026, 10, 2), nome: "Finados", nacional: true },
  { data: new Date(2026, 10, 15), nome: "Proclamação da República", nacional: true },
  { data: new Date(2026, 11, 25), nome: "Natal", nacional: true },
];

const profissionais = [
  { id: "joao", nome: "Dr. João" },
  { id: "paula", nome: "Dra. Paula" },
  { id: "ricardo", nome: "Dr. Ricardo" },
];

const horarios = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const AusenciasPage = () => {
  const { toast } = useToast();

  /* ── Absences state ── */
  const [ausencias, setAusencias] = useState<Ausencia[]>([
    {
      id: "1",
      profissional: "joao",
      dataInicio: new Date(2026, 2, 25),
      dataFim: new Date(2026, 2, 25),
      horaInicio: "14:00",
      horaFim: "17:00",
      diaTodo: false,
      motivo: "Compromisso pessoal",
      observacao: "Consulta médica",
      lembrete: true,
      lembreteAntecedencia: "1h",
    },
    {
      id: "2",
      profissional: "paula",
      dataInicio: new Date(2026, 2, 28),
      dataFim: new Date(2026, 2, 30),
      diaTodo: true,
      motivo: "Viagem",
      observacao: "Congresso de medicina",
      lembrete: true,
      lembreteAntecedencia: "1d",
    },
  ]);

  /* ── Holidays state ── */
  const [feriadosAtivos, setFeriadosAtivos] = useState(true);
  const [feriadosCustom, setFeriadosCustom] = useState<Feriado[]>([]);

  /* ── New absence form ── */
  const [openDialog, setOpenDialog] = useState(false);
  const [novoProfissional, setNovoProfissional] = useState("");
  const [novaDataInicio, setNovaDataInicio] = useState<Date | undefined>();
  const [novaDataFim, setNovaDataFim] = useState<Date | undefined>();
  const [novoDiaTodo, setNovoDiaTodo] = useState(true);
  const [novaHoraInicio, setNovaHoraInicio] = useState("08:00");
  const [novaHoraFim, setNovaHoraFim] = useState("18:00");
  const [novoMotivo, setNovoMotivo] = useState("");
  const [novaObservacao, setNovaObservacao] = useState("");
  const [novoLembrete, setNovoLembrete] = useState(false);
  const [novaAntecedencia, setNovaAntecedencia] = useState("1h");

  /* ── New custom holiday form ── */
  const [openFeriadoDialog, setOpenFeriadoDialog] = useState(false);
  const [novoFeriadoData, setNovoFeriadoData] = useState<Date | undefined>();
  const [novoFeriadoNome, setNovoFeriadoNome] = useState("");

  const resetForm = () => {
    setNovoProfissional("");
    setNovaDataInicio(undefined);
    setNovaDataFim(undefined);
    setNovoDiaTodo(true);
    setNovaHoraInicio("08:00");
    setNovaHoraFim("18:00");
    setNovoMotivo("");
    setNovaObservacao("");
    setNovoLembrete(false);
    setNovaAntecedencia("1h");
  };

  const handleSaveAusencia = () => {
    if (!novoProfissional || !novaDataInicio || !novoMotivo) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const nova: Ausencia = {
      id: Date.now().toString(),
      profissional: novoProfissional,
      dataInicio: novaDataInicio,
      dataFim: novaDataFim || novaDataInicio,
      diaTodo: novoDiaTodo,
      horaInicio: novoDiaTodo ? undefined : novaHoraInicio,
      horaFim: novoDiaTodo ? undefined : novaHoraFim,
      motivo: novoMotivo,
      observacao: novaObservacao || undefined,
      lembrete: novoLembrete,
      lembreteAntecedencia: novoLembrete ? novaAntecedencia : undefined,
    };
    setAusencias((prev) => [...prev, nova]);
    toast({ title: "Ausência registrada com sucesso" });
    if (novoLembrete) {
      toast({
        title: "Lembrete WhatsApp configurado",
        description: `O profissional receberá um lembrete ${novaAntecedencia === "1h" ? "1 hora" : novaAntecedencia === "2h" ? "2 horas" : novaAntecedencia === "1d" ? "1 dia" : "30 minutos"} antes.`,
      });
    }
    resetForm();
    setOpenDialog(false);
  };

  const handleRemoveAusencia = (id: string) => {
    setAusencias((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Ausência removida" });
  };

  const handleSaveFeriado = () => {
    if (!novoFeriadoData || !novoFeriadoNome) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setFeriadosCustom((prev) => [
      ...prev,
      { data: novoFeriadoData, nome: novoFeriadoNome, nacional: false },
    ]);
    toast({ title: "Feriado adicionado" });
    setNovoFeriadoData(undefined);
    setNovoFeriadoNome("");
    setOpenFeriadoDialog(false);
  };

  const handleRemoveFeriado = (idx: number) => {
    setFeriadosCustom((prev) => prev.filter((_, i) => i !== idx));
    toast({ title: "Feriado removido" });
  };

  const todosOsFeriados = feriadosAtivos
    ? [...feriadosNacionais2026, ...feriadosCustom].sort((a, b) => a.data.getTime() - b.data.getTime())
    : [...feriadosCustom].sort((a, b) => a.data.getTime() - b.data.getTime());

  const getNomeProfissional = (id: string) =>
    profissionais.find((p) => p.id === id)?.nome || id;

  const formatDateRange = (a: Ausencia) => {
    const inicio = format(a.dataInicio, "dd/MM/yyyy", { locale: ptBR });
    const fim = format(a.dataFim, "dd/MM/yyyy", { locale: ptBR });
    if (inicio === fim) {
      if (a.diaTodo) return `${inicio} — Dia todo`;
      return `${inicio} — ${a.horaInicio} às ${a.horaFim}`;
    }
    return `${inicio} a ${fim} — Dia todo`;
  };

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
            Ausências
          </TabsTrigger>
          <TabsTrigger value="feriados" className="gap-2">
            <Flag className="h-4 w-4" />
            Feriados
          </TabsTrigger>
        </TabsList>

        {/* ═══════ TAB: Ausências ═══════ */}
        <TabsContent value="ausencias" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Ausência
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Ausência Programada</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Profissional */}
                  <div className="space-y-2">
                    <Label>Profissional *</Label>
                    <Select value={novoProfissional} onValueChange={setNovoProfissional}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Motivo */}
                  <div className="space-y-2">
                    <Label>Motivo *</Label>
                    <Input
                      placeholder="Ex: Consulta médica, viagem..."
                      value={novoMotivo}
                      onChange={(e) => setNovoMotivo(e.target.value)}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Início *</Label>
                      <div className="border border-input rounded-md">
                        <Calendar
                          mode="single"
                          selected={novaDataInicio}
                          onSelect={setNovaDataInicio}
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
                          selected={novaDataFim}
                          onSelect={setNovaDataFim}
                          locale={ptBR}
                          disabled={(date) => novaDataInicio ? date < novaDataInicio : false}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dia todo / horário */}
                  <div className="flex items-center gap-3">
                    <Switch checked={novoDiaTodo} onCheckedChange={setNovoDiaTodo} id="dia-todo" />
                    <Label htmlFor="dia-todo">Dia todo</Label>
                  </div>
                  {!novoDiaTodo && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hora Início</Label>
                        <Select value={novaHoraInicio} onValueChange={setNovaHoraInicio}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {horarios.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Hora Fim</Label>
                        <Select value={novaHoraFim} onValueChange={setNovaHoraFim}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {horarios.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Observação */}
                  <div className="space-y-2">
                    <Label>Observação</Label>
                    <Textarea
                      placeholder="Detalhes adicionais..."
                      value={novaObservacao}
                      onChange={(e) => setNovaObservacao(e.target.value)}
                    />
                  </div>

                  {/* Lembrete WhatsApp */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Switch checked={novoLembrete} onCheckedChange={setNovoLembrete} id="lembrete" />
                        <Label htmlFor="lembrete" className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-primary" />
                          Lembrete via WhatsApp
                        </Label>
                      </div>
                      {novoLembrete && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Antecedência do lembrete</Label>
                          <Select value={novaAntecedencia} onValueChange={setNovaAntecedencia}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30m">30 minutos antes</SelectItem>
                              <SelectItem value="1h">1 hora antes</SelectItem>
                              <SelectItem value="2h">2 horas antes</SelectItem>
                              <SelectItem value="1d">1 dia antes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSaveAusencia}>Salvar Ausência</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de ausências */}
          {ausencias.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Nenhuma ausência programada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ausencias.map((a) => (
                <Card key={a.id} className="border-l-4 border-l-warning">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm text-foreground">
                            {getNomeProfissional(a.profissional)}
                          </span>
                          <Badge variant="secondary" className="text-xs">{a.motivo}</Badge>
                          {a.lembrete && (
                            <Badge className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
                              <Bell className="h-3 w-3" />
                              Lembrete {a.lembreteAntecedencia}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateRange(a)}
                        </div>
                        {a.observacao && (
                          <p className="text-xs text-muted-foreground mt-1">{a.observacao}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveAusencia(a.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══════ TAB: Feriados ═══════ */}
        <TabsContent value="feriados" className="space-y-4 mt-4">
          {/* Toggle feriados nacionais */}
          <Card className="border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Flag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Bloquear feriados nacionais automaticamente
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bloqueia a agenda de todos os profissionais nos feriados nacionais de 2026
                    </p>
                  </div>
                </div>
                <Switch
                  checked={feriadosAtivos}
                  onCheckedChange={(checked) => {
                    setFeriadosAtivos(checked);
                    toast({
                      title: checked
                        ? "Feriados nacionais ativados"
                        : "Feriados nacionais desativados",
                      description: checked
                        ? "A agenda será bloqueada automaticamente em todos os feriados nacionais."
                        : "Os feriados nacionais não bloquearão mais a agenda.",
                    });
                  }}
                  id="feriados-nacionais"
                />
              </div>
            </CardContent>
          </Card>

          {/* Add custom holiday */}
          <div className="flex justify-end">
            <Dialog open={openFeriadoDialog} onOpenChange={setOpenFeriadoDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Feriado Personalizado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Adicionar Feriado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Nome do feriado *</Label>
                    <Input
                      placeholder="Ex: Aniversário da cidade"
                      value={novoFeriadoNome}
                      onChange={(e) => setNovoFeriadoNome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <div className="border border-input rounded-md">
                      <Calendar
                        mode="single"
                        selected={novoFeriadoData}
                        onSelect={setNovoFeriadoData}
                        locale={ptBR}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSaveFeriado}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Holiday list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Feriados de 2026</CardTitle>
            </CardHeader>
            <CardContent>
              {todosOsFeriados.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum feriado configurado. Ative os feriados nacionais ou adicione um personalizado.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {todosOsFeriados.map((f, idx) => {
                    const isPast = f.data < new Date();
                    return (
                      <div
                        key={`${f.nome}-${idx}`}
                        className={`flex items-center justify-between py-3 ${isPast ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-semibold text-destructive leading-none">
                              {format(f.data, "MMM", { locale: ptBR }).toUpperCase()}
                            </span>
                            <span className="text-sm font-bold text-destructive leading-none">
                              {format(f.data, "dd")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{f.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(f.data, "EEEE", { locale: ptBR })}
                              {f.nacional && (
                                <span className="ml-2 text-primary">• Nacional</span>
                              )}
                              {!f.nacional && (
                                <span className="ml-2 text-warning">• Personalizado</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={isPast ? "" : "bg-destructive/10 text-destructive border-destructive/20"}
                          >
                            {isPast ? "Passado" : "Agenda bloqueada"}
                          </Badge>
                          {!f.nacional && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              onClick={() => {
                                const customIdx = feriadosCustom.findIndex(
                                  (fc) => fc.nome === f.nome && fc.data.getTime() === f.data.getTime()
                                );
                                if (customIdx >= 0) handleRemoveFeriado(customIdx);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Como funciona o bloqueio</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quando um feriado está ativo, a agenda de <strong>todos os profissionais</strong> da
                    empresa é bloqueada automaticamente para o dia inteiro. Novos agendamentos não poderão
                    ser feitos por clientes ou pela recepção nesses dias.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AusenciasPage;
