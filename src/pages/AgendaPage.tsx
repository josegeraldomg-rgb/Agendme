import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  UserPlus,
  ListChecks,
  Bell,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  type SlotAgenda,
  type HorarioFuncionamento,
  type WaitlistEntry,
  gerarSlots,
  gerarSlotsSemana,
  aplicarBloqueios,
  criarEncaixe,
  verificarListaEspera,
  calcularMetricas,
} from "@/lib/scheduling-engine";
import {
  useAgendamentosByRange,
  useCreateAgendamento,
  useUpdateAgendamento,
  useCancelAgendamento,
  useProfissionais,
  useHorariosFuncionamento,
} from "@/hooks/use-agendamentos";
import { useServicos } from "@/hooks/use-servicos";
import { useClientes } from "@/hooks/use-clientes";

/* ══════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════ */

function dbToHorario(h: {
  id: string;
  profissional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_minutos: number | null;
}): HorarioFuncionamento {
  return {
    id: h.id,
    profissionalId: h.profissional_id,
    diaSemana: h.dia_semana,
    horaInicio: h.hora_inicio,
    horaFim: h.hora_fim,
    intervaloMinutos: h.intervalo_minutos ?? 30,
  };
}

function dbToSlot(ag: {
  id: string;
  profissional_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  clientes?: { nome: string } | null;
  servicos?: { nome: string } | null;
  observacoes?: string | null;
}): SlotAgenda {
  return {
    id: ag.id,
    profissionalId: ag.profissional_id,
    dataHoraInicio: new Date(`${ag.data}T${ag.hora_inicio}`),
    dataHoraFim: new Date(`${ag.data}T${ag.hora_fim}`),
    status: "ocupado",
    origem: "automatico",
    paciente: ag.clientes?.nome ?? "—",
    servico: ag.servicos?.nome ?? "—",
    observacao: ag.observacoes ?? undefined,
  };
}

/* ══════════════════════════════════════════════════════════════
   Constants
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

const TIME_LABELS: string[] = [];
for (let h = 7; h <= 19; h++) {
  TIME_LABELS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_LABELS.push(`${String(h).padStart(2, "0")}:30`);
}

type View = "dia" | "semana";

/* ══════════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════════ */

