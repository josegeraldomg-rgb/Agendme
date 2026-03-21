import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Webhook,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
  Loader2,
  EyeOff,
} from "lucide-react";

// ── Types ──────────────────────────────────────────
interface WebhookItem {
  id: string;
  nome: string;
  url: string;
  segredo: string;
  ativo: boolean;
  eventosCount: number;
  criadoEm: string;
}

interface Entrega {
  id: string;
  webhookNome: string;
  evento: string;
  url: string;
  status: "pendente" | "processando" | "enviado" | "erro" | "erro_permanente";
  codigoResposta: number | null;
  tentativas: number;
  criadoEm: string;
  atualizadoEm: string;
  payload: object;
}

interface Teste {
  id: string;
  webhookNome: string;
  evento: string;
  status: "sucesso" | "erro";
  codigoResposta: number | null;
  criadoEm: string;
}

// ── Mock Data ──────────────────────────────────────
const eventosDisponiveis = [
  { id: "1", nome: "agendamento_criado", descricao: "Quando um agendamento é criado", grupo: "Agenda" },
  { id: "2", nome: "agendamento_confirmado", descricao: "Quando um agendamento é confirmado", grupo: "Agenda" },
  { id: "3", nome: "agendamento_cancelado", descricao: "Quando um agendamento é cancelado", grupo: "Agenda" },
  { id: "4", nome: "agendamento_remarcado", descricao: "Quando um agendamento é remarcado", grupo: "Agenda" },
  { id: "5", nome: "agendamento_concluido", descricao: "Quando um agendamento é concluído", grupo: "Agenda" },
  { id: "6", nome: "paciente_criado", descricao: "Quando um paciente é cadastrado", grupo: "Pacientes" },
  { id: "7", nome: "paciente_atualizado", descricao: "Quando um paciente é atualizado", grupo: "Pacientes" },
  { id: "8", nome: "pagamento_confirmado", descricao: "Quando um pagamento é confirmado", grupo: "Financeiro" },
  { id: "9", nome: "pagamento_cancelado", descricao: "Quando um pagamento é cancelado", grupo: "Financeiro" },
  { id: "10", nome: "fatura_gerada", descricao: "Quando uma fatura é gerada", grupo: "Financeiro" },
  { id: "11", nome: "prontuario_criado", descricao: "Quando um prontuário é criado", grupo: "Prontuário" },
  { id: "12", nome: "prontuario_atualizado", descricao: "Quando um prontuário é atualizado", grupo: "Prontuário" },
  { id: "13", nome: "prontuario_fechado", descricao: "Quando um prontuário é fechado", grupo: "Prontuário" },
  { id: "14", nome: "usuario_criado", descricao: "Quando um usuário é criado", grupo: "Sistema" },
  { id: "15", nome: "empresa_suspensa", descricao: "Quando uma empresa é suspensa", grupo: "Sistema" },
];

const initialWebhooks: WebhookItem[] = [
  { id: "1", nome: "CRM Integração", url: "https://crm.exemplo.com/webhooks/agendme", segredo: "whsec_abc123def456ghi789", ativo: true, eventosCount: 4, criadoEm: "2026-03-10" },
  { id: "2", nome: "ERP Financeiro", url: "https://erp.empresa.com/api/webhooks", segredo: "whsec_xyz789mno456pqr123", ativo: true, eventosCount: 3, criadoEm: "2026-03-15" },
  { id: "3", nome: "Automação Zapier", url: "https://hooks.zapier.com/hooks/catch/123456/abcdef", segredo: "whsec_zap111222333444", ativo: false, eventosCount: 2, criadoEm: "2026-03-18" },
];

const initialEntregas: Entrega[] = [
  { id: "e1", webhookNome: "CRM Integração", evento: "agendamento_criado", url: "https://crm.exemplo.com/webhooks/agendme", status: "enviado", codigoResposta: 200, tentativas: 1, criadoEm: "2026-03-21 10:30", atualizadoEm: "2026-03-21 10:30", payload: { evento: "agendamento_criado", dados: { agendamento_id: "uuid-1" } } },
  { id: "e2", webhookNome: "ERP Financeiro", evento: "pagamento_confirmado", url: "https://erp.empresa.com/api/webhooks", status: "enviado", codigoResposta: 201, tentativas: 1, criadoEm: "2026-03-21 11:00", atualizadoEm: "2026-03-21 11:00", payload: { evento: "pagamento_confirmado", dados: { pagamento_id: "uuid-2" } } },
  { id: "e3", webhookNome: "CRM Integração", evento: "agendamento_cancelado", url: "https://crm.exemplo.com/webhooks/agendme", status: "erro", codigoResposta: 500, tentativas: 3, criadoEm: "2026-03-21 12:15", atualizadoEm: "2026-03-21 12:45", payload: { evento: "agendamento_cancelado", dados: { agendamento_id: "uuid-3" } } },
  { id: "e4", webhookNome: "Automação Zapier", evento: "paciente_criado", url: "https://hooks.zapier.com/hooks/catch/123456/abcdef", status: "erro_permanente", codigoResposta: 404, tentativas: 5, criadoEm: "2026-03-20 09:00", atualizadoEm: "2026-03-20 12:30", payload: { evento: "paciente_criado", dados: { paciente_id: "uuid-4" } } },
  { id: "e5", webhookNome: "ERP Financeiro", evento: "fatura_gerada", url: "https://erp.empresa.com/api/webhooks", status: "pendente", codigoResposta: null, tentativas: 0, criadoEm: "2026-03-21 14:00", atualizadoEm: "2026-03-21 14:00", payload: { evento: "fatura_gerada", dados: { fatura_id: "uuid-5" } } },
];

