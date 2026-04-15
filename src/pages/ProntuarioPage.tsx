import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search, FileText, Download, Plus, Mic, MicOff, Upload, Image as ImageIcon,
  Clock, User, Calendar, Eye, Lock, Sparkles, Play, Square, Loader2,
  ChevronRight, Paperclip, X, Camera, FileImage, AlertCircle, CheckCircle2,
  Stethoscope, ClipboardList, Brain, History
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  useProntuarios,
  useCreateProntuario,
  useUpdateProntuario,
  type Prontuario,
  type ProntuarioAnexo,
} from "@/hooks/use-prontuarios";
import { useClientes } from "@/hooks/use-clientes";
import { useProfissionais } from "@/hooks/use-agendamentos";

/* ───── tipos UI ───── */
type TipoAtendimento = "presencial" | "teleconsulta";
type TranscricaoStatus = "pendente" | "processando" | "concluido" | "erro";

interface AudioRecord {
  id: string;
  url: string;
  duracao: number;
  statusTranscricao: TranscricaoStatus;
  textoTranscrito?: string;
}

/* ───── helpers ───── */
const formatDuracao = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const statusColor = (fechado: boolean) =>
  !fechado
    ? "bg-success/15 text-success border-success/30"
    : "bg-muted text-muted-foreground border-border";

