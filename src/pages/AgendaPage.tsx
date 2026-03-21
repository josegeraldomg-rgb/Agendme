import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CalendarDays,
  Settings2,
  UserPlus,
  ListChecks,
  BarChart3,
  AlertTriangle,
  Check,
  X,
  Bell,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, addMinutes, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  type SlotAgenda,
  type HorarioFuncionamento,
  type Ausencia,
  type BloqueioAgenda,
  type Feriado,
  type WaitlistEntry,
  gerarSlots,
  gerarSlotsSemana,
  aplicarBloqueios,
  criarEncaixe,
  verificarListaEspera,
  verificarConflito,
  calcularMetricas,
} from "@/lib/scheduling-engine";

/* ══════════════════════════════════════════════════════════════
   Mock Data
   ══════════════════════════════════════════════════════════════ */

const profissionais = [
  { id: "joao", nome: "Dr. João", foto: "" },
  { id: "paula", nome: "Dra. Paula", foto: "" },
  { id: "ricardo", nome: "Dr. Ricardo", foto: "" },
];

const defaultHorarios: HorarioFuncionamento[] = profissionais.flatMap((p) =>
  [1, 2, 3, 4, 5].map((dia) => ({
    id: `${p.id}-${dia}`,
    profissionalId: p.id,
    diaSemana: dia,
    horaInicio: "08:00",
    horaFim: "18:00",
    intervaloMinutos: 30,
  }))
);

const mockAusencias: Ausencia[] = [
  {
    id: "a1",
    profissionalId: "joao",
    dataInicio: new Date(2026, 2, 25),
    dataFim: new Date(2026, 2, 25),
    diaTodo: false,
    horaInicio: "14:00",
    horaFim: "17:00",
    motivo: "Consulta médica",
  },
];

const mockFeriados: Feriado[] = [
  { data: new Date(2026, 3, 3), nome: "Sexta-feira Santa" },
  { data: new Date(2026, 3, 21), nome: "Tiradentes" },
  { data: new Date(2026, 4, 1), nome: "Dia do Trabalho" },
];

const mockAgendamentos: SlotAgenda[] = [
  {
    id: "ag1", profissionalId: "joao",
    dataHoraInicio: new Date(2026, 2, 21, 9, 0),
    dataHoraFim: new Date(2026, 2, 21, 9, 30),
    status: "ocupado", origem: "automatico",
    paciente: "Maria Silva", servico: "Consulta",
  },
  {
    id: "ag2", profissionalId: "joao",
    dataHoraInicio: new Date(2026, 2, 21, 10, 0),
    dataHoraFim: new Date(2026, 2, 21, 10, 30),
    status: "ocupado", origem: "automatico",
    paciente: "Carlos Souza", servico: "Retorno",
  },
  {
    id: "ag3", profissionalId: "paula",
    dataHoraInicio: new Date(2026, 2, 21, 11, 0),
    dataHoraFim: new Date(2026, 2, 21, 12, 0),
    status: "ocupado", origem: "automatico",
    paciente: "Ana Oliveira", servico: "Avaliação Completa",
  },
  {
    id: "ag4", profissionalId: "ricardo",
    dataHoraInicio: new Date(2026, 2, 21, 15, 0),
    dataHoraFim: new Date(2026, 2, 21, 15, 30),
    status: "ocupado", origem: "automatico",
    paciente: "Pedro Santos", servico: "Fisioterapia",
  },
];

const mockListaEspera: WaitlistEntry[] = [
  {
    id: "w1", paciente: "Fernanda Lima", servico: "Consulta",
    profissionalId: "joao", dataPreferida: new Date(2026, 2, 21),
    status: "aguardando",
  },
  {
    id: "w2", paciente: "Lucas Pereira", servico: "Avaliação",
    profissionalId: "paula", dataPreferida: new Date(2026, 2, 22),
    status: "aguardando",
  },
];

/* ══════════════════════════════════════════════════════════════
   Slot status colors
   ══════════════════════════════════════════════════════════════ */

const slotColors: Record<string, string> = {
  livre: "bg-success/10 border-success/30 hover:bg-success/20 cursor-pointer",
  ocupado: "bg-primary/10 border-primary/30",
  bloqueado: "bg-muted border-border opacity-60",
  encaixe: "bg-warning/10 border-warning/30",
};

