import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MessageSquare, Send,
  Paperclip, Upload, Monitor, Users, Clock, Calendar, ChevronRight,
  Link2, Copy, ExternalLink, FileText, Image as ImageIcon, Shield,
  Activity, Play, History, Eye, User, X, Maximize2, Minimize2
} from "lucide-react";

/* ───── tipos ───── */
type SessionStatus = "criada" | "ativa" | "encerrada";

interface Teleconsulta {
  id: string;
  paciente: string;
  profissional: string;
  data: string;
  hora: string;
  status: SessionStatus;
  duracao?: string;
  linkSala: string;
  chat: ChatMsg[];
  arquivos: Arquivo[];
}

interface ChatMsg {
  id: string;
  remetente: string;
  tipo: "profissional" | "paciente";
  mensagem: string;
  hora: string;
}

interface Arquivo {
  id: string;
  nome: string;
  tipo: "imagem" | "documento";
  remetente: string;
  hora: string;
}

/* ───── dados mock ───── */
const teleconsultasMock: Teleconsulta[] = [
  {
    id: "tc1", paciente: "Maria Silva", profissional: "Dr. João", data: "21/03/2026", hora: "14:00",
    status: "criada", linkSala: "https://agend.me/sala/tc1-abc123",
    chat: [], arquivos: [],
  },
  {
    id: "tc2", paciente: "Carlos Souza", profissional: "Dra. Paula", data: "21/03/2026", hora: "15:30",
    status: "ativa", linkSala: "https://agend.me/sala/tc2-def456",
    chat: [
      { id: "c1", remetente: "Dra. Paula", tipo: "profissional", mensagem: "Olá Carlos, como está se sentindo hoje?", hora: "15:31" },
      { id: "c2", remetente: "Carlos Souza", tipo: "paciente", mensagem: "Olá Dra.! Estou melhor, a dor reduziu bastante.", hora: "15:32" },
      { id: "c3", remetente: "Dra. Paula", tipo: "profissional", mensagem: "Ótimo! Vou avaliar seus exames agora.", hora: "15:33" },
    ],
    arquivos: [
      { id: "a1", nome: "Exame_sangue.pdf", tipo: "documento", remetente: "Carlos Souza", hora: "15:34" },
    ],
  },
  {
    id: "tc3", paciente: "Ana Oliveira", profissional: "Dr. Ricardo", data: "20/03/2026", hora: "10:00",
    status: "encerrada", duracao: "32 min", linkSala: "https://agend.me/sala/tc3-ghi789",
    chat: [
      { id: "c4", remetente: "Dr. Ricardo", tipo: "profissional", mensagem: "Bom dia Ana! Pronta para a consulta?", hora: "10:01" },
      { id: "c5", remetente: "Ana Oliveira", tipo: "paciente", mensagem: "Sim doutor!", hora: "10:02" },
    ],
    arquivos: [],
  },
  {
    id: "tc4", paciente: "Pedro Santos", profissional: "Dr. João", data: "19/03/2026", hora: "16:00",
    status: "encerrada", duracao: "25 min", linkSala: "https://agend.me/sala/tc4-jkl012",
    chat: [], arquivos: [],
  },
];

const statusConfig: Record<SessionStatus, { label: string; color: string }> = {
  criada: { label: "Aguardando", color: "bg-warning/15 text-warning border-warning/30" },
  ativa: { label: "Em andamento", color: "bg-success/15 text-success border-success/30" },
  encerrada: { label: "Encerrada", color: "bg-muted text-muted-foreground border-border" },
};