const AgendaPage = () => {
  const { toast } = useToast();
  const [view, setView] = useState<View>("dia");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filtroProfissional, setFiltroProfissional] = useState("todos");
  const [listaEspera, setListaEspera] = useState<WaitlistEntry[]>([]);

  // Dialogs
  const [dialogAgendamento, setDialogAgendamento] = useState(false);
  const [dialogEncaixe, setDialogEncaixe] = useState(false);
  const [dialogListaEspera, setDialogListaEspera] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotAgenda | null>(null);

  // New appointment form
  const [novoPacienteId, setNovoPacienteId] = useState("");
  const [novoServicoId, setNovoServicoId] = useState("");
  const [novoProfissionalId, setNovoProfissionalId] = useState("");
  const [novaData, setNovaData] = useState(format(new Date(), "yyyy-MM-dd"));
  const [novaHoraInicio, setNovaHoraInicio] = useState("08:00");
  const [novaObservacao, setNovaObservacao] = useState("");

  // Encaixe form
  const [encaixeProfissional, setEncaixeProfissional] = useState("");
  const [encaixeHora, setEncaixeHora] = useState("08:00");
  const [encaixeDuracao, setEncaixeDuracao] = useState("30");
  const [encaixePacienteId, setEncaixePacienteId] = useState("");
  const [encaixeServicoId, setEncaixeServicoId] = useState("");

  // Waitlist form
  const [wlPaciente, setWlPaciente] = useState("");
  const [wlServico, setWlServico] = useState("");
  const [wlProfissional, setWlProfissional] = useState("");
  const [wlData, setWlData] = useState<Date | undefined>();

  /* ── Date range for DB queries ── */
  const rangeStart = useMemo(
    () =>
      format(
        view === "semana"
          ? startOfWeek(currentDate, { weekStartsOn: 1 })
          : currentDate,
        "yyyy-MM-dd"
      ),
    [currentDate, view]
  );
  const rangeEnd = useMemo(
    () =>
      format(
        view === "semana"
          ? addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6)
          : currentDate,
        "yyyy-MM-dd"
      ),
    [currentDate, view]
  );

  /* ── Real data hooks ── */
  const { data: dbAgendamentos = [], isLoading: loadingAg } = useAgendamentosByRange(rangeStart, rangeEnd);
  const { data: dbProfissionais = [] } = useProfissionais();
  const { data: dbHorarios = [] } = useHorariosFuncionamento();
  const { data: dbServicos = [] } = useServicos({ ativo: true });
  const { data: dbClientes = [] } = useClientes({ ativo: true });

  /* ── Mutations ── */
  const createAgendamento = useCreateAgendamento();
  const cancelAgendamento = useCancelAgendamento();
  const updateAgendamento = useUpdateAgendamento();

  /* ── Transform DB data for scheduling engine ── */
  const horarios = useMemo(() => dbHorarios.map(dbToHorario), [dbHorarios]);
  const agendamentosSlots = useMemo(() => dbAgendamentos.map(dbToSlot), [dbAgendamentos]);

  /* ── Derived service duration for hora_fim ── */
  const selectedServicoDuracao = useMemo(() => {
    if (!novoServicoId) return 30;
    return dbServicos.find((s) => s.id === novoServicoId)?.duracao_minutos ?? 30;
  }, [novoServicoId, dbServicos]);

  const encaixeServicoDuracao = useMemo(() => {
    if (!encaixeServicoId) return parseInt(encaixeDuracao);
    return dbServicos.find((s) => s.id === encaixeServicoId)?.duracao_minutos ?? parseInt(encaixeDuracao);
  }, [encaixeServicoId, encaixeDuracao, dbServicos]);

  /* ── Slot generation ── */
  const slotsProcessados = useMemo(() => {
    const base =
      view === "dia"
        ? gerarSlots(horarios, currentDate)
        : gerarSlotsSemana(horarios, startOfWeek(currentDate, { weekStartsOn: 1 }));
    return aplicarBloqueios(base, agendamentosSlots, [], [], []);
  }, [currentDate, view, agendamentosSlots, horarios]);

  const slotsFiltrados = useMemo(() => {
    if (filtroProfissional === "todos") return slotsProcessados;
    return slotsProcessados.filter((s) => s.profissionalId === filtroProfissional);
  }, [slotsProcessados, filtroProfissional]);

  const metricas = useMemo(() => calcularMetricas(slotsFiltrados), [slotsFiltrados]);

  /* ── Navigation ── */
  const navPrev = () =>
    setCurrentDate((d) => (view === "dia" ? subDays(d, 1) : subDays(d, 7)));
  const navNext = () =>
    setCurrentDate((d) => (view === "dia" ? addDays(d, 1) : addDays(d, 7)));

  /* ── Form reset ── */
  const resetAgendamentoForm = () => {
    setNovoPacienteId("");
    setNovoServicoId("");
    setNovoProfissionalId("");
    setNovaData(format(new Date(), "yyyy-MM-dd"));
    setNovaHoraInicio("08:00");
    setNovaObservacao("");
    setSelectedSlot(null);
  };

  /* ── Handlers ── */
  const handleSlotClick = (slot: SlotAgenda) => {
    if (slot.status === "livre") {
      setSelectedSlot(slot);
      setNovoProfissionalId(slot.profissionalId);
      setNovaData(format(slot.dataHoraInicio, "yyyy-MM-dd"));
      setNovaHoraInicio(format(slot.dataHoraInicio, "HH:mm"));
      setDialogAgendamento(true);
    } else if (slot.status === "ocupado") {
      setSelectedSlot(slot);
    }
  };

  const handleAgendar = () => {
    if (!novoPacienteId || !novoServicoId || !novoProfissionalId || !novaData || !novaHoraInicio) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    const dtFim = addMinutes(new Date(`${novaData}T${novaHoraInicio}`), selectedServicoDuracao);
    const horaFim = format(dtFim, "HH:mm");

    createAgendamento.mutate(
      {
        paciente_id: novoPacienteId,
        servico_id: novoServicoId,
        profissional_id: novoProfissionalId,
        data: novaData,
        hora_inicio: novaHoraInicio,
        hora_fim: horaFim,
        observacoes: novaObservacao || null,
        status: "agendado",
        origem: "painel",
      },
      {
        onSuccess: () => {
          resetAgendamentoForm();
          setDialogAgendamento(false);
        },
      }
    );
  };

  const handleCancelar = (slot: SlotAgenda) => {
    cancelAgendamento.mutate(
      { id: slot.id, tipo: "cancelado_clinica" },
      {
        onSuccess: () => {
          const esperando = verificarListaEspera(slot, listaEspera);
          if (esperando) {
            toast({
              title: "Paciente na lista de espera notificado",
              description: `${esperando.paciente} foi notificado sobre a vaga disponível.`,
            });
            setListaEspera((prev) =>
              prev.map((e) =>
                e.id === esperando.id ? { ...e, status: "notificado" as const } : e
              )
            );
          }
          setSelectedSlot(null);
        },
      }
    );
  };

  const handleConfirmar = (slot: SlotAgenda) => {
    updateAgendamento.mutate(
      { id: slot.id, status: "confirmado" as any, confirmado_em: new Date().toISOString() },
      { onSuccess: () => setSelectedSlot(null) }
    );
  };

  const handleAtendido = (slot: SlotAgenda) => {
    updateAgendamento.mutate(
      { id: slot.id, status: "atendido" as any, atendido_em: new Date().toISOString() },
      { onSuccess: () => setSelectedSlot(null) }
    );
  };

  const handleEncaixe = () => {
    if (!encaixeProfissional || !encaixePacienteId || !encaixeServicoId) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const dtFim = addMinutes(
      new Date(`${format(currentDate, "yyyy-MM-dd")}T${encaixeHora}`),
      encaixeServicoDuracao
    );

    createAgendamento.mutate(
      {
        paciente_id: encaixePacienteId,
        servico_id: encaixeServicoId,
        profissional_id: encaixeProfissional,
        data: format(currentDate, "yyyy-MM-dd"),
        hora_inicio: encaixeHora,
        hora_fim: format(dtFim, "HH:mm"),
        status: "agendado",
        origem: "encaixe",
      },
      {
        onSuccess: () => {
          setEncaixeProfissional("");
          setEncaixeHora("08:00");
          setEncaixeDuracao("30");
          setEncaixePacienteId("");
          setEncaixeServicoId("");
          setDialogEncaixe(false);
        },
      }
    );
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

  const getNomeProfissional = (id: string) =>
    dbProfissionais.find((p) => p.id === id)?.nome || id;

  /* ── Group slots ── */
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

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const slotsByDayTime = useMemo(() => {
    const map = new Map<string, SlotAgenda[]>();
    for (const s of slotsFiltrados) {
      const key = `${format(s.dataHoraInicio, "yyyy-MM-dd")}-${format(s.dataHoraInicio, "HH:mm")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [slotsFiltrados]);

  const isMutating =
    createAgendamento.isPending || cancelAgendamento.isPending || updateAgendamento.isPending;

  /* ════════════════════════════════════════ RENDER ════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda Inteligente</h1>
          <p className="text-muted-foreground text-sm">
            Motor de agenda com controle de conflitos em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            id="btn-novo-agendamento"
            className="gap-2"
            onClick={() => {
              resetAgendamentoForm();
              setDialogAgendamento(true);
            }}
          >
            <Plus className="h-4 w-4" /> Novo Agendamento
          </Button>
          <Button
            id="btn-encaixe"
            variant="outline"
            className="gap-2"
            onClick={() => setDialogEncaixe(true)}
          >
            <UserPlus className="h-4 w-4" /> Encaixe
          </Button>
          <Button
            id="btn-lista-espera"
            variant="outline"
            className="gap-2"
            onClick={() => setDialogListaEspera(true)}
          >
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
              <Button variant="outline" size="icon" onClick={navPrev} id="btn-prev">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-foreground min-w-[200px] text-center">
                {view === "dia"
                  ? format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
                  : `${format(weekDays[0], "dd/MM")} — ${format(weekDays[6], "dd/MM/yyyy")}`}
              </span>
              <Button variant="outline" size="icon" onClick={navNext} id="btn-next">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentDate(new Date())}
                id="btn-hoje"
              >
                Hoje
              </Button>
              {loadingAg && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["dia", "semana"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      view === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <Select value={filtroProfissional} onValueChange={setFiltroProfissional}>
                <SelectTrigger className="w-[160px] h-8 text-xs" id="select-profissional-filtro">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {dbProfissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
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
          {/* ═══ Empty state when no schedules ═══ */}
          {!loadingAg && horarios.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">Nenhum horário configurado</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Configure os horários de funcionamento dos profissionais para visualizar a agenda.
              </p>
              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/horarios")}>
                Configurar Horários
              </Button>
            </div>
          )}

          {/* ═══ Day View ═══ */}
          {view === "dia" && horarios.length > 0 && (
            <div className="space-y-0.5">
              {TIME_LABELS.map((time) => {
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
                                  <div
                                    className={`h-2 w-2 rounded-full shrink-0 ${slotDot[slot.status]}`}
                                  />
                                  {slot.status === "ocupado" ? (
                                    <div className="min-w-0">
                                      <p className="font-medium text-foreground truncate">
                                        {slot.paciente}
                                      </p>
                                      <p className="text-muted-foreground truncate">
                                        {slot.servico} • {getNomeProfissional(slot.profissionalId)}
                                      </p>
                                    </div>
                                  ) : slot.status === "bloqueado" ? (
                                    <span className="text-muted-foreground">Bloqueado</span>
                                  ) : (
                                    <span className="text-success">
                                      {getNomeProfissional(slot.profissionalId)}
                                    </span>
                                  )}
                                  {slot.origem === "encaixe" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] ml-auto border-warning text-warning"
                                    >
                                      Encaixe
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getNomeProfissional(slot.profissionalId)}</p>
                              <p className="text-xs">
                                {format(slot.dataHoraInicio, "HH:mm")} —{" "}
                                {format(slot.dataHoraFim, "HH:mm")}
                              </p>
                              {slot.paciente && (
                                <p className="text-xs">
                                  {slot.paciente} • {slot.servico}
                                </p>
                              )}
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
          {view === "semana" && horarios.length > 0 && (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2">
                  <div />
                  {weekDays.map((d) => (
                    <div
                      key={d.toISOString()}
                      className={`text-center text-xs font-medium p-1.5 rounded-md ${
                        isSameDay(d, new Date()) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div>{format(d, "EEE", { locale: ptBR })}</div>
                      <div className="text-sm font-bold">{format(d, "dd")}</div>
                    </div>
                  ))}
                </div>
                {/* Grid */}
                <div className="space-y-0.5">
                  {TIME_LABELS.filter((_, i) => i % 2 === 0).map((time) => (
                    <div
                      key={time}
                      className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 min-h-[36px]"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground text-right pr-2 pt-1">
                        {time}
                      </span>
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
                            onClick={() =>
                              mainSlot.status === "livre" && handleSlotClick(mainSlot)
                            }
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
                      <span className="text-muted-foreground">
                        {" "}
                        • {e.servico} • {getNomeProfissional(e.profissionalId)} •{" "}
                        {format(e.dataPreferida, "dd/MM")}
                      </span>
                    </div>
                    <Badge
                      variant={e.status === "notificado" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {e.status === "notificado" ? "Notificado" : "Aguardando"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Dialog: New Appointment ═══ */}
      <Dialog
        open={dialogAgendamento}
        onOpenChange={(o) => {
          setDialogAgendamento(o);
          if (!o) resetAgendamentoForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>

          {selectedSlot && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {format(selectedSlot.dataHoraInicio, "dd/MM/yyyy")} —{" "}
              {format(selectedSlot.dataHoraInicio, "HH:mm")} às{" "}
              {format(selectedSlot.dataHoraFim, "HH:mm")}
              <span className="ml-auto">{getNomeProfissional(selectedSlot.profissionalId)}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Profissional (shown when no slot) */}
            {!selectedSlot && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Profissional *</Label>
                    <Select value={novoProfissionalId} onValueChange={setNovoProfissionalId}>
                      <SelectTrigger id="select-prof-new">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {dbProfissionais.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data *</Label>
                    <Input
                      id="input-data-new"
                      type="date"
                      value={novaData}
                      onChange={(e) => setNovaData(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Horário de início *</Label>
                  <Select value={novaHoraInicio} onValueChange={setNovaHoraInicio}>
                    <SelectTrigger id="select-hora-new">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_LABELS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Paciente */}
            <div className="space-y-1.5">
              <Label className="text-xs">Paciente *</Label>
              <Select value={novoPacienteId} onValueChange={setNovoPacienteId}>
                <SelectTrigger id="select-paciente-new">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {dbClientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dbClientes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum paciente cadastrado.{" "}
                  <a href="/pacientes" className="text-primary underline">
                    Cadastrar
                  </a>
                </p>
              )}
            </div>

            {/* Serviço */}
            <div className="space-y-1.5">
              <Label className="text-xs">Serviço *</Label>
              <Select value={novoServicoId} onValueChange={setNovoServicoId}>
                <SelectTrigger id="select-servico-new">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {dbServicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome} ({s.duracao_minutos} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observação */}
            <div className="space-y-1.5">
              <Label className="text-xs">Observação</Label>
              <Textarea
                id="textarea-obs-new"
                placeholder="Observações..."
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              id="btn-confirmar-agendamento"
              onClick={handleAgendar}
              disabled={createAgendamento.isPending}
            >
              {createAgendamento.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
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
                <SelectTrigger id="select-prof-encaixe">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {dbProfissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Horário *</Label>
                <Select value={encaixeHora} onValueChange={setEncaixeHora}>
                  <SelectTrigger id="select-hora-encaixe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_LABELS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duração (min)</Label>
                <Select value={encaixeDuracao} onValueChange={setEncaixeDuracao}>
                  <SelectTrigger id="select-duracao-encaixe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["15", "20", "30", "45", "60"].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Paciente *</Label>
              <Select value={encaixePacienteId} onValueChange={setEncaixePacienteId}>
                <SelectTrigger id="select-paciente-encaixe">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {dbClientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Serviço *</Label>
              <Select value={encaixeServicoId} onValueChange={setEncaixeServicoId}>
                <SelectTrigger id="select-servico-encaixe">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {dbServicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              id="btn-criar-encaixe"
              onClick={handleEncaixe}
              disabled={createAgendamento.isPending}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              {createAgendamento.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar Encaixe"
              )}
            </Button>
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
              <Input
                id="input-wl-paciente"
                placeholder="Nome"
                value={wlPaciente}
                onChange={(e) => setWlPaciente(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Serviço *</Label>
              <Input
                id="input-wl-servico"
                placeholder="Serviço desejado"
                value={wlServico}
                onChange={(e) => setWlServico(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Profissional *</Label>
              <Select value={wlProfissional} onValueChange={setWlProfissional}>
                <SelectTrigger id="select-wl-prof">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {dbProfissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data Preferida *</Label>
              <div className="border border-input rounded-md">
                <Calendar
                  mode="single"
                  selected={wlData}
                  onSelect={setWlData}
                  locale={ptBR}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button id="btn-adicionar-wl" onClick={handleAddWaitlist}>
              Adicionar
            </Button>
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
                <span className="text-foreground">
                  {getNomeProfissional(selectedSlot.profissionalId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário</span>
                <span className="text-foreground">
                  {format(selectedSlot.dataHoraInicio, "HH:mm")} —{" "}
                  {format(selectedSlot.dataHoraFim, "HH:mm")}
                </span>
              </div>
              {selectedSlot.observacao && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Obs.</span>
                  <span className="text-foreground text-right max-w-[60%]">
                    {selectedSlot.observacao}
                  </span>
                </div>
              )}
              {selectedSlot.origem === "encaixe" && (
                <Badge variant="outline" className="border-warning text-warning">
                  Encaixe
                </Badge>
              )}
            </div>
            <DialogFooter className="flex-wrap gap-2">
              <Button
                id="btn-confirmar-slot"
                variant="outline"
                size="sm"
                onClick={() => handleConfirmar(selectedSlot)}
                disabled={isMutating}
                className="gap-1.5 border-success/50 text-success hover:bg-success/10"
              >
                <Check className="h-3.5 w-3.5" /> Confirmar
              </Button>
              <Button
                id="btn-atendido-slot"
                variant="outline"
                size="sm"
                onClick={() => handleAtendido(selectedSlot)}
                disabled={isMutating}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> Atendido
              </Button>
              <Button
                id="btn-cancelar-slot"
                variant="destructive"
                size="sm"
                onClick={() => handleCancelar(selectedSlot)}
                disabled={isMutating}
                className="gap-1.5"
              >
                {cancelAgendamento.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}{" "}
                Cancelar
              </Button>
              <Button
                id="btn-fechar-slot"
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlot(null)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AgendaPage;