const transcricaoColor = (s: TranscricaoStatus) => {
  const map: Record<TranscricaoStatus, string> = {
    pendente: "bg-warning/15 text-warning border-warning/30",
    processando: "bg-primary/15 text-primary border-primary/30",
    concluido: "bg-success/15 text-success border-success/30",
    erro: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[s];
};

const formatDataAtendimento = (iso: string) => {
  try {
    return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
};

/* ═══════════════════════ COMPONENTE PRINCIPAL ═══════════════════════ */
const ProntuarioPage = () => {
  /* ── Real data ── */
  const { data: prontuarios = [], isLoading } = useProntuarios();
  const { data: clientes = [] } = useClientes({ ativo: true });
  const { data: profissionais = [] } = useProfissionais();
  const createProntuario = useCreateProntuario();
  const updateProntuario = useUpdateProntuario();

  /* ── State ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfId, setFilterProfId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);

  /* novo prontuário */
  const [newPacienteId, setNewPacienteId] = useState("");
  const [newProfId, setNewProfId] = useState("");
  const [newTipo, setNewTipo] = useState<TipoAtendimento>("presencial");
  const [newQueixa, setNewQueixa] = useState("");

  const selected = prontuarios.find((p) => p.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    return prontuarios.filter((p) => {
      const pacNome = p.clientes?.nome?.toLowerCase() ?? "";
      if (searchTerm && !pacNome.includes(searchTerm.toLowerCase())) return false;
      if (filterProfId !== "all" && p.profissional_id !== filterProfId) return false;
      if (filterStatus === "aberto" && p.fechado) return false;
      if (filterStatus === "fechado" && !p.fechado) return false;
      return true;
    });
  }, [prontuarios, searchTerm, filterProfId, filterStatus]);

  const handleCreate = () => {
    if (!newPacienteId) return;
    createProntuario.mutate(
      {
        paciente_id: newPacienteId,
        profissional_id: newProfId || null,
        tipo_atendimento: newTipo,
        queixa_principal: newQueixa || null,
      },
      {
        onSuccess: (data) => {
          setSelectedId(data.id);
          setShowNewDialog(false);
          setNewPacienteId("");
          setNewProfId("");
          setNewQueixa("");
        },
      }
    );
  };

  const handleUpdate = (id: string, patch: Partial<Omit<Parameters<typeof updateProntuario.mutate>[0], "id">>) => {
    updateProntuario.mutate({ id, ...patch }, { onSuccess: () => {} });
  };

  const handleFechar = (id: string) => {
    updateProntuario.mutate({ id, fechado: true });
  };

  /* ═══ Lista ═══ */
  if (!selected) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              Prontuário Digital
            </h1>
            <p className="text-muted-foreground text-sm">Registros clínicos com suporte de IA</p>
          </div>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" id="btn-novo-prontuario">
                <Plus className="h-4 w-4" /> Novo Prontuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Prontuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Paciente *</Label>
                  <Select value={newPacienteId} onValueChange={setNewPacienteId}>
                    <SelectTrigger id="select-paciente-pront">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clientes.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nenhum paciente cadastrado.{" "}
                      <a href="/pacientes" className="text-primary underline">Cadastrar</a>
                    </p>
                  )}
                </div>
                <div>
                  <Label>Profissional</Label>
                  <Select value={newProfId} onValueChange={setNewProfId}>
                    <SelectTrigger id="select-prof-pront">
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {profissionais.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Atendimento</Label>
                  <Select value={newTipo} onValueChange={(v) => setNewTipo(v as TipoAtendimento)}>
                    <SelectTrigger id="select-tipo-pront">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="teleconsulta">Teleconsulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Queixa principal</Label>
                  <Input
                    id="input-queixa-pront"
                    value={newQueixa}
                    onChange={(e) => setNewQueixa(e.target.value)}
                    placeholder="Motivo da consulta..."
                  />
                </div>
                <Button
                  id="btn-criar-prontuario"
                  onClick={handleCreate}
                  disabled={!newPacienteId || createProntuario.isPending}
                  className="w-full"
                >
                  {createProntuario.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Criando...</>
                  ) : (
                    "Criar Prontuário"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: prontuarios.length, icon: ClipboardList, color: "text-primary" },
            { label: "Abertos", value: prontuarios.filter((p) => !p.fechado).length, icon: FileText, color: "text-success" },
            { label: "Fechados", value: prontuarios.filter((p) => p.fechado).length, icon: Lock, color: "text-muted-foreground" },
            { label: "Hoje", value: prontuarios.filter((p) => {
              try { return format(new Date(p.data_atendimento), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"); }
              catch { return false; }
            }).length, icon: Calendar, color: "text-primary" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-prontuario"
                  placeholder="Buscar por paciente..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterProfId} onValueChange={setFilterProfId}>
                <SelectTrigger className="w-[200px]" id="filter-prof">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos profissionais</SelectItem>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]" id="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aberto">Abertos</SelectItem>
                  <SelectItem value="fechado">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum prontuário encontrado</p>
            </div>
          ) : (
            filtered.map((p, i) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-all border-border"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setSelectedId(p.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.clientes?.nome ?? "—"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <User className="h-3 w-3" /> {p.profissionais_clinica?.nome ?? "—"}
                          <span>•</span>
                          <Calendar className="h-3 w-3" /> {formatDataAtendimento(p.data_atendimento)}
                          <span>•</span>
                          <span className="capitalize">{p.tipo_atendimento}</span>
                        </div>
                        {p.queixa_principal && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">
                            {p.queixa_principal}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {Array.isArray(p.anexos) && p.anexos.length > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Paperclip className="h-3 w-3" /> {p.anexos.length}
                        </Badge>
                      )}
                      <Badge className={`text-xs ${statusColor(p.fechado)}`}>
                        {p.fechado ? "Fechado" : "Aberto"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {p.registro_tecnico && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {p.registro_tecnico}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  /* ═══ Detalhe ═══ */
  return (
    <ProntuarioDetail
      prontuario={selected}
      onBack={() => setSelectedId(null)}
      onUpdate={(patch) => handleUpdate(selected.id, patch)}
      onFechar={() => handleFechar(selected.id)}
      isSaving={updateProntuario.isPending}
    />
  );
};

/* ═══════════════════════ DETALHE ═══════════════════════ */
interface DetailProps {
  prontuario: Prontuario;
  onBack: () => void;
  onUpdate: (p: Omit<Parameters<ReturnType<typeof useUpdateProntuario>["mutate"]>[0], "id">) => void;
  onFechar: () => void;
  isSaving: boolean;
}

const ProntuarioDetail = ({ prontuario: p, onBack, onUpdate, onFechar, isSaving }: DetailProps) => {
  const [activeTab, setActiveTab] = useState("registro");

  // Local editing state to avoid re-fetching on every keystroke
  const [registroTecnico, setRegistroTecnico] = useState(p.registro_tecnico ?? "");
  const [conduta, setConduta] = useState(p.conduta ?? "");
  const [diagnostico, setDiagnostico] = useState(p.diagnostico ?? "");
  const [observacoes, setObservacoes] = useState(p.observacoes ?? "");

  // Audio (UI simulation — backend integration pending)
  const [audios, setAudios] = useState<AudioRecord[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  const isClosed = p.fechado;

  const handleSalvar = () => {
    onUpdate({ registro_tecnico: registroTecnico, conduta, diagnostico, observacoes });
  };

  /* simulação de gravação */
  const toggleRecording = () => {
    if (isClosed) return;
    if (isRecording) {
      setIsRecording(false);
      const newAudio: AudioRecord = {
        id: Date.now().toString(),
        url: "#",
        duracao: recordingTime,
        statusTranscricao: "pendente",
      };
      setAudios((prev) => [...prev, newAudio]);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimeout(() => clearInterval(interval), 300000); // max 5 min
    }
  };

  /* simulação de transcrição IA */
  const handleTranscrever = (audioId: string) => {
    setIsTranscribing(true);
    setAudios((prev) =>
      prev.map((a) => (a.id === audioId ? { ...a, statusTranscricao: "processando" as const } : a))
    );
    setTimeout(() => {
      setAudios((prev) =>
        prev.map((a) =>
          a.id === audioId
            ? {
                ...a,
                statusTranscricao: "concluido" as const,
                textoTranscrito:
                  "Paciente relata melhora significativa após início do tratamento. Dor reduzida de 8/10 para 3/10 na escala EVA. Mantém acompanhamento fisioterápico 3 vezes por semana com boa adesão ao protocolo proposto.",
              }
            : a
        )
      );
      setIsTranscribing(false);
    }, 3000);
  };

  /* simulação de geração IA */
  const handleGerarIA = () => {
    if (isClosed) return;
    setIsGeneratingIA(true);
    setTimeout(() => {
      setRegistroTecnico(
        "Paciente comparece para reavaliação. Refere melhora de aproximadamente 60% desde a última consulta. Exame físico demonstra redução da contratura paravertebral e melhora da amplitude de movimento. Teste de Lasègue negativo bilateralmente."
      );
      setConduta(
        "1. Manter fisioterapia 3x/semana com foco em fortalecimento do core\n2. Iniciar programa de exercícios domiciliares\n3. Reduzir medicação analgésica gradualmente\n4. Orientar ergonomia no ambiente de trabalho\n5. Retorno em 15 dias para reavaliação"
      );
      setDiagnostico("Lombalgia mecânica em melhora — M54.5 (CID-10)");
      setIsGeneratingIA(false);
    }, 2500);
  };

  /* upload de anexo (jsonb) */
  const handleUpload = () => {
    if (isClosed) return;
    const novoAnexo: ProntuarioAnexo = {
      id: Date.now().toString(),
      nome: `Documento_${(Array.isArray(p.anexos) ? p.anexos.length : 0) + 1}.pdf`,
      tipo: "pdf",
      url: "#",
      descricao: "Documento anexado",
    };
    const novosAnexos = [...(Array.isArray(p.anexos) ? p.anexos : []), novoAnexo];
    onUpdate({ anexos: novosAnexos });
  };

  const formatDataAtendimento = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} id="btn-voltar-prontuario" className="gap-1">
            ← Voltar
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {p.clientes?.nome ?? "—"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3" /> {p.profissionais_clinica?.nome ?? "—"}
              <span>•</span>
              <Calendar className="h-3 w-3" /> {formatDataAtendimento(p.data_atendimento)}
              <span>•</span>
              <span className="capitalize">{p.tipo_atendimento}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`capitalize ${isClosed ? "bg-muted text-muted-foreground" : "bg-success/15 text-success border-success/30"}`}>
            {isClosed ? <Lock className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
            {isClosed ? "Fechado" : "Aberto"}
          </Badge>
          {!isClosed && (
            <Button
              id="btn-fechar-prontuario"
              variant="outline"
              size="sm"
              onClick={onFechar}
              disabled={isSaving}
              className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Lock className="h-3 w-3" /> Fechar Prontuário
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-3 w-3" /> Exportar PDF
          </Button>
        </div>
      </div>

      {isClosed && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Este prontuário está fechado e não pode ser editado.
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="registro" className="gap-1 text-xs">
            <ClipboardList className="h-3.5 w-3.5" /> Registro
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-1 text-xs">
            <Mic className="h-3.5 w-3.5" /> Áudio & IA
          </TabsTrigger>
          <TabsTrigger value="anexos" className="gap-1 text-xs">
            <Paperclip className="h-3.5 w-3.5" /> Anexos
          </TabsTrigger>
          <TabsTrigger value="imagens" className="gap-1 text-xs">
            <Camera className="h-3.5 w-3.5" /> Imagens
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1 text-xs">
            <History className="h-3.5 w-3.5" /> Histórico
          </TabsTrigger>
        </TabsList>

        {/* ─── REGISTRO CLÍNICO ─── */}
        <TabsContent value="registro" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" /> Registro Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="textarea-registro"
                  value={registroTecnico}
                  onChange={(e) => setRegistroTecnico(e.target.value)}
                  placeholder="Descreva o atendimento detalhadamente..."
                  className="min-h-[200px] resize-none"
                  disabled={isClosed}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> Conduta / Plano Terapêutico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="textarea-conduta"
                  value={conduta}
                  onChange={(e) => setConduta(e.target.value)}
                  placeholder="Condutas recomendadas..."
                  className="min-h-[200px] resize-none"
                  disabled={isClosed}
                />
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="textarea-diagnostico"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder="Diagnóstico principal e CID..."
                  className="min-h-[100px] resize-none"
                  disabled={isClosed}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="textarea-obs"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais..."
                  className="min-h-[100px] resize-none"
                  disabled={isClosed}
                />
              </CardContent>
            </Card>
          </div>
          {!isClosed && (
            <div className="flex gap-2">
              <Button
                id="btn-gerar-ia"
                onClick={handleGerarIA}
                disabled={isGeneratingIA}
                className="gap-2"
              >
                {isGeneratingIA ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGeneratingIA ? "Gerando com IA..." : "Gerar com IA"}
              </Button>
              <Button
                id="btn-salvar-prontuario"
                variant="outline"
                className="gap-2"
                onClick={handleSalvar}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isSaving ? "Salvando..." : "Salvar Registro"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ─── ÁUDIO & IA ─── */}
        <TabsContent value="audio" className="space-y-4 mt-4">
          {!isClosed && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${
                      isRecording ? "bg-destructive/15 animate-pulse" : "bg-primary/10"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-10 w-10 text-destructive" />
                    ) : (
                      <Mic className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  {isRecording && (
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-destructive">
                        {formatDuracao(recordingTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">Gravando...</p>
                    </div>
                  )}
                  <Button
                    id="btn-gravar-audio"
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="gap-2"
                  >
                    {isRecording ? (
                      <><Square className="h-4 w-4" /> Parar Gravação</>
                    ) : (
                      <><Mic className="h-4 w-4" /> Iniciar Gravação</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center max-w-md">
                    Grave o áudio do atendimento. A IA transcreverá automaticamente e poderá gerar
                    registros técnicos e sugestões de conduta.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {audios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Gravações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {audios.map((audio) => (
                  <div key={audio.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Gravação de áudio</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDuracao(audio.duracao)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs capitalize ${transcricaoColor(audio.statusTranscricao)}`}>
                          {audio.statusTranscricao === "processando" && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {audio.statusTranscricao}
                        </Badge>
                        {audio.statusTranscricao === "pendente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={() => handleTranscrever(audio.id)}
                          >
                            <Sparkles className="h-3 w-3" /> Transcrever
                          </Button>
                        )}
                      </div>
                    </div>
                    {audio.textoTranscrito && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                          <Brain className="h-3 w-3" /> Transcrição IA
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {audio.textoTranscrito}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {audios.length === 0 && isClosed && (
            <div className="text-center py-12 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma gravação registrada</p>
            </div>
          )}
        </TabsContent>

        {/* ─── ANEXOS ─── */}
        <TabsContent value="anexos" className="space-y-4 mt-4">
          {!isClosed && (
            <Card>
              <CardContent className="p-6">
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={handleUpload}
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Clique para enviar arquivo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, PDF, DOCX — Máx 10MB</p>
                </div>
              </CardContent>
            </Card>
          )}

          {Array.isArray(p.anexos) && p.anexos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Arquivos Anexados ({p.anexos.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(p.anexos as ProntuarioAnexo[]).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        {a.tipo === "pdf" ? (
                          <FileText className="h-4 w-4 text-primary" />
                        ) : (
                          <FileImage className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.nome}</p>
                        {a.descricao && (
                          <p className="text-xs text-muted-foreground">{a.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum anexo</p>
            </div>
          )}
        </TabsContent>

        {/* ─── IMAGENS ─── */}
        <TabsContent value="imagens" className="space-y-4 mt-4">
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Fotos Antes & Depois</p>
            <p className="text-xs mt-1">Upload de imagens via Supabase Storage — em breve</p>
          </div>
        </TabsContent>

        {/* ─── HISTÓRICO ─── */}
        <TabsContent value="historico" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Histórico Clínico — {p.clientes?.nome ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                {[
                  {
                    data: formatDataAtendimento(p.data_atendimento),
                    evento: `Atendimento ${p.tipo_atendimento} — ${p.profissionais_clinica?.nome ?? "—"}`,
                    detalhe: p.diagnostico || p.registro_tecnico || "Registro em andamento",
                  },
                  {
                    data: formatDataAtendimento(p.created_at),
                    evento: "Prontuário criado",
                    detalhe: p.queixa_principal || "Novo prontuário registrado no sistema.",
                  },
                ].map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">{h.data}</p>
                      <p className="text-sm font-medium text-foreground">{h.evento}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.detalhe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProntuarioPage;