/* ═══════════════════════ COMPONENTE PRINCIPAL ═══════════════════════ */
const TeleconsultaPage = () => {
  const [sessions, setSessions] = useState(teleconsultasMock);
  const [activeView, setActiveView] = useState<"list" | "room">("list");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("consultas");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const enterRoom = (id: string) => {
    setActiveSessionId(id);
    setActiveView("room");
    setSessions(prev => prev.map(s => s.id === id && s.status === "criada" ? { ...s, status: "ativa" as const } : s));
  };

  const exitRoom = () => {
    setActiveView("list");
    setActiveSessionId(null);
  };

  const endSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "encerrada" as const, duracao: "15 min" } : s));
    exitRoom();
  };

  const addChat = (id: string, msg: string) => {
    const newMsg: ChatMsg = { id: Date.now().toString(), remetente: "Dr. João", tipo: "profissional", mensagem: msg, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setSessions(prev => prev.map(s => s.id === id ? { ...s, chat: [...s.chat, newMsg] } : s));
  };

  const addFile = (id: string) => {
    const newFile: Arquivo = { id: Date.now().toString(), nome: `Documento_${Date.now()}.pdf`, tipo: "documento", remetente: "Dr. João", hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setSessions(prev => prev.map(s => s.id === id ? { ...s, arquivos: [...s.arquivos, newFile] } : s));
  };

  const filtered = sessions.filter(s => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (searchTerm && !s.paciente.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: sessions.length,
    ativas: sessions.filter(s => s.status === "ativa").length,
    aguardando: sessions.filter(s => s.status === "criada").length,
    encerradas: sessions.filter(s => s.status === "encerrada").length,
  };

  /* ═══ SALA VIRTUAL ═══ */
  if (activeView === "room" && activeSession) {
    return <VirtualRoom session={activeSession} onExit={exitRoom} onEnd={() => endSession(activeSession.id)} onChat={msg => addChat(activeSession.id, msg)} onFile={() => addFile(activeSession.id)} />;
  }

  /* ═══ LISTA ═══ */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Teleconsulta
          </h1>
          <p className="text-muted-foreground text-sm">Atendimentos remotos por vídeo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Monitor, color: "text-primary" },
          { label: "Em Andamento", value: stats.ativas, icon: Activity, color: "text-success" },
          { label: "Aguardando", value: stats.aguardando, icon: Clock, color: "text-warning" },
          { label: "Encerradas", value: stats.encerradas, icon: History, color: "text-muted-foreground" },
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="consultas" className="gap-1 text-xs"><Video className="h-3.5 w-3.5" /> Consultas</TabsTrigger>
          <TabsTrigger value="historico" className="gap-1 text-xs"><History className="h-3.5 w-3.5" /> Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="consultas" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar paciente..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="criada">Aguardando</SelectItem>
                    <SelectItem value="ativa">Em andamento</SelectItem>
                    <SelectItem value="encerrada">Encerradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {filtered.filter(s => s.status !== "encerrada").map((s, i) => {
              const sc = statusConfig[s.status];
              return (
                <Card key={s.id} className="animate-fade-in border-border hover:shadow-md transition-all" style={{ animationDelay: `${i * 50}ms` }}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.status === "ativa" ? "bg-success/15" : "bg-primary/10"}`}>
                        <Video className={`h-5 w-5 ${s.status === "ativa" ? "text-success" : "text-primary"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{s.paciente}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <User className="h-3 w-3" /> {s.profissional}
                          <span>•</span>
                          <Calendar className="h-3 w-3" /> {s.data}
                          <span>•</span>
                          <Clock className="h-3 w-3" /> {s.hora}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${sc.color}`}>{sc.label}</Badge>
                      <Button size="sm" onClick={() => enterRoom(s.id)} className="gap-1">
                        <Play className="h-3 w-3" /> {s.status === "ativa" ? "Entrar" : "Iniciar"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(s.linkSala)} title="Copiar link">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.filter(s => s.status !== "encerrada").length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma teleconsulta pendente</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4 space-y-4">
          <div className="space-y-2">
            {sessions.filter(s => s.status === "encerrada").map(s => (
              <Card key={s.id} className="border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <History className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.paciente}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <User className="h-3 w-3" /> {s.profissional}
                        <span>•</span>
                        <Calendar className="h-3 w-3" /> {s.data} às {s.hora}
                        <span>•</span>
                        <Clock className="h-3 w-3" /> {s.duracao}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-muted text-muted-foreground">Encerrada</Badge>
                    {s.chat.length > 0 && <Badge variant="outline" className="text-[10px] gap-1"><MessageSquare className="h-3 w-3" />{s.chat.length}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ═══════════════════════ SALA VIRTUAL ═══════════════════════ */
interface RoomProps {
  session: Teleconsulta;
  onExit: () => void;
  onEnd: () => void;
  onChat: (msg: string) => void;
  onFile: () => void;
}

const VirtualRoom = ({ session, onExit, onEnd, onChat, onFile }: RoomProps) => {
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatMsg, setChatMsg] = useState("");
  const [sidePanel, setSidePanel] = useState<"chat" | "files" | null>("chat");
  const [fullscreen, setFullscreen] = useState(false);

  const handleSend = () => {
    if (!chatMsg.trim()) return;
    onChat(chatMsg);
    setChatMsg("");
  };

  return (
    <div className={`flex flex-col ${fullscreen ? "fixed inset-0 z-50 bg-foreground" : "h-[calc(100vh-7rem)]"}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="gap-1">← Voltar</Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-semibold text-foreground">{session.paciente}</span>
            <span className="text-xs text-muted-foreground">• {session.profissional}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-xs bg-success/15 text-success border-success/30 gap-1">
            <Activity className="h-3 w-3" /> Conectado
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSidePanel(sidePanel === "files" ? null : "files")}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 bg-foreground/95 relative flex items-center justify-center">
          {/* Main video (paciente) */}
          <div className="relative w-full h-full flex items-center justify-center">
            {videoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-foreground/80 to-foreground flex items-center justify-center">
                <div className="text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-primary/60" />
                  </div>
                  <p className="text-background/70 text-sm">{session.paciente}</p>
                  <p className="text-background/40 text-xs mt-1">Câmera ativa</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <VideoOff className="h-16 w-16 text-background/30 mx-auto mb-3" />
                <p className="text-background/50 text-sm">Câmera desativada</p>
              </div>
            )}

            {/* PIP - próprio vídeo */}
            <div className="absolute bottom-4 right-4 w-40 h-28 rounded-xl bg-foreground/70 border-2 border-background/20 overflow-hidden flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center mx-auto mb-1">
                  <User className="h-5 w-5 text-primary/70" />
                </div>
                <p className="text-background/60 text-[10px]">Você</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        {sidePanel && (
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {sidePanel === "chat" ? (
              <>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Chat</p>
                  <Button variant="ghost" size="sm" onClick={() => setSidePanel(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {session.chat.map(msg => (
                    <div key={msg.id} className={`flex ${msg.tipo === "profissional" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 ${msg.tipo === "profissional" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p className="text-[10px] font-medium opacity-70 mb-0.5">{msg.remetente}</p>
                        <p className="text-xs">{msg.mensagem}</p>
                        <p className="text-[9px] opacity-50 mt-1 text-right">{msg.hora}</p>
                      </div>
                    </div>
                  ))}
                  {session.chat.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">Nenhuma mensagem ainda</p>
                  )}
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="text-xs"
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                  />
                  <Button size="sm" onClick={handleSend}><Send className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Paperclip className="h-4 w-4 text-primary" /> Arquivos</p>
                  <Button variant="ghost" size="sm" onClick={() => setSidePanel(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {session.arquivos.map(arq => (
                    <div key={arq.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      {arq.tipo === "documento" ? <FileText className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{arq.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{arq.remetente} • {arq.hora}</p>
                      </div>
                    </div>
                  ))}
                  {session.arquivos.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">Nenhum arquivo compartilhado</p>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={onFile}>
                    <Upload className="h-4 w-4" /> Enviar Arquivo
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-card border-t border-border">
        <Button
          variant={micOn ? "outline" : "destructive"}
          size="lg"
          className="h-12 w-12 rounded-full p-0"
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          variant={videoOn ? "outline" : "destructive"}
          size="lg"
          className="h-12 w-12 rounded-full p-0"
          onClick={() => setVideoOn(!videoOn)}
        >
          {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-12 rounded-full p-0"
          onClick={onFile}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="h-12 px-6 rounded-full gap-2"
          onClick={onEnd}
        >
          <PhoneOff className="h-5 w-5" /> Encerrar
        </Button>
      </div>
    </div>
  );
};

export default TeleconsultaPage;
