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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell, Search, Send, CheckCheck, Trash2, Calendar, DollarSign, MessageCircle,
  AlertTriangle, Info, Settings, Eye, Filter, Clock, BellRing, Megaphone
} from "lucide-react";
import { useNotificacoes, NotificacaoTipo, NotificacaoPrioridade } from "@/contexts/NotificacoesContext";

const tipoConfig: Record<NotificacaoTipo, { label: string; icon: typeof Bell; color: string }> = {
  sistema: { label: "Sistema", icon: Settings, color: "bg-muted text-muted-foreground" },
  agenda: { label: "Agenda", icon: Calendar, color: "bg-primary/15 text-primary" },
  financeiro: { label: "Financeiro", icon: DollarSign, color: "bg-success/15 text-success" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "bg-success/15 text-success" },
  administrativo: { label: "Admin", icon: Megaphone, color: "bg-warning/15 text-warning" },
};

const prioridadeConfig: Record<NotificacaoPrioridade, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground" },
  media: { label: "Média", color: "bg-warning/15 text-warning border-warning/30" },
  alta: { label: "Alta", color: "bg-destructive/15 text-destructive border-destructive/30" },
};

const NotificacoesPage = () => {
  const { notificacoes, unreadCount, marcarLida, marcarTodasLidas, adicionarNotificacao, remover } = useNotificacoes();
  const [activeTab, setActiveTab] = useState("todas");
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterPrioridade, setFilterPrioridade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  /* send dialog */
  const [showSend, setShowSend] = useState(false);
  const [sendTitulo, setSendTitulo] = useState("");
  const [sendMensagem, setSendMensagem] = useState("");
  const [sendTipo, setSendTipo] = useState<NotificacaoTipo>("administrativo");
  const [sendPrioridade, setSendPrioridade] = useState<NotificacaoPrioridade>("media");

  const handleSend = () => {
    if (!sendTitulo || !sendMensagem) return;
    adicionarNotificacao({ titulo: sendTitulo, mensagem: sendMensagem, tipo: sendTipo, prioridade: sendPrioridade });
    setShowSend(false);
    setSendTitulo("");
    setSendMensagem("");
  };

  const filtered = notificacoes.filter(n => {
    if (filterTipo !== "all" && n.tipo !== filterTipo) return false;
    if (filterPrioridade !== "all" && n.prioridade !== filterPrioridade) return false;
    if (filterStatus === "nao_lida" && n.status !== "nao_lida") return false;
    if (filterStatus === "lida" && n.status !== "lida") return false;
    if (searchTerm && !n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) && !n.mensagem.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: notificacoes.length,
    naoLidas: unreadCount,
    alta: notificacoes.filter(n => n.prioridade === "alta" && n.status === "nao_lida").length,
    hoje: notificacoes.filter(n => n.criadoEm.startsWith("21/03/2026")).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            Notificações
          </h1>
          <p className="text-muted-foreground text-sm">Central de alertas e comunicações internas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={marcarTodasLidas} className="gap-1">
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
          <Dialog open={showSend} onOpenChange={setShowSend}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Send className="h-4 w-4" /> Enviar Notificação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enviar Notificação</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Título</Label><Input value={sendTitulo} onChange={e => setSendTitulo(e.target.value)} placeholder="Título da notificação" /></div>
                <div><Label>Mensagem</Label><Textarea value={sendMensagem} onChange={e => setSendMensagem(e.target.value)} placeholder="Conteúdo da notificação..." className="min-h-[100px]" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={sendTipo} onValueChange={v => setSendTipo(v as NotificacaoTipo)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(tipoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Select value={sendPrioridade} onValueChange={v => setSendPrioridade(v as NotificacaoPrioridade)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(prioridadeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSend} className="w-full gap-2"><Send className="h-4 w-4" /> Enviar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Bell, color: "text-primary" },
          { label: "Não lidas", value: stats.naoLidas, icon: BellRing, color: "text-warning" },
          { label: "Alta Prioridade", value: stats.alta, icon: AlertTriangle, color: "text-destructive" },
          { label: "Hoje", value: stats.hoje, icon: Clock, color: "text-primary" },
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar notificações..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(tipoConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(prioridadeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="nao_lida">Não lidas</SelectItem>
                <SelectItem value="lida">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((n, i) => {
          const tc = tipoConfig[n.tipo];
          const pc = prioridadeConfig[n.prioridade];
          const Icon = tc.icon;
          return (
            <Card
              key={n.id}
              className={`transition-all animate-fade-in border-border ${n.status === "nao_lida" ? "bg-accent/30 border-l-4 border-l-primary" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tc.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-semibold text-foreground ${n.status === "nao_lida" ? "" : "opacity-70"}`}>{n.titulo}</p>
                    {n.status === "nao_lida" && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.mensagem}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{tc.label}</Badge>
                    <Badge className={`text-[10px] ${pc.color}`}>{pc.label}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {n.criadoEm}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {n.status === "nao_lida" && (
                    <Button variant="ghost" size="sm" onClick={() => marcarLida(n.id)} title="Marcar como lida">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remover(n.id)} title="Remover" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma notificação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificacoesPage;