const initialTestes: Teste[] = [
  { id: "t1", webhookNome: "CRM Integração", evento: "agendamento_criado", status: "sucesso", codigoResposta: 200, criadoEm: "2026-03-20 16:00" },
  { id: "t2", webhookNome: "Automação Zapier", evento: "paciente_criado", status: "erro", codigoResposta: 404, criadoEm: "2026-03-19 11:30" },
];

// ── Helpers ────────────────────────────────────────
function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "whsec_";
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    enviado: { label: "Enviado", variant: "default" },
    pendente: { label: "Pendente", variant: "secondary" },
    processando: { label: "Processando", variant: "outline" },
    erro: { label: "Erro", variant: "destructive" },
    erro_permanente: { label: "Erro Permanente", variant: "destructive" },
    sucesso: { label: "Sucesso", variant: "default" },
  };
  const info = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "enviado":
    case "sucesso":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "erro":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "erro_permanente":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "processando":
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

// ── Main Page ──────────────────────────────────────
export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);
  const [entregas] = useState<Entrega[]>(initialEntregas);
  const [testes, setTestes] = useState<Teste[]>(initialTestes);

  // Create/edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formAtivo, setFormAtivo] = useState(true);
  const [formSegredo, setFormSegredo] = useState("");

  // Event subscriptions
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>("");
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>(["1", "2", "3", "8"]);

  // Logs filters
  const [logFilterStatus, setLogFilterStatus] = useState<string>("todos");
  const [logFilterEvento, setLogFilterEvento] = useState<string>("todos");

  // Detail dialog
  const [detailEntrega, setDetailEntrega] = useState<Entrega | null>(null);

  // Test state
  const [testWebhookId, setTestWebhookId] = useState<string>("");
  const [testEvento, setTestEvento] = useState<string>("");
  const [testSending, setTestSending] = useState(false);

  // Secret visibility
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  // ── Webhook CRUD ─────────────────────────────────
  function openCreate() {
    setEditingWebhook(null);
    setFormNome("");
    setFormUrl("");
    setFormAtivo(true);
    setFormSegredo(generateSecret());
    setDialogOpen(true);
  }

  function openEdit(wh: WebhookItem) {
    setEditingWebhook(wh);
    setFormNome(wh.nome);
    setFormUrl(wh.url);
    setFormAtivo(wh.ativo);
    setFormSegredo(wh.segredo);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!formNome.trim()) { toast.error("Nome obrigatório"); return; }
    if (!formUrl.trim()) { toast.error("URL obrigatória"); return; }
    if (!formUrl.startsWith("https://")) { toast.error("URL deve usar HTTPS"); return; }

    if (editingWebhook) {
      setWebhooks((prev) => prev.map((w) => w.id === editingWebhook.id ? { ...w, nome: formNome, url: formUrl, ativo: formAtivo, segredo: formSegredo, atualizadoEm: new Date().toISOString() } : w));
      toast.success("Webhook atualizado");
    } else {
      const newWh: WebhookItem = {
        id: crypto.randomUUID(),
        nome: formNome,
        url: formUrl,
        segredo: formSegredo,
        ativo: formAtivo,
        eventosCount: 0,
        criadoEm: new Date().toISOString().split("T")[0],
      };
      setWebhooks((prev) => [...prev, newWh]);
      toast.success("Webhook criado");
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast.success("Webhook removido");
  }

  function toggleAtivo(id: string) {
    setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, ativo: !w.ativo } : w));
  }

  function toggleSecretVisibility(id: string) {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ── Events ───────────────────────────────────────
  function toggleEvent(eventId: string) {
    setSubscribedEvents((prev) => prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]);
  }

  function saveEvents() {
    if (subscribedEvents.length === 0) { toast.error("Selecione pelo menos 1 evento"); return; }
    toast.success("Eventos salvos com sucesso");
  }

  // ── Logs ─────────────────────────────────────────
  const filteredEntregas = entregas.filter((e) => {
    if (logFilterStatus !== "todos" && e.status !== logFilterStatus) return false;
    if (logFilterEvento !== "todos" && e.evento !== logFilterEvento) return false;
    return true;
  });

  // ── Test ─────────────────────────────────────────
  function handleTest() {
    if (!testWebhookId) { toast.error("Selecione um webhook"); return; }
    if (!testEvento) { toast.error("Selecione um evento"); return; }
    setTestSending(true);
    const wh = webhooks.find((w) => w.id === testWebhookId);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      const newTest: Teste = {
        id: crypto.randomUUID(),
        webhookNome: wh?.nome || "",
        evento: testEvento,
        status: success ? "sucesso" : "erro",
        codigoResposta: success ? 200 : 500,
        criadoEm: new Date().toLocaleString("pt-BR"),
      };
      setTestes((prev) => [newTest, ...prev]);
      setTestSending(false);
      toast[success ? "success" : "error"](success ? "Teste enviado com sucesso" : "Teste retornou erro");
    }, 1500);
  }

  const payloadPreview = testEvento
    ? JSON.stringify({ evento: testEvento, data_evento: new Date().toISOString(), empresa_id: "uuid-empresa", webhook_id: testWebhookId || "uuid-webhook", versao: "v1", dados: { id: "uuid-recurso", status: "ativo" } }, null, 2)
    : "";

  // ── Stats ────────────────────────────────────────
  const totalAtivos = webhooks.filter((w) => w.ativo).length;
  const totalEnviados = entregas.filter((e) => e.status === "enviado").length;
  const totalErros = entregas.filter((e) => e.status === "erro" || e.status === "erro_permanente").length;
  const taxaSucesso = entregas.length > 0 ? Math.round((totalEnviados / entregas.length) * 100) : 0;

  // ── Render ───────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
        <p className="text-muted-foreground text-sm">Gerencie integrações via eventos em tempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Webhook className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalAtivos}</p><p className="text-xs text-muted-foreground">Webhooks ativos</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Send className="h-5 w-5 text-emerald-500" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalEnviados}</p><p className="text-xs text-muted-foreground">Entregas enviadas</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><XCircle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalErros}</p><p className="text-xs text-muted-foreground">Erros de entrega</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{taxaSucesso}%</p><p className="text-xs text-muted-foreground">Taxa de sucesso</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="logs">Entregas</TabsTrigger>
          <TabsTrigger value="testar">Testar</TabsTrigger>
        </TabsList>

        {/* ── Tab: Webhooks ──────────────────────── */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Gerencie endpoints de integração</CardDescription>
              </div>
              <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />Novo Webhook</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Segredo</TableHead>
                    <TableHead className="text-center">Eventos</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((wh) => (
                    <TableRow key={wh.id}>
                      <TableCell className="font-medium">{wh.nome}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground font-mono">{wh.url}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                            {visibleSecrets.has(wh.id) ? wh.segredo : "••••••••••••••••"}
                          </span>
                          <button onClick={() => toggleSecretVisibility(wh.id)} className="text-muted-foreground hover:text-foreground">
                            {visibleSecrets.has(wh.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(wh.segredo); toast.success("Segredo copiado"); }} className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center"><Badge variant="secondary">{wh.eventosCount}</Badge></TableCell>
                      <TableCell className="text-center">
                        <Switch checked={wh.ativo} onCheckedChange={() => toggleAtivo(wh.id)} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{wh.criadoEm}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(wh)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(wh.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {webhooks.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum webhook cadastrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Create / Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWebhook ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
                <DialogDescription>Informe os dados do webhook. Apenas URLs HTTPS são permitidas.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: CRM Integração" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL de destino (HTTPS)</Label>
                  <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://exemplo.com/webhook" />
                </div>
                <div className="space-y-1.5">
                  <Label>Segredo de assinatura</Label>
                  <div className="flex gap-2">
                    <Input value={formSegredo} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="sm" onClick={() => setFormSegredo(generateSecret())}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Usado para assinar payloads via HMAC SHA256</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formAtivo} onCheckedChange={setFormAtivo} />
                  <Label>Ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>{editingWebhook ? "Salvar" : "Criar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── Tab: Eventos ───────────────────────── */}
        <TabsContent value="eventos">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Assinatura de Eventos</CardTitle>
                <CardDescription>Selecione quais eventos disparam este webhook</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedWebhookId} onValueChange={setSelectedWebhookId}>
                  <SelectTrigger className="w-52"><SelectValue placeholder="Selecionar webhook" /></SelectTrigger>
                  <SelectContent>
                    {webhooks.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveEvents} size="sm">Salvar</Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const grupos = [...new Set(eventosDisponiveis.map((e) => e.grupo))];
                return (
                  <div className="space-y-6">
                    {grupos.map((grupo) => (
                      <div key={grupo}>
                        <h3 className="text-sm font-semibold text-foreground mb-2">{grupo}</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {eventosDisponiveis.filter((e) => e.grupo === grupo).map((ev) => (
                            <label key={ev.id} className="flex items-start gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors">
                              <Checkbox checked={subscribedEvents.includes(ev.id)} onCheckedChange={() => toggleEvent(ev.id)} className="mt-0.5" />
                              <div>
                                <p className="text-sm font-medium font-mono text-foreground">{ev.nome}</p>
                                <p className="text-xs text-muted-foreground">{ev.descricao}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Logs ──────────────────────────── */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Entregas</CardTitle>
                <CardDescription>Histórico de envios e reenvios</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={logFilterStatus} onValueChange={setLogFilterStatus}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos status</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                    <SelectItem value="erro_permanente">Erro Permanente</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={logFilterEvento} onValueChange={setLogFilterEvento}>
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos eventos</SelectItem>
                    {[...new Set(entregas.map((e) => e.evento))].map((ev) => (
                      <SelectItem key={ev} value={ev}>{ev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead className="text-center">Código</TableHead>
                    <TableHead className="text-center">Tentativas</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntregas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell><div className="flex items-center gap-1.5"><StatusIcon status={e.status} /><StatusBadge status={e.status} /></div></TableCell>
                      <TableCell className="font-medium text-sm">{e.webhookNome}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{e.evento}</TableCell>
                      <TableCell className="text-center text-sm">{e.codigoResposta ?? "—"}</TableCell>
                      <TableCell className="text-center text-sm">{e.tentativas}/5</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.criadoEm}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setDetailEntrega(e)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(JSON.stringify(e.payload, null, 2)); toast.success("Payload copiado"); }}><Copy className="h-4 w-4" /></Button>
                          {(e.status === "erro" || e.status === "erro_permanente") && (
                            <Button variant="ghost" size="icon" onClick={() => toast.info("Reenvio agendado")}><RefreshCw className="h-4 w-4" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEntregas.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma entrega encontrada</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <Dialog open={!!detailEntrega} onOpenChange={() => setDetailEntrega(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Detalhes da Entrega</DialogTitle>
              </DialogHeader>
              {detailEntrega && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Webhook:</span> <span className="font-medium">{detailEntrega.webhookNome}</span></div>
                    <div><span className="text-muted-foreground">Evento:</span> <span className="font-mono text-xs">{detailEntrega.evento}</span></div>
                    <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailEntrega.status} /></div>
                    <div><span className="text-muted-foreground">Código:</span> {detailEntrega.codigoResposta ?? "—"}</div>
                    <div><span className="text-muted-foreground">Tentativas:</span> {detailEntrega.tentativas}/5</div>
                    <div><span className="text-muted-foreground">Criado:</span> {detailEntrega.criadoEm}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payload</Label>
                    <pre className="mt-1 p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-48">{JSON.stringify(detailEntrega.payload, null, 2)}</pre>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">URL Destino</Label>
                    <p className="font-mono text-xs mt-1 break-all">{detailEntrega.url}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── Tab: Testar ────────────────────────── */}
        <TabsContent value="testar">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Testar Webhook</CardTitle>
                <CardDescription>Envie um payload de teste para verificar a integração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Webhook</Label>
                  <Select value={testWebhookId} onValueChange={setTestWebhookId}>
                    <SelectTrigger><SelectValue placeholder="Selecionar webhook" /></SelectTrigger>
                    <SelectContent>
                      {webhooks.filter((w) => w.ativo).map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>{wh.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Evento de teste</Label>
                  <Select value={testEvento} onValueChange={setTestEvento}>
                    <SelectTrigger><SelectValue placeholder="Selecionar evento" /></SelectTrigger>
                    <SelectContent>
                      {eventosDisponiveis.map((ev) => (
                        <SelectItem key={ev.id} value={ev.nome}>{ev.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {payloadPreview && (
                  <div className="space-y-1.5">
                    <Label>Payload</Label>
                    <Textarea value={payloadPreview} readOnly className="font-mono text-xs h-40 resize-none" />
                  </div>
                )}
                <Button onClick={handleTest} disabled={testSending} className="w-full">
                  {testSending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Enviando...</> : <><Send className="h-4 w-4 mr-1" />Enviar Teste</>}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Testes</CardTitle>
                <CardDescription>Resultados dos testes realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead className="text-center">Código</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testes.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell><div className="flex items-center gap-1.5"><StatusIcon status={t.status} /><StatusBadge status={t.status} /></div></TableCell>
                        <TableCell className="font-medium text-sm">{t.webhookNome}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{t.evento}</TableCell>
                        <TableCell className="text-center text-sm">{t.codigoResposta ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.criadoEm}</TableCell>
                      </TableRow>
                    ))}
                    {testes.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum teste realizado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
