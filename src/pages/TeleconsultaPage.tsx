import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Video, Activity, History, Clock, Users, Calendar, User, Copy, Play, Plus
} from "lucide-react";
import { useTeleconsultas, useUpdateTeleconsultaStatus, useCreateTeleconsulta } from "@/hooks/use-teleconsultas";
import { useClientes } from "@/hooks/use-clientes";
import { useProfissionais } from "@/hooks/use-agendamentos";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
// Import Jitsi Component
import { JitsiMeeting } from '@jitsi/react-sdk';

const statusConfig: Record<string, { label: string; color: string }> = {
  criada: { label: "Aguardando", color: "bg-warning/15 text-warning border-warning/30" },
  ativa: { label: "Em andamento", color: "bg-success/15 text-success border-success/30" },
  encerrada: { label: "Encerrada", color: "bg-muted text-muted-foreground border-border" },
};

export default function TeleconsultaPage() {
  const { session: authSession } = useAuth();
  const userName = authSession?.user?.user_metadata?.nome || "Profissional";
  
  const [activeTab, setActiveTab] = useState("consultas");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: sessions = [], isLoading } = useTeleconsultas(filterStatus, searchTerm);
  const { mutate: updateStatus } = useUpdateTeleconsultaStatus();
  const createTeleconsulta = useCreateTeleconsulta();
  const { data: pacientes = [] } = useClientes();
  const { data: profissionais = [] } = useProfissionais();

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newForm, setNewForm] = useState({
    paciente_id: "",
    profissional_id: "",
    data: format(new Date(), "yyyy-MM-dd"),
    hora: "09:00",
  });

  // Jitsi states
  const [activeSession, setActiveSession] = useState<any | null>(null);

  const stats = {
    total: sessions.length,
    ativas: sessions.filter((s) => s.status === "ativa").length,
    aguardando: sessions.filter((s) => s.status === "criada").length,
    encerradas: sessions.filter((s) => s.status === "encerrada").length,
  };

  const enterRoom = (session: any) => {
    // Se estava "criada", passa para "ativa"
    if (session.status === "criada") {
      updateStatus({ id: session.id, status: "ativa", iniciadaEm: new Date().toISOString() });
    }
    setActiveSession(session);
  };

  const endSession = () => {
    if (activeSession) {
      // Calcula duração básica se iniciada_em existir
      let duracao = 0;
      if (activeSession.iniciada_em) {
        duracao = differenceInMinutes(new Date(), new Date(activeSession.iniciada_em)) || 1;
      }
      updateStatus({ id: activeSession.id, status: "encerrada", encerradaEm: new Date().toISOString(), duracao });
      setActiveSession(null);
    }
  };

  // ── Sala Virtual (Jitsi) ──
  if (activeSession) {
    const salaNome = activeSession.sala_id_externo || `teleconsulta-${activeSession.id}`;
    
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] bg-card border border-border rounded-xl rounded-b-none overflow-hidden pb-10">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActiveSession(null)}>← Voltar para Painel</Button>
            <div className="h-5 border-l border-border mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-semibold text-sm">{activeSession.paciente}</span>
              <span className="text-xs text-muted-foreground">• Consultório Virtual</span>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={endSession}>Encerrar Sessão</Button>
        </div>
        <div className="flex-1 w-full bg-foreground relative">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={salaNome}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              DEFAULT_BACKGROUND: '#020817', // dark theme background
            }}
            userInfo={{
              displayName: userName
            }}
            onApiReady={(externalApi) => {
              // Quando a API estiver pronta, podemos injetar os comandos
              externalApi.addListener('videoConferenceLeft', () => {
                setActiveSession(null);
              });
            }}
            getIFrameRef={(iframeRef) => { 
                iframeRef.style.height = '100%'; 
                iframeRef.style.width = '100%'; 
            }}
          />
        </div>
      </div>
    );
  }

  // ── Lista Principal ──
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Teleconsulta
          </h1>
          <p className="text-muted-foreground text-sm">Atendimentos remotos por vídeo integrados ao Jitsi</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Nova Teleconsulta
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-primary" },
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
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {isLoading && <p className="text-center text-sm py-4">Carregando...</p>}
            {!isLoading && sessions.filter(s => s.status !== "encerrada").map((s) => {
              const sc = statusConfig[s.status] || statusConfig.criada;
              const link = s.link_sala_paciente || s.link_sala || `https://meet.jit.si/${s.sala_id_externo}`;
              return (
                <Card key={s.id} className="border-border hover:shadow-md transition-all">
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
                          <Calendar className="h-3 w-3" /> {s.data ? format(parseISO(s.data), "dd/MM/yyyy", { locale: ptBR }) : "--"}
                          <span>•</span>
                          <Clock className="h-3 w-3" /> {s.hora ? s.hora.substring(0, 5) : "--"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${sc.color}`}>{sc.label}</Badge>
                      <Button size="sm" onClick={() => enterRoom(s)} className="gap-1 px-4">
                        <Play className="h-3 w-3" /> {s.status === "ativa" ? "Entrar na Sala" : "Iniciar Sessão"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(link)} title="Copiar link do paciente">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!isLoading && sessions.filter(s => s.status !== "encerrada").length === 0 && (
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
                        <Calendar className="h-3 w-3" /> {s.data ? format(parseISO(s.data), "dd/MM/yyyy") : "--"}
                        <span>•</span>
                        <Clock className="h-3 w-3" /> Duração: {s.duracao_minutos || "--"} min
                      </div>
                    </div>
                  </div>
                  <Badge className="text-xs bg-muted text-muted-foreground">Encerrada</Badge>
                </CardContent>
              </Card>
            ))}
            {sessions.filter(s => s.status === "encerrada").length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Nenhum histórico encontrado</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog — Nova Teleconsulta */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Nova Teleconsulta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Paciente *</Label>
              <Select value={newForm.paciente_id} onValueChange={(v) => setNewForm((f) => ({ ...f, paciente_id: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profissional *</Label>
              <Select value={newForm.profissional_id} onValueChange={(v) => setNewForm((f) => ({ ...f, profissional_id: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={newForm.data}
                  onChange={(e) => setNewForm((f) => ({ ...f, data: e.target.value }))}
                />
              </div>
              <div>
                <Label>Horário *</Label>
                <Input
                  type="time"
                  className="mt-1"
                  value={newForm.hora}
                  onChange={(e) => setNewForm((f) => ({ ...f, hora: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button
              disabled={!newForm.paciente_id || !newForm.profissional_id || !newForm.data || !newForm.hora || createTeleconsulta.isPending}
              onClick={() => {
                createTeleconsulta.mutate(
                  { paciente_id: newForm.paciente_id, profissional_id: newForm.profissional_id, data: newForm.data, hora: newForm.hora },
                  {
                    onSuccess: () => {
                      setShowCreateDialog(false);
                      setNewForm({ paciente_id: "", profissional_id: "", data: format(new Date(), "yyyy-MM-dd"), hora: "09:00" });
                    },
                  }
                );
              }}
            >
              {createTeleconsulta.isPending ? "Criando..." : "Criar Teleconsulta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
