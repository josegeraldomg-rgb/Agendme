import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle, Send, Clock, CheckCircle, AlertCircle, Search,
  Filter, RotateCcw, Eye, BarChart3, Zap, TrendingUp, TrendingDown
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/* ── mock data ────────────────────────────────────────────────── */
const mensagens = [
  { id: "1", paciente: "Maria Silva", telefone: "(11) 99999-1111", tipo: "lembrete1", status: "enviado", data: "21/03 08:00", texto: "Olá Maria! Lembramos da sua consulta amanhã às 09:00.", tentativas: 1 },
  { id: "2", paciente: "Carlos Souza", telefone: "(11) 99999-2222", tipo: "confirmacao", status: "pendente", data: "21/03 08:05", texto: "Carlos, seu agendamento foi confirmado para amanhã às 10:00.", tentativas: 1 },
  { id: "3", paciente: "Ana Oliveira", telefone: "(11) 99999-3333", tipo: "aniversario", status: "enviado", data: "20/03 09:00", texto: "Feliz aniversário, Ana! 🎂 A equipe deseja tudo de bom!", tentativas: 1 },
  { id: "4", paciente: "Pedro Santos", telefone: "(11) 99999-4444", tipo: "lembrete2", status: "erro", data: "20/03 08:00", texto: "Pedro, sua sessão de fisioterapia é amanhã às 14:00.", tentativas: 3 },
  { id: "5", paciente: "Lucia Mendes", telefone: "(11) 99999-5555", tipo: "cancelamento", status: "enviado", data: "19/03 08:00", texto: "Lucia, seu agendamento de amanhã às 15:30 foi cancelado.", tentativas: 1 },
  { id: "6", paciente: "Roberto Lima", telefone: "(11) 99999-6666", tipo: "lista_espera", status: "enviado", data: "19/03 10:00", texto: "Roberto, um horário ficou disponível! Deseja agendar?", tentativas: 1 },
  { id: "7", paciente: "Fernanda Costa", telefone: "(11) 99999-7777", tipo: "lembrete1", status: "erro", data: "18/03 08:00", texto: "Olá Fernanda! Lembramos da sua consulta amanhã às 11:00.", tentativas: 2 },
];

