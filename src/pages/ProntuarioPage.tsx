import { useState } from "react";
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
import { useNavigate } from "react-router-dom";

/* ───── tipos ───── */
type ProntuarioStatus = "aberto" | "fechado";
type TipoAtendimento = "presencial" | "teleconsulta";
type TranscricaoStatus = "pendente" | "processando" | "concluido" | "erro";

interface Prontuario {
  id: string;
  paciente: string;
  profissional: string;
  dataAtendimento: string;
  tipo: TipoAtendimento;
  status: ProntuarioStatus;
  registroTecnico?: string;
  sugestaoConduta?: string;
  diagnostico?: string;
  observacoes?: string;
  audios: AudioRecord[];
  anexos: Anexo[];
  imagens: ImagemBA[];
}

interface AudioRecord {
  id: string;
  url: string;
  duracao: number;
  statusTranscricao: TranscricaoStatus;
  textoTranscrito?: string;
}

interface Anexo {
  id: string;
  nome: string;
  tipo: "imagem" | "pdf" | "documento";
  url: string;
  descricao?: string;
}

interface ImagemBA {
  id: string;
  urlAntes: string;
  urlDepois?: string;
  descricao?: string;
  data: string;
}

/* ───── dados mock ───── */
const prontuariosMock: Prontuario[] = [
  {
    id: "1",
    paciente: "Maria Silva",
    profissional: "Dr. João",
    dataAtendimento: "20/03/2026",
    tipo: "presencial",
    status: "aberto",
    registroTecnico: "Paciente relata dores lombares há 2 semanas, intensificando ao final do dia. Sem irradiação para membros inferiores. Exame físico: contratura paravertebral bilateral em L4-L5.",
    sugestaoConduta: "1. Fisioterapia 3x/semana por 4 semanas\n2. Anti-inflamatório por 5 dias\n3. Retorno em 30 dias com exames de imagem",
    diagnostico: "Lombalgia mecânica",
    observacoes: "Paciente sedentária, trabalha sentada 8h/dia.",
    audios: [
      { id: "a1", url: "#", duracao: 342, statusTranscricao: "concluido", textoTranscrito: "Paciente relata início das dores há duas semanas, com piora progressiva principalmente ao final do dia de trabalho. Nega trauma recente. Refere que passa longas horas sentada no escritório sem pausas regulares..." }
    ],
    anexos: [
      { id: "x1", nome: "Exame Hemograma.pdf", tipo: "pdf", url: "#", descricao: "Hemograma completo" },
      { id: "x2", nome: "Raio-X Coluna.pdf", tipo: "pdf", url: "#", descricao: "Raio-X coluna lombar" },
    ],
    imagens: [
      { id: "img1", urlAntes: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=300&h=200&fit=crop", descricao: "Postura inicial", data: "20/03/2026" }
    ],
  },
  {
    id: "2",
    paciente: "Carlos Souza",
    profissional: "Dra. Paula",
    dataAtendimento: "19/03/2026",
    tipo: "presencial",
    status: "fechado",
    registroTecnico: "Retorno com resultados de exames laboratoriais dentro da normalidade. RM evidencia protrusão discal L4-L5 sem compressão radicular.",
    diagnostico: "Protrusão discal L4-L5",
    audios: [],
    anexos: [],
    imagens: [],
  },
  {
    id: "3",
    paciente: "Ana Oliveira",
    profissional: "Dr. Ricardo",
    dataAtendimento: "18/03/2026",
    tipo: "teleconsulta",
    status: "fechado",
    registroTecnico: "Sessão de fisioterapia realizada com exercícios de fortalecimento do core e alongamento da cadeia posterior. Paciente relata melhora de 40% na dor.",
    sugestaoConduta: "Manter protocolo atual por mais 2 semanas.",
    audios: [],
    anexos: [],
    imagens: [],
  },
  {
    id: "4",
    paciente: "Pedro Santos",
    profissional: "Dr. João",
    dataAtendimento: "17/03/2026",
    tipo: "presencial",
    status: "aberto",
    registroTecnico: "Consulta de rotina. Paciente sem queixas significativas. Exame físico sem alterações.",
    audios: [],
    anexos: [],
    imagens: [],
  },
];

const pacientesMock = ["Maria Silva", "Carlos Souza", "Ana Oliveira", "Pedro Santos", "Beatriz Lima"];
const profissionaisMock = ["Dr. João", "Dra. Paula", "Dr. Ricardo"];

/* ───── helpers ───── */
const formatDuracao = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const statusColor = (s: ProntuarioStatus) =>
  s === "aberto" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border";

const transcricaoColor = (s: TranscricaoStatus) => {
  const map: Record<TranscricaoStatus, string> = {
    pendente: "bg-warning/15 text-warning border-warning/30",
    processando: "bg-primary/15 text-primary border-primary/30",
    concluido: "bg-success/15 text-success border-success/30",
    erro: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[s];
};

/* ═══════════════════════ COMPONENTE PRINCIPAL ═══════════════════════ */
const ProntuarioPage = () => {
  const [prontuarios, setProntuarios] = useState(prontuariosMock);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProf, setFilterProf] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);

  /* novo prontuário */
  const [newPaciente, setNewPaciente] = useState("");
  const [newProf, setNewProf] = useState("");
  const [newTipo, setNewTipo] = useState<TipoAtendimento>("presencial");

  const selected = prontuarios.find(p => p.id === selectedId) ?? null;

  const filtered = prontuarios.filter(p => {
    if (searchTerm && !p.paciente.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterProf !== "all" && p.profissional !== filterProf) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = () => {
    if (!newPaciente || !newProf) return;
    const novo: Prontuario = {
      id: Date.now().toString(),
      paciente: newPaciente,
      profissional: newProf,
      dataAtendimento: new Date().toLocaleDateString("pt-BR"),
      tipo: newTipo,
      status: "aberto",
      audios: [],
      anexos: [],
      imagens: [],
    };
    setProntuarios(prev => [novo, ...prev]);
    setSelectedId(novo.id);
    setShowNewDialog(false);
    setNewPaciente("");
    setNewProf("");
  };

  const updateSelected = (patch: Partial<Prontuario>) => {
    if (!selectedId) return;
    setProntuarios(prev => prev.map(p => p.id === selectedId ? { ...p, ...patch } : p));
  };

  const fecharProntuario = () => updateSelected({ status: "fechado" });

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
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Prontuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Prontuário</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Paciente</Label>
                  <Select value={newPaciente} onValueChange={setNewPaciente}>
                    <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                    <SelectContent>{pacientesMock.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Profissional</Label>
                  <Select value={newProf} onValueChange={setNewProf}>
                    <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
                    <SelectContent>{profissionaisMock.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Atendimento</Label>
                  <Select value={newTipo} onValueChange={v => setNewTipo(v as TipoAtendimento)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="teleconsulta">Teleconsulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Criar Prontuário</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: prontuarios.length, icon: ClipboardList, color: "text-primary" },
            { label: "Abertos", value: prontuarios.filter(p => p.status === "aberto").length, icon: FileText, color: "text-success" },
            { label: "Fechados", value: prontuarios.filter(p => p.status === "fechado").length, icon: Lock, color: "text-muted-foreground" },
            { label: "Com IA", value: prontuarios.filter(p => p.audios.some(a => a.statusTranscricao === "concluido")).length, icon: Brain, color: "text-primary" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
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
                <Input placeholder="Buscar por paciente..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={filterProf} onValueChange={setFilterProf}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Profissional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos profissionais</SelectItem>
                  {profissionaisMock.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
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
          {filtered.map((p, i) => (
            <Card key={p.id} className="cursor-pointer hover:shadow-md transition-all animate-fade-in border-border" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setSelectedId(p.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{p.paciente}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <User className="h-3 w-3" /> {p.profissional}
                        <span>•</span>
                        <Calendar className="h-3 w-3" /> {p.dataAtendimento}
                        <span>•</span>
                        <span className="capitalize">{p.tipo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.audios.length > 0 && <Badge variant="outline" className="text-xs gap-1"><Mic className="h-3 w-3" /> {p.audios.length}</Badge>}
                    {p.anexos.length > 0 && <Badge variant="outline" className="text-xs gap-1"><Paperclip className="h-3 w-3" /> {p.anexos.length}</Badge>}
                    <Badge className={`text-xs capitalize ${statusColor(p.status)}`}>{p.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                {p.registroTecnico && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.registroTecnico}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum prontuário encontrado</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══ Detalhe ═══ */
  return <ProntuarioDetail prontuario={selected} onBack={() => setSelectedId(null)} onUpdate={updateSelected} onFechar={fecharProntuario} />;
};

/* ═══════════════════════ DETALHE ═══════════════════════ */
interface DetailProps {
  prontuario: Prontuario;
  onBack: () => void;
  onUpdate: (p: Partial<Prontuario>) => void;
  onFechar: () => void;
}

const ProntuarioDetail = ({ prontuario: p, onBack, onUpdate, onFechar }: DetailProps) => {
  const [activeTab, setActiveTab] = useState("registro");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const isClosed = p.status === "fechado";

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
      onUpdate({ audios: [...p.audios, newAudio] });
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (!isRecording) { clearInterval(interval); return prev; }
          return prev + 1;
        });
      }, 1000);
    }
  };

  /* simulação de transcrição IA */
  const handleTranscrever = (audioId: string) => {
    setIsTranscribing(true);
    const updatedAudios = p.audios.map(a => a.id === audioId ? { ...a, statusTranscricao: "processando" as TranscricaoStatus } : a);
    onUpdate({ audios: updatedAudios });

    setTimeout(() => {
      const final = updatedAudios.map(a => a.id === audioId ? {
        ...a,
        statusTranscricao: "concluido" as TranscricaoStatus,
        textoTranscrito: "Paciente relata melhora significativa após início do tratamento. Dor reduzida de 8/10 para 3/10 na escala EVA. Mantém acompanhamento fisioterápico 3 vezes por semana com boa adesão ao protocolo proposto. Solicita renovação de receita para analgésico de resgate."
      } : a);
      onUpdate({ audios: final });
      setIsTranscribing(false);
    }, 3000);
  };

  /* simulação de geração IA */
  const handleGerarIA = () => {
    if (isClosed) return;
    setIsGeneratingIA(true);
    setTimeout(() => {
      onUpdate({
        registroTecnico: "Paciente de 42 anos, sexo feminino, comparece para reavaliação de quadro álgico em região lombar. Refere melhora de aproximadamente 60% desde a última consulta. Exame físico demonstra redução da contratura paravertebral e melhora da amplitude de movimento. Teste de Lasègue negativo bilateralmente. Força muscular preservada em membros inferiores.",
        sugestaoConduta: "1. Manter fisioterapia 3x/semana com foco em fortalecimento do core\n2. Iniciar programa de exercícios domiciliares\n3. Reduzir medicação analgésica gradualmente\n4. Orientar ergonomia no ambiente de trabalho\n5. Retorno em 15 dias para reavaliação",
        diagnostico: "Lombalgia mecânica em melhora — M54.5 (CID-10)",
      });
      setIsGeneratingIA(false);
    }, 2500);
  };

  /* upload simulado */
  const handleUpload = () => {
    if (isClosed) return;
    const novo: Anexo = {
      id: Date.now().toString(),
      nome: `Documento_${p.anexos.length + 1}.pdf`,
      tipo: "pdf",
      url: "#",
      descricao: "Documento anexado",
    };
    onUpdate({ anexos: [...p.anexos, novo] });
  };

  const handleAddImagem = () => {
    if (isClosed) return;
    const nova: ImagemBA = {
      id: Date.now().toString(),
      urlAntes: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=300&h=200&fit=crop",
      descricao: "Registro fotográfico",
      data: new Date().toLocaleDateString("pt-BR"),
    };
    onUpdate({ imagens: [...p.imagens, nova] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">← Voltar</Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {p.paciente}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <User className="h-3 w-3" /> {p.profissional}
              <span>•</span>
              <Calendar className="h-3 w-3" /> {p.dataAtendimento}
              <span>•</span>
              <span className="capitalize">{p.tipo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`capitalize ${statusColor(p.status)}`}>
            {p.status === "aberto" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
            {p.status}
          </Badge>
          {!isClosed && (
            <Button variant="outline" size="sm" onClick={onFechar} className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
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
          <TabsTrigger value="registro" className="gap-1 text-xs"><ClipboardList className="h-3.5 w-3.5" /> Registro</TabsTrigger>
          <TabsTrigger value="audio" className="gap-1 text-xs"><Mic className="h-3.5 w-3.5" /> Áudio & IA</TabsTrigger>
          <TabsTrigger value="anexos" className="gap-1 text-xs"><Paperclip className="h-3.5 w-3.5" /> Anexos</TabsTrigger>
          <TabsTrigger value="imagens" className="gap-1 text-xs"><Camera className="h-3.5 w-3.5" /> Imagens</TabsTrigger>
          <TabsTrigger value="historico" className="gap-1 text-xs"><History className="h-3.5 w-3.5" /> Histórico</TabsTrigger>
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
                  value={p.registroTecnico || ""}
                  onChange={e => onUpdate({ registroTecnico: e.target.value })}
                  placeholder="Descreva o atendimento detalhadamente..."
                  className="min-h-[200px] resize-none"
                  disabled={isClosed}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> Sugestão de Conduta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={p.sugestaoConduta || ""}
                  onChange={e => onUpdate({ sugestaoConduta: e.target.value })}
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
                  value={p.diagnostico || ""}
                  onChange={e => onUpdate({ diagnostico: e.target.value })}
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
                  value={p.observacoes || ""}
                  onChange={e => onUpdate({ observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="min-h-[100px] resize-none"
                  disabled={isClosed}
                />
              </CardContent>
            </Card>
          </div>
          {!isClosed && (
            <div className="flex gap-2">
              <Button onClick={handleGerarIA} disabled={isGeneratingIA} className="gap-2">
                {isGeneratingIA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGeneratingIA ? "Gerando com IA..." : "Gerar com IA"}
              </Button>
              <Button variant="outline" className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Salvar Registro
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
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-destructive/15 animate-pulse" : "bg-primary/10"}`}>
                    {isRecording
                      ? <MicOff className="h-10 w-10 text-destructive" />
                      : <Mic className="h-10 w-10 text-primary" />
                    }
                  </div>
                  {isRecording && (
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-destructive">{formatDuracao(recordingTime)}</p>
                      <p className="text-xs text-muted-foreground">Gravando...</p>
                    </div>
                  )}
                  <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"} size="lg" className="gap-2">
                    {isRecording ? <><Square className="h-4 w-4" /> Parar Gravação</> : <><Mic className="h-4 w-4" /> Iniciar Gravação</>}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center max-w-md">
                    Grave o áudio do atendimento. A IA transcreverá automaticamente e poderá gerar registros técnicos e sugestões de conduta.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {p.audios.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Gravações</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {p.audios.map(audio => (
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
                          {audio.statusTranscricao === "processando" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {audio.statusTranscricao}
                        </Badge>
                        {audio.statusTranscricao === "pendente" && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleTranscrever(audio.id)}>
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
                        <p className="text-sm text-foreground leading-relaxed">{audio.textoTranscrito}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {p.audios.length === 0 && isClosed && (
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
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors" onClick={handleUpload}>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Clique para enviar arquivo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, PDF, DOCX — Máx 10MB</p>
                </div>
              </CardContent>
            </Card>
          )}

          {p.anexos.length > 0 ? (
            <Card>
              <CardHeader><CardTitle className="text-sm">Arquivos Anexados ({p.anexos.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {p.anexos.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        {a.tipo === "pdf" ? <FileText className="h-4 w-4 text-primary" /> : <FileImage className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.nome}</p>
                        {a.descricao && <p className="text-xs text-muted-foreground">{a.descricao}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
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
          {!isClosed && (
            <div className="flex gap-2">
              <Button onClick={handleAddImagem} className="gap-2"><Camera className="h-4 w-4" /> Adicionar Foto</Button>
            </div>
          )}

          {p.imagens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {p.imagens.map(img => (
                <Card key={img.id} className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="relative">
                      <img src={img.urlAntes} alt="Antes" className="w-full h-32 object-cover" />
                      <span className="absolute bottom-1 left-1 bg-foreground/70 text-background text-[10px] px-1.5 py-0.5 rounded">ANTES</span>
                    </div>
                    <div className="relative bg-muted flex items-center justify-center">
                      {img.urlDepois ? (
                        <>
                          <img src={img.urlDepois} alt="Depois" className="w-full h-32 object-cover" />
                          <span className="absolute bottom-1 left-1 bg-foreground/70 text-background text-[10px] px-1.5 py-0.5 rounded">DEPOIS</span>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Camera className="h-6 w-6 mx-auto mb-1 opacity-40" />
                          <p className="text-[10px]">Sem foto</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{img.descricao}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{img.data}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma imagem registrada</p>
            </div>
          )}
        </TabsContent>

        {/* ─── HISTÓRICO ─── */}
        <TabsContent value="historico" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Histórico Clínico — {p.paciente}</CardTitle></CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
                {[
                  { data: p.dataAtendimento, evento: `Atendimento ${p.tipo} — ${p.profissional}`, detalhe: p.diagnostico || p.registroTecnico || "Registro em andamento" },
                  { data: "15/03/2026", evento: "Consulta inicial — Dr. João", detalhe: "Primeira avaliação. Queixa principal registrada. Exames solicitados." },
                  { data: "01/03/2026", evento: "Cadastro do paciente", detalhe: "Paciente cadastrado no sistema." },
                ].map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">{h.data}</p>
                      <p className="text-sm font-medium text-foreground">{h.evento}</p>
                      <p className="text-xs text-muted-foreground mt-1">{h.detalhe}</p>
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