const slotDot: Record<string, string> = {
  livre: "bg-success",
  ocupado: "bg-primary",
  bloqueado: "bg-muted-foreground",
  encaixe: "bg-warning",
};

type View = "dia" | "semana";

/* ══════════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════════ */

const AgendaPage = () => {
  const { toast } = useToast();
  const [view, setView] = useState<View>("dia");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 21));
  const [filtroProfissional, setFiltroProfissional] = useState("todos");
  const [agendamentos, setAgendamentos] = useState<SlotAgenda[]>(mockAgendamentos);
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [listaEspera, setListaEspera] = useState<WaitlistEntry[]>(mockListaEspera);

  // Dialogs
  const [dialogAgendamento, setDialogAgendamento] = useState(false);
  const [dialogEncaixe, setDialogEncaixe] = useState(false);
  const [dialogListaEspera, setDialogListaEspera] = useState(false);
  const [dialogConfig, setDialogConfig] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotAgenda | null>(null);

  // New appointment form
  const [novoPaciente, setNovoPaciente] = useState("");
  const [novoServico, setNovoServico] = useState("");
  const [novaObservacao, setNovaObservacao] = useState("");

  // Encaixe form
  const [encaixeProfissional, setEncaixeProfissional] = useState("");
  const [encaixeHora, setEncaixeHora] = useState("08:00");
  const [encaixeDuracao, setEncaixeDuracao] = useState("30");
  const [encaixePaciente, setEncaixePaciente] = useState("");
  const [encaixeServico, setEncaixeServico] = useState("");

  // Waitlist form
  const [wlPaciente, setWlPaciente] = useState("");
  const [wlServico, setWlServico] = useState("");
  const [wlProfissional, setWlProfissional] = useState("");
  const [wlData, setWlData] = useState<Date | undefined>();

  /* ── Slot generation ── */
  const slotsProcessados = useMemo(() => {
    const base = view === "dia"
      ? gerarSlots(defaultHorarios, currentDate)
      : gerarSlotsSemana(defaultHorarios, startOfWeek(currentDate, { weekStartsOn: 1 }));

    return aplicarBloqueios(base, agendamentos, mockAusencias, bloqueios, mockFeriados);
  }, [currentDate, view, agendamentos, bloqueios]);

  const slotsFiltrados = useMemo(() => {
    if (filtroProfissional === "todos") return slotsProcessados;
    return slotsProcessados.filter((s) => s.profissionalId === filtroProfissional);
  }, [slotsProcessados, filtroProfissional]);

  const metricas = useMemo(() => calcularMetricas(slotsFiltrados), [slotsFiltrados]);

  /* ── Navigation ── */
  const navPrev = () => setCurrentDate((d) => view === "dia" ? subDays(d, 1) : subDays(d, 7));
  const navNext = () => setCurrentDate((d) => view === "dia" ? addDays(d, 1) : addDays(d, 7));

  /* ── Handlers ── */
  const handleSlotClick = (slot: SlotAgenda) => {
    if (slot.status === "livre") {
      setSelectedSlot(slot);
      setDialogAgendamento(true);
    } else if (slot.status === "ocupado") {
      setSelectedSlot(slot);
    }
  };

  const handleAgendar = () => {
    if (!selectedSlot || !novoPaciente || !novoServico) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const { conflito, motivo } = verificarConflito(
      selectedSlot, agendamentos, mockAusencias, bloqueios, mockFeriados
    );
    if (conflito) {
      toast({ title: "Conflito detectado", description: motivo, variant: "destructive" });
      return;
    }

    const novo: SlotAgenda = {
      ...selectedSlot,
      status: "ocupado",
      paciente: novoPaciente,
      servico: novoServico,
      observacao: novaObservacao || undefined,
    };
    setAgendamentos((prev) => [...prev, novo]);
    toast({ title: "Agendamento criado com sucesso" });
    setNovoPaciente("");
    setNovoServico("");
    setNovaObservacao("");
    setSelectedSlot(null);
    setDialogAgendamento(false);
  };

  const handleCancelar = (slot: SlotAgenda) => {
    setAgendamentos((prev) => prev.filter((a) => a.id !== slot.id));
    // RC7 — check waitlist
    const esperando = verificarListaEspera(slot, listaEspera);
    if (esperando) {
      toast({
        title: "Paciente na lista de espera notificado",
        description: `${esperando.paciente} foi notificado sobre a vaga disponível.`,
      });
      setListaEspera((prev) =>
        prev.map((e) => (e.id === esperando.id ? { ...e, status: "notificado" as const } : e))
      );
    } else {
      toast({ title: "Agendamento cancelado — horário liberado" });
    }
    setSelectedSlot(null);
  };

  const handleEncaixe = () => {
    if (!encaixeProfissional || !encaixePaciente || !encaixeServico) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const [h, m] = encaixeHora.split(":").map(Number);
    const dataInicio = new Date(currentDate);
    dataInicio.setHours(h, m, 0, 0);

    const novoEncaixe = criarEncaixe(
      encaixeProfissional, dataInicio, parseInt(encaixeDuracao), encaixePaciente, encaixeServico
    );

    const { conflito, motivo } = verificarConflito(
      novoEncaixe, agendamentos, mockAusencias, bloqueios, mockFeriados
    );
    if (conflito) {
      toast({ title: "Conflito no encaixe", description: motivo, variant: "destructive" });
      return;
    }

    setAgendamentos((prev) => [...prev, novoEncaixe]);
    toast({ title: "Encaixe criado com sucesso" });
    setEncaixeProfissional("");
    setEncaixeHora("08:00");
    setEncaixeDuracao("30");
    setEncaixePaciente("");
    setEncaixeServico("");
    setDialogEncaixe(false);
  };

  const handleAddWaitlist = () => {
    if (!wlPaciente || !wlServico || !wlProfissional || !wlData) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const entry: WaitlistEntry = {
      id: `wl-${Date.now()}`,
      paciente: wlPaciente,
      servico: wlServico,
      profissionalId: wlProfissional,
      dataPreferida: wlData,
      status: "aguardando",
    };
    setListaEspera((prev) => [...prev, entry]);
    toast({ title: "Paciente adicionado à lista de espera" });
    setWlPaciente("");
    setWlServico("");
    setWlProfissional("");
    setWlData(undefined);
    setDialogListaEspera(false);
  };

  const getNomeProfissional = (id: string) => profissionais.find((p) => p.id === id)?.nome || id;

  /* ── Time labels for day view ── */
  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    for (let h = 8; h <= 17; h++) {
      labels.push(`${String(h).padStart(2, "0")}:00`);
      labels.push(`${String(h).padStart(2, "0")}:30`);
    }
    return labels;
  }, []);

  /* ── Group slots by time for day view ── */
  const slotsByTime = useMemo(() => {
    const map = new Map<string, SlotAgenda[]>();
    for (const s of slotsFiltrados) {
      if (view === "dia" && !isSameDay(s.dataHoraInicio, currentDate)) continue;
      const key = format(s.dataHoraInicio, "HH:mm");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [slotsFiltrados, currentDate, view]);

  /* ── Week days ── */
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  /* ── Slots by day+time for week view ── */
  const slotsByDayTime = useMemo(() => {
    const map = new Map<string, SlotAgenda[]>();
    for (const s of slotsFiltrados) {
      const dayKey = format(s.dataHoraInicio, "yyyy-MM-dd");
      const timeKey = format(s.dataHoraInicio, "HH:mm");
      const key = `${dayKey}-${timeKey}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [slotsFiltrados]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda Inteligente</h1>
          <p className="text-muted-foreground text-sm">Motor de agenda com controle de conflitos em tempo real</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button className="gap-2" onClick={() => { setSelectedSlot(null); setDialogAgendamento(true); }}>
            <Plus className="h-4 w-4" /> Novo Agendamento
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setDialogEncaixe(true)}>
            <UserPlus className="h-4 w-4" /> Encaixe
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setDialogListaEspera(true)}>
            <ListChecks className="h-4 w-4" /> Lista de Espera
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Taxa Ocupação", value: `${metricas.taxaOcupacao}%`, color: "text-primary" },
          { label: "Livres", value: metricas.livres, color: "text-success" },
          { label: "Ocupados", value: metricas.ocupados, color: "text-primary" },
          { label: "Bloqueados", value: metricas.bloqueados, color: "text-muted-foreground" },
          { label: "Encaixes", value: metricas.encaixes, color: "text-warning" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="py-3 px-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={navPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-foreground min-w-[200px] text-center">
                {view === "dia"
                  ? format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
                  : `${format(weekDays[0], "dd/MM")} — ${format(weekDays[6], "dd/MM/yyyy")}`}
              </span>
              <Button variant="outline" size="icon" onClick={navNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentDate(new Date(2026, 2, 21))}>
                Hoje
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["dia", "semana"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <Select value={filtroProfissional} onValueChange={setFiltroProfissional}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {[
              { label: "Livre", color: "bg-success" },
              { label: "Ocupado", color: "bg-primary" },
              { label: "Bloqueado", color: "bg-muted-foreground" },
              { label: "Encaixe", color: "bg-warning" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* ═══ Day View ═══ */}
          {view === "dia" && (
            <div className="space-y-0.5">
              {timeLabels.map((time) => {
                const slotsAtTime = slotsByTime.get(time) || [];
                return (
                  <div key={time} className="flex gap-3 min-h-[44px]">
                    <span className="text-xs font-mono text-muted-foreground w-12 pt-2.5 text-right shrink-0">
                      {time}
                    </span>
                    <div className="flex-1 flex gap-2 border-t border-border pt-1">
                      {slotsAtTime.length > 0 ? (
                        slotsAtTime.map((slot) => (
                          <Tooltip key={slot.id}>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => handleSlotClick(slot)}
                                className={`flex-1 rounded-lg p-2 border text-xs transition-all ${slotColors[slot.status]} ${
                                  slot.status === "ocupado" ? "cursor-pointer" : ""
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <div className={`h-2 w-2 rounded-full shrink-0 ${slotDot[slot.status]}`} />
                                  {slot.status === "ocupado" ? (
                                    <div className="min-w-0">
                                      <p className="font-medium text-foreground truncate">{slot.paciente}</p>
                                      <p className="text-muted-foreground truncate">{slot.servico} • {getNomeProfissional(slot.profissionalId)}</p>
                                    </div>
                                  ) : slot.status === "bloqueado" ? (
                                    <span className="text-muted-foreground">Bloqueado</span>
                                  ) : (
                                    <span className="text-success">{getNomeProfissional(slot.profissionalId)}</span>
                                  )}
                                  {slot.origem === "encaixe" && (
                                    <Badge variant="outline" className="text-[10px] ml-auto border-warning text-warning">Encaixe</Badge>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getNomeProfissional(slot.profissionalId)}</p>
                              <p className="text-xs">{format(slot.dataHoraInicio, "HH:mm")} — {format(slot.dataHoraFim, "HH:mm")}</p>
                              {slot.paciente && <p className="text-xs">{slot.paciente} • {slot.servico}</p>}
                            </TooltipContent>
                          </Tooltip>
                        ))
                      ) : (
                        <div className="flex-1 h-8" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ Week View ═══ */}
          {view === "semana" && (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2">
                  <div />
                  {weekDays.map((d) => (
                    <div
                      key={d.toISOString()}
                      className={`text-center text-xs font-medium p-1.5 rounded-md ${
                        isSameDay(d, new Date(2026, 2, 21)) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div>{format(d, "EEE", { locale: ptBR })}</div>
                      <div className="text-sm font-bold">{format(d, "dd")}</div>
                    </div>
                  ))}
                </div>
                {/* Grid */}
                <div className="space-y-0.5">
                  {timeLabels.filter((_, i) => i % 2 === 0).map((time) => (
                    <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 min-h-[36px]">
                      <span className="text-[10px] font-mono text-muted-foreground text-right pr-2 pt-1">{time}</span>
                      {weekDays.map((day) => {
                        const dayKey = format(day, "yyyy-MM-dd");
                        const slotsHere = slotsByDayTime.get(`${dayKey}-${time}`) || [];
                        const mainSlot = slotsHere[0];
                        if (!mainSlot) {
                          return <div key={dayKey} className="border-t border-border" />;
                        }
                        const occupied = slotsHere.filter((s) => s.status === "ocupado");
                        const allBlocked = slotsHere.every((s) => s.status === "bloqueado");
                        return (
                          <div
                            key={dayKey}
                            onClick={() => mainSlot.status === "livre" && handleSlotClick(mainSlot)}
                            className={`border-t border-border rounded p-1 text-[10px] transition-colors ${
                              allBlocked
                                ? "bg-muted/50 opacity-50"
                                : occupied.length > 0
                                ? "bg-primary/10 cursor-pointer"
                                : "hover:bg-success/10 cursor-pointer"
                            }`}
                          >
                            {occupied.length > 0 && (
                              <div className="truncate font-medium text-foreground">
                                {occupied[0].paciente}
                              </div>
                            )}
                            {allBlocked && <span className="text-muted-foreground">—</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waitlist panel */}
      {listaEspera.filter((e) => e.status === "aguardando").length > 0 && (
        <Card className="border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Lista de Espera ({listaEspera.filter((e) => e.status === "aguardando").length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {listaEspera
                .filter((e) => e.status !== "atendido")
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div className="text-xs">
                      <span className="font-medium text-foreground">{e.paciente}</span>
                      <span className="text-muted-foreground"> • {e.servico} • {getNomeProfissional(e.profissionalId)} • {format(e.dataPreferida, "dd/MM")}</span>
                    </div>
                    <Badge variant={e.status === "notificado" ? "default" : "secondary"} className="text-[10px]">
                      {e.status === "notificado" ? "Notificado" : "Aguardando"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Dialog: New Appointment ═══ */}
      <Dialog open={dialogAgendamento} onOpenChange={(o) => { setDialogAgendamento(o); if (!o) setSelectedSlot(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {format(selectedSlot.dataHoraInicio, "dd/MM/yyyy")} — {format(selectedSlot.dataHoraInicio, "HH:mm")} às {format(selectedSlot.dataHoraFim, "HH:mm")}
              <span className="ml-auto">{getNomeProfissional(selectedSlot.profissionalId)}</span>
            </div>
          )}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Paciente *</Label>
              <Input placeholder="Nome do paciente" value={novoPaciente} onChange={(e) => setNovoPaciente(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Serviço *</Label>
              <Select value={novoServico} onValueChange={setNovoServico}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {["Consulta", "Retorno", "Avaliação Completa", "Fisioterapia"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observação</Label>
              <Textarea placeholder="Observações..." value={novaObservacao} onChange={(e) => setNovaObservacao(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleAgendar}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Dialog: Encaixe ═══ */}
      <Dialog open={dialogEncaixe} onOpenChange={setDialogEncaixe}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-warning" /> Criar Encaixe
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Profissional *</Label>
              <Select value={encaixeProfissional} onValueChange={setEncaixeProfissional}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Horário *</Label>
                <Select value={encaixeHora} onValueChange={setEncaixeHora}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {timeLabels.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duração (min)</Label>
                <Select value={encaixeDuracao} onValueChange={setEncaixeDuracao}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["15", "20", "30", "45", "60"].map((d) => <SelectItem key={d} value={d}>{d} min</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Paciente *</Label>
              <Input placeholder="Nome" value={encaixePaciente} onChange={(e) => setEncaixePaciente(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Serviço *</Label>
              <Input placeholder="Serviço" value={encaixeServico} onChange={(e) => setEncaixeServico(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleEncaixe} className="bg-warning text-warning-foreground hover:bg-warning/90">Criar Encaixe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Dialog: Waitlist ═══ */}
      <Dialog open={dialogListaEspera} onOpenChange={setDialogListaEspera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" /> Adicionar à Lista de Espera
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Paciente *</Label>
              <Input placeholder="Nome" value={wlPaciente} onChange={(e) => setWlPaciente(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Serviço *</Label>
              <Input placeholder="Serviço desejado" value={wlServico} onChange={(e) => setWlServico(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Profissional *</Label>
              <Select value={wlProfissional} onValueChange={setWlProfissional}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data Preferida *</Label>
              <div className="border border-input rounded-md">
                <Calendar mode="single" selected={wlData} onSelect={setWlData} locale={ptBR} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleAddWaitlist}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Dialog: Slot detail (occupied) ═══ */}
      {selectedSlot && selectedSlot.status === "ocupado" && !dialogAgendamento && (
        <Dialog open={true} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Detalhes do Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paciente</span>
                <span className="font-medium text-foreground">{selectedSlot.paciente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço</span>
                <span className="text-foreground">{selectedSlot.servico}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profissional</span>
                <span className="text-foreground">{getNomeProfissional(selectedSlot.profissionalId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário</span>
                <span className="text-foreground">
                  {format(selectedSlot.dataHoraInicio, "HH:mm")} — {format(selectedSlot.dataHoraFim, "HH:mm")}
                </span>
              </div>
              {selectedSlot.origem === "encaixe" && (
                <Badge variant="outline" className="border-warning text-warning">Encaixe</Badge>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="destructive" size="sm" onClick={() => handleCancelar(selectedSlot)} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Cancelar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedSlot(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AgendaPage;