const metricas = {
  totalEnviadas: 156,
  taxaSucesso: 94.2,
  taxaFalha: 5.8,
  taxaConfirmacao: 78.5,
  tempoMedioEnvio: "2.3s",
  reducaoFaltas: 32,
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  enviado: { icon: <CheckCircle className="h-4 w-4" />, label: "Enviado", className: "bg-success/10 text-success border-success/20" },
  pendente: { icon: <Clock className="h-4 w-4" />, label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  erro: { icon: <AlertCircle className="h-4 w-4" />, label: "Erro", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const tipoConfig: Record<string, { label: string; className: string }> = {
  lembrete1: { label: "Lembrete 1", className: "bg-primary/10 text-primary" },
  lembrete2: { label: "Lembrete 2", className: "bg-accent text-accent-foreground" },
  confirmacao: { label: "Confirmação", className: "bg-success/10 text-success" },
  cancelamento: { label: "Cancelamento", className: "bg-destructive/10 text-destructive" },
  aniversario: { label: "Aniversário", className: "bg-warning/10 text-warning" },
  lista_espera: { label: "Lista Espera", className: "bg-muted text-muted-foreground" },
};

const WhatsAppPage = () => {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [tab, setTab] = useState("painel");
  const [detalheMensagem, setDetalheMensagem] = useState<typeof mensagens[0] | null>(null);

  const filtered = mensagens.filter((m) => {
    const matchBusca = !busca || m.paciente.toLowerCase().includes(busca.toLowerCase()) || m.telefone.includes(busca);
    const matchStatus = filtroStatus === "todos" || m.status === filtroStatus;
    const matchTipo = filtroTipo === "todos" || m.tipo === filtroTipo;
    return matchBusca && matchStatus && matchTipo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-success" />
            WhatsApp Hub
          </h1>
          <p className="text-muted-foreground text-sm">Central de comunicação automatizada com pacientes</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="enviar">Enviar</TabsTrigger>
          <TabsTrigger value="conexao">Conexão</TabsTrigger>
        </TabsList>

        {/* ── TAB: PAINEL ─────────────────────────────────────────── */}
        <TabsContent value="painel" className="space-y-6 mt-4">
          {/* Métricas */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard icon={<Send className="h-4 w-4 text-primary" />} label="Enviadas (mês)" value={metricas.totalEnviadas} />
            <MetricCard icon={<CheckCircle className="h-4 w-4 text-success" />} label="Taxa Sucesso" value={`${metricas.taxaSucesso}%`} />
            <MetricCard icon={<AlertCircle className="h-4 w-4 text-destructive" />} label="Taxa Falha" value={`${metricas.taxaFalha}%`} />
            <MetricCard icon={<Zap className="h-4 w-4 text-warning" />} label="Confirmações" value={`${metricas.taxaConfirmacao}%`} />
            <MetricCard icon={<BarChart3 className="h-4 w-4 text-primary" />} label="Tempo Médio" value={metricas.tempoMedioEnvio} />
            <MetricCard icon={<TrendingDown className="h-4 w-4 text-success" />} label="Redução Faltas" value={`${metricas.reducaoFaltas}%`} />
          </div>

          {/* Filtros + Lista recente */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold">Mensagens Recentes</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar paciente..." className="pl-8 h-9 w-48" value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="erro">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos tipos</SelectItem>
                      <SelectItem value="lembrete1">Lembrete 1</SelectItem>
                      <SelectItem value="lembrete2">Lembrete 2</SelectItem>
                      <SelectItem value="confirmacao">Confirmação</SelectItem>
                      <SelectItem value="cancelamento">Cancelamento</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="lista_espera">Lista Espera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem encontrada.</p>}
                {filtered.map((m, i) => {
                  const st = statusConfig[m.status];
                  const tp = tipoConfig[m.tipo];
                  return (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-shadow animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 40}ms` }} onClick={() => setDetalheMensagem(m)}>
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{m.paciente}</span>
                          <Badge variant="outline" className={`text-[10px] ${tp?.className}`}>{tp?.label}</Badge>
                          <Badge variant="outline" className={`text-[10px] ml-auto flex items-center gap-1 ${st?.className}`}>
                            {st?.icon} {st?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{m.texto}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{m.telefone}</span>
                          <span className="text-xs text-muted-foreground">{m.data}</span>
                          {m.tentativas > 1 && <span className="text-xs text-destructive">({m.tentativas} tentativas)</span>}
                        </div>
                      </div>
                      {m.status === "erro" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Reenviar" onClick={(e) => { e.stopPropagation(); }}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: TEMPLATES ──────────────────────────────────────── */}
        <TabsContent value="templates" className="mt-4">
          <WhatsAppTemplates />
        </TabsContent>

        {/* ── TAB: HISTÓRICO ──────────────────────────────────────── */}
        <TabsContent value="historico" className="mt-4">
          <WhatsAppHistorico />
        </TabsContent>

        {/* ── TAB: ENVIAR ─────────────────────────────────────────── */}
        <TabsContent value="enviar" className="mt-4">
          <WhatsAppEnviar />
        </TabsContent>

        {/* ── TAB: CONEXÃO ────────────────────────────────────────── */}
        <TabsContent value="conexao" className="mt-4">
          <WhatsAppConexao />
        </TabsContent>
      </Tabs>

      {/* Modal detalhe mensagem */}
      <Dialog open={!!detalheMensagem} onOpenChange={() => setDetalheMensagem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhe da Mensagem</DialogTitle>
            <DialogDescription>Informações completas sobre o envio.</DialogDescription>
          </DialogHeader>
          {detalheMensagem && (
            <div className="space-y-3">
              <Info label="Paciente" value={detalheMensagem.paciente} />
              <Info label="Telefone" value={detalheMensagem.telefone} />
              <Info label="Tipo" value={tipoConfig[detalheMensagem.tipo]?.label} />
              <Info label="Status" value={statusConfig[detalheMensagem.status]?.label} />
              <Info label="Data" value={detalheMensagem.data} />
              <Info label="Tentativas" value={String(detalheMensagem.tentativas)} />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Mensagem</p>
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground">{detalheMensagem.texto}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            {detalheMensagem?.status === "erro" && <Button variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" /> Reenviar</Button>}
            <Button variant="ghost" onClick={() => setDetalheMensagem(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Small helpers ──────────────────────────────────────────────── */
function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES SUB-PAGE
   ═══════════════════════════════════════════════════════════════ */
import { Plus, Edit2, Trash2, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const variaveisDisponiveis = [
  "{{nome_paciente}}", "{{data_agendamento}}", "{{hora_agendamento}}",
  "{{nome_profissional}}", "{{nome_empresa}}", "{{link_confirmacao}}", "{{link_cancelamento}}",
];

const templatesMock = [
  { id: "1", nome: "Lembrete Etapa 1", tipo: "lembrete1" as const, mensagem: "Olá {{nome_paciente}}! 😊\n\nLembramos que você tem um agendamento amanhã, {{data_agendamento}} às {{hora_agendamento}}, com {{nome_profissional}}.\n\n✅ Confirmar: {{link_confirmacao}}\n❌ Cancelar: {{link_cancelamento}}\n\nEquipe {{nome_empresa}}", ativo: true, antecedencia: 120 },
  { id: "2", nome: "Lembrete Etapa 2", tipo: "lembrete2" as const, mensagem: "Olá {{nome_paciente}}! Seu atendimento é daqui a pouco, às {{hora_agendamento}}. Estamos aguardando você! 😊\n\n{{nome_empresa}}", ativo: true, antecedencia: 60 },
  { id: "3", nome: "Confirmação de Agendamento", tipo: "confirmacao" as const, mensagem: "Olá {{nome_paciente}}! ✅\n\nSeu agendamento foi confirmado:\n📅 {{data_agendamento}} às {{hora_agendamento}}\n👨‍⚕️ {{nome_profissional}}\n\nEquipe {{nome_empresa}}", ativo: true, antecedencia: 0 },
  { id: "4", nome: "Cancelamento", tipo: "cancelamento" as const, mensagem: "Olá {{nome_paciente}},\n\nSeu agendamento de {{data_agendamento}} às {{hora_agendamento}} foi cancelado.\n\nCaso deseje reagendar, acesse nosso app.\n\n{{nome_empresa}}", ativo: true, antecedencia: 0 },
  { id: "5", nome: "Aniversário", tipo: "aniversario" as const, mensagem: "Feliz aniversário, {{nome_paciente}}! 🎂🎉\n\nA equipe {{nome_empresa}} deseja um dia maravilhoso cheio de saúde e felicidade!", ativo: true, antecedencia: 0 },
  { id: "6", nome: "Lista de Espera", tipo: "lista_espera" as const, mensagem: "Olá {{nome_paciente}}! 🎉\n\nUm horário ficou disponível em {{data_agendamento}} às {{hora_agendamento}} com {{nome_profissional}}.\n\nDeseja agendar? Responda SIM.\n\n{{nome_empresa}}", ativo: false, antecedencia: 0 },
];

type TemplateTipo = "lembrete1" | "lembrete2" | "confirmacao" | "cancelamento" | "aniversario" | "lista_espera";

interface TemplateForm {
  id?: string;
  nome: string;
  tipo: TemplateTipo;
  mensagem: string;
  ativo: boolean;
  antecedencia: number;
}

function WhatsAppTemplates() {
  const [templates, setTemplates] = useState(templatesMock);
  const [editando, setEditando] = useState<TemplateForm | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const previewValores: Record<string, string> = {
    "{{nome_paciente}}": "Maria Silva",
    "{{data_agendamento}}": "22/03/2026",
    "{{hora_agendamento}}": "09:00",
    "{{nome_profissional}}": "Dr. João",
    "{{nome_empresa}}": "Clínica Bem-Estar",
    "{{link_confirmacao}}": "https://agend.me/confirmar/abc123",
    "{{link_cancelamento}}": "https://agend.me/cancelar/abc123",
  };

  const renderPreview = (msg: string) => {
    let rendered = msg;
    Object.entries(previewValores).forEach(([k, v]) => { rendered = rendered.replaceAll(k, v); });
    return rendered;
  };

  const handleSave = () => {
    if (!editando) return;
    if (editando.id) {
      setTemplates((prev) => prev.map((t) => (t.id === editando.id ? { ...editando, id: editando.id! } : t)));
    } else {
      setTemplates((prev) => [...prev, { ...editando, id: String(Date.now()) }]);
    }
    setEditando(null);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleAtivo = (id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ativo: !t.ativo } : t)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Templates de Mensagem</h2>
          <p className="text-sm text-muted-foreground">Configure as mensagens automáticas por tipo de evento</p>
        </div>
        <Button className="gap-2" onClick={() => setEditando({ nome: "", tipo: "lembrete1", mensagem: "", ativo: true, antecedencia: 0 })}>
          <Plus className="h-4 w-4" /> Novo Template
        </Button>
      </div>

      {/* Variables reference */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Variáveis disponíveis (clique para copiar):</p>
          <div className="flex flex-wrap gap-2">
            {variaveisDisponiveis.map((v) => (
              <Badge key={v} variant="outline" className="cursor-pointer text-xs hover:bg-primary/10 transition-colors font-mono" onClick={() => navigator.clipboard.writeText(v)}>
                {v}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((t) => {
          const tp = tipoConfig[t.tipo];
          return (
            <Card key={t.id} className={`transition-opacity ${!t.ativo ? "opacity-60" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">{t.nome}</CardTitle>
                    <Badge variant="outline" className={`text-[10px] ${tp?.className}`}>{tp?.label}</Badge>
                  </div>
                  <Switch checked={t.ativo} onCheckedChange={() => toggleAtivo(t.id)} />
                </div>
                {(t.tipo === "lembrete1" || t.tipo === "lembrete2") && t.antecedencia > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {t.antecedencia} min antes</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-muted/40 text-xs text-foreground whitespace-pre-line font-mono leading-relaxed max-h-32 overflow-y-auto">{t.mensagem}</div>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setPreview(t.id)}>
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setEditando({ ...t })}>
                    <Edit2 className="h-3 w-3" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-3 w-3" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview da Mensagem</DialogTitle>
            <DialogDescription>Visualização com dados de exemplo.</DialogDescription>
          </DialogHeader>
          {preview && (() => {
            const t = templates.find((x) => x.id === preview);
            if (!t) return null;
            return (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{renderPreview(t.mensagem)}</p>
                </div>
                <p className="text-xs text-muted-foreground text-center">Esta é uma simulação com dados fictícios.</p>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreview(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit / Create dialog */}
      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando?.id ? "Editar Template" : "Novo Template"}</DialogTitle>
            <DialogDescription>Configure a mensagem automática.</DialogDescription>
          </DialogHeader>
          {editando && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} placeholder="Ex: Lembrete de consulta" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={editando.tipo} onValueChange={(v) => setEditando({ ...editando, tipo: v as TemplateTipo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lembrete1">Lembrete 1</SelectItem>
                      <SelectItem value="lembrete2">Lembrete 2</SelectItem>
                      <SelectItem value="confirmacao">Confirmação</SelectItem>
                      <SelectItem value="cancelamento">Cancelamento</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="lista_espera">Lista Espera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(editando.tipo === "lembrete1" || editando.tipo === "lembrete2") && (
                  <div className="space-y-2">
                    <Label>Antecedência (min)</Label>
                    <Input type="number" value={editando.antecedencia} onChange={(e) => setEditando({ ...editando, antecedencia: Number(e.target.value) })} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea rows={6} value={editando.mensagem} onChange={(e) => setEditando({ ...editando, mensagem: e.target.value })} placeholder="Use variáveis como {{nome_paciente}}..." className="font-mono text-sm" />
                <div className="flex flex-wrap gap-1">
                  {variaveisDisponiveis.map((v) => (
                    <Badge key={v} variant="outline" className="cursor-pointer text-[10px] hover:bg-primary/10 font-mono" onClick={() => setEditando({ ...editando, mensagem: editando.mensagem + v })}>
                      + {v}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editando.ativo} onCheckedChange={(c) => setEditando({ ...editando, ativo: c })} />
                <Label>Template ativo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!editando?.nome || !editando?.mensagem}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HISTÓRICO SUB-PAGE
   ═══════════════════════════════════════════════════════════════ */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

const historicoMock = [
  { id: "1", paciente: "Maria Silva", telefone: "(11) 99999-1111", tipo: "lembrete1", status: "enviado", data: "21/03/2026 08:00", template: "Lembrete Etapa 1", tentativas: 1, respostaApi: "200 OK" },
  { id: "2", paciente: "Carlos Souza", telefone: "(11) 99999-2222", tipo: "confirmacao", status: "enviado", data: "21/03/2026 08:05", template: "Confirmação", tentativas: 1, respostaApi: "200 OK" },
  { id: "3", paciente: "Ana Oliveira", telefone: "(11) 99999-3333", tipo: "aniversario", status: "enviado", data: "20/03/2026 09:00", template: "Aniversário", tentativas: 1, respostaApi: "200 OK" },
  { id: "4", paciente: "Pedro Santos", telefone: "(11) 99999-4444", tipo: "lembrete2", status: "erro", data: "20/03/2026 08:00", template: "Lembrete Etapa 2", tentativas: 3, respostaApi: "408 Timeout" },
  { id: "5", paciente: "Lucia Mendes", telefone: "(11) 99999-5555", tipo: "cancelamento", status: "enviado", data: "19/03/2026 08:00", template: "Cancelamento", tentativas: 1, respostaApi: "200 OK" },
  { id: "6", paciente: "Roberto Lima", telefone: "(11) 99999-6666", tipo: "lista_espera", status: "enviado", data: "19/03/2026 10:00", template: "Lista Espera", tentativas: 1, respostaApi: "200 OK" },
  { id: "7", paciente: "Fernanda Costa", telefone: "(11) 99999-7777", tipo: "lembrete1", status: "erro", data: "18/03/2026 08:00", template: "Lembrete Etapa 1", tentativas: 2, respostaApi: "500 Internal Server Error" },
  { id: "8", paciente: "José Almeida", telefone: "(11) 99999-8888", tipo: "confirmacao", status: "pendente", data: "18/03/2026 14:00", template: "Confirmação", tentativas: 1, respostaApi: "—" },
];

function WhatsAppHistorico() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const filtered = historicoMock.filter((m) => {
    const matchBusca = !busca || m.paciente.toLowerCase().includes(busca.toLowerCase()) || m.telefone.includes(busca);
    const matchStatus = filtroStatus === "todos" || m.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Histórico de Mensagens</h2>
          <p className="text-sm text-muted-foreground">Registro completo de todas as mensagens enviadas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-8 h-9 w-48" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tentativas</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Resposta API</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const st = statusConfig[m.status];
                const tp = tipoConfig[m.tipo];
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-foreground">{m.paciente}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.telefone}</TableCell>
                    <TableCell className="text-sm">{m.template}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${tp?.className}`}>{tp?.label}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] flex items-center gap-1 w-fit ${st?.className}`}>
                        {st?.icon} {st?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{m.tentativas}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.data}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{m.respostaApi}</TableCell>
                    <TableCell>
                      {m.status === "erro" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Reenviar">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENVIAR MANUAL SUB-PAGE
   ═══════════════════════════════════════════════════════════════ */
import { User, Phone } from "lucide-react";

const pacientesMock = [
  { id: "1", nome: "Maria Silva", telefone: "(11) 99999-1111" },
  { id: "2", nome: "Carlos Souza", telefone: "(11) 99999-2222" },
  { id: "3", nome: "Ana Oliveira", telefone: "(11) 99999-3333" },
  { id: "4", nome: "Pedro Santos", telefone: "(11) 99999-4444" },
  { id: "5", nome: "Lucia Mendes", telefone: "(11) 99999-5555" },
];

function WhatsAppEnviar() {
  const [pacienteId, setPacienteId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  const pacienteSelecionado = pacientesMock.find((p) => p.id === pacienteId);

  const handleEnviar = () => {
    if (!pacienteId || !mensagem.trim()) return;
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
    setMensagem("");
    setPacienteId("");
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Envio Manual</h2>
        <p className="text-sm text-muted-foreground">Envie uma mensagem personalizada diretamente para um paciente</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Selecionar Paciente</Label>
            <Select value={pacienteId} onValueChange={setPacienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {pacientesMock.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.nome}
                      <span className="text-xs text-muted-foreground">— {p.telefone}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pacienteSelecionado && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{pacienteSelecionado.nome}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {pacienteSelecionado.telefone}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea rows={5} value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Digite a mensagem que deseja enviar..." />
            <p className="text-xs text-muted-foreground">{mensagem.length} caracteres</p>
          </div>

          {/* Quick templates */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Mensagens rápidas:</Label>
            <div className="flex flex-wrap gap-2">
              {["Olá! Como posso ajudar?", "Seu horário foi confirmado.", "Por favor, entre em contato conosco."].map((q) => (
                <Badge key={q} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors text-xs" onClick={() => setMensagem(q)}>
                  {q}
                </Badge>
              ))}
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleEnviar} disabled={!pacienteId || !mensagem.trim()}>
            <Send className="h-4 w-4" /> Enviar Mensagem
          </Button>

          {enviado && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm animate-fade-in">
              <CheckCircle className="h-4 w-4" /> Mensagem adicionada à fila de envio com sucesso!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONEXÃO SUB-PAGE
   ═══════════════════════════════════════════════════════════════ */
import { Wifi, WifiOff, RefreshCw, Shield, Settings } from "lucide-react";

function WhatsAppConexao() {
  const [conectado, setConectado] = useState(true);
  const [numero, setNumero] = useState("(11) 99999-0000");
  const [token, setToken] = useState("uazapi_tk_xxxxxxxxxxxx");
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Conexão WhatsApp</h2>
        <p className="text-sm text-muted-foreground">Gerencie a conexão da clínica com a API UAZAPI</p>
      </div>

      {/* Status card */}
      <Card className={`border-2 ${conectado ? "border-success/30" : "border-destructive/30"}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${conectado ? "bg-success/10" : "bg-destructive/10"}`}>
              {conectado ? <Wifi className="h-7 w-7 text-success" /> : <WifiOff className="h-7 w-7 text-destructive" />}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">{conectado ? "Conectado" : "Desconectado"}</p>
              <p className="text-sm text-muted-foreground">{conectado ? "A integração com WhatsApp está ativa e funcionando." : "A conexão foi perdida. Reconecte para continuar enviando mensagens."}</p>
            </div>
            <Badge variant="outline" className={`text-sm px-3 py-1 ${conectado ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
              {conectado ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Config */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><Settings className="h-4 w-4" /> Configurações da Conexão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Número WhatsApp</Label>
            <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="(11) 99999-0000" />
          </div>
          <div className="space-y-2">
            <Label>Token UAZAPI</Label>
            <div className="flex gap-2">
              <Input type={showToken ? "text" : "password"} value={token} onChange={(e) => setToken(e.target.value)} className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> O token é armazenado de forma segura e nunca exposto.</p>
          </div>

          <div className="flex gap-2">
            <Button className="gap-2" onClick={() => setConectado(!conectado)}>
              {conectado ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              {conectado ? "Desconectar" : "Conectar"}
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reconectar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regras automáticas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Regras de Envio Automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RuleToggle label="Enviar confirmação ao criar agendamento" defaultChecked />
          <RuleToggle label="Enviar lembrete 1 (antecedência configurada no template)" defaultChecked />
          <RuleToggle label="Enviar lembrete 2 (antecedência configurada no template)" defaultChecked />
          <RuleToggle label="Enviar aviso de cancelamento" defaultChecked />
          <RuleToggle label="Enviar mensagem de aniversário" defaultChecked />
          <RuleToggle label="Notificar lista de espera quando horário vagar" />
          <RuleToggle label="Reenvio automático em caso de erro (até 3x)" defaultChecked />

          <div className="pt-3 border-t border-border space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Horário permitido para envio</Label>
              <div className="flex items-center gap-2">
                <Input type="time" defaultValue="07:00" className="w-28 h-9" />
                <span className="text-sm text-muted-foreground">até</span>
                <Input type="time" defaultValue="21:00" className="w-28 h-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Limite de envios simultâneos</Label>
              <Input type="number" defaultValue={5} className="w-28 h-9" />
            </div>
          </div>

          <Button className="w-full mt-2">Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RuleToggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

export default WhatsAppPage;
