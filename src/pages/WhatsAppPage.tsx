import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MessageCircle, Send, Clock, CheckCircle, AlertCircle, BarChart3, Zap, TrendingDown,
  RefreshCw, Power, Settings
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWhatsAppStats, useWhatsAppMensagens, useWhatsAppConfig, useUpdateWhatsAppConfig } from "@/hooks/use-whatsapp";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  enviado: { icon: <CheckCircle className="h-4 w-4" />, label: "Enviado", className: "bg-success/10 text-success border-success/20" },
  entregue: { icon: <CheckCircle className="h-4 w-4" />, label: "Entregue", className: "bg-success/10 text-success border-success/20" },
  lido: { icon: <CheckCircle className="h-4 w-4" />, label: "Lido", className: "bg-primary/10 text-primary border-primary/20" },
  pendente: { icon: <Clock className="h-4 w-4" />, label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  erro: { icon: <AlertCircle className="h-4 w-4" />, label: "Falha", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const tipoConfig: Record<string, { label: string; className: string }> = {
  lembrete: { label: "Lembrete", className: "bg-primary/10 text-primary" },
  confirmacao: { label: "Confirmação", className: "bg-success/10 text-success" },
  cancelamento: { label: "Cancelamento", className: "bg-destructive/10 text-destructive" },
  aniversario: { label: "Aniversário", className: "bg-warning/10 text-warning" },
  promocional: { label: "Promocional", className: "bg-accent/10 text-accent-foreground" },
};

export default function WhatsAppPage() {
  const [tab, setTab] = useState("painel");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const { data: stats } = useWhatsAppStats();
  const { data: config } = useWhatsAppConfig();
  const { data: mensagens = [], isLoading } = useWhatsAppMensagens(busca, filtroStatus);
  const updateConfig = useUpdateWhatsAppConfig();

  // Estados locais para configuração
  const [tokenLocal, setTokenLocal] = useState("");
  const [urlLocal, setUrlLocal] = useState("");
  const [numeroLocal, setNumeroLocal] = useState("");
  const [iaAtivoLocal, setIaAtivoLocal] = useState(false);
  const [promptLocal, setPromptLocal] = useState("");
  const [configsLoaded, setConfigsLoaded] = useState(false);

  // Sincronizar com remote state
  useEffect(() => {
    if (config && !configsLoaded) {
      setTokenLocal(config.token_api || "");
      setUrlLocal(config.url_api || "");
      setNumeroLocal(config.numero || "");
      setIaAtivoLocal(config.ia_ativo || false);
      setPromptLocal(config.ia_prompt || "");
      setConfigsLoaded(true);
    }
  }, [config, configsLoaded]);

  const handleSaveConfig = () => {
    updateConfig.mutate({
      token_api: tokenLocal || config?.token_api,
      url_api: urlLocal || config?.url_api,
      numero: numeroLocal || config?.numero,
      ia_ativo: iaAtivoLocal,
      ia_prompt: promptLocal,
      provedor: "uazapi"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-success" />
            WhatsApp Hub (UAZAPI)
          </h1>
          <p className="text-muted-foreground text-sm">Central de comunicação e envio de notificações</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="conexao">Conexão</TabsTrigger>
          <TabsTrigger value="agente">Agente IA</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="space-y-6 mt-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start"><p className="text-xs text-muted-foreground">Enviadas</p><Send className="h-4 w-4 text-primary" /></div>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.enviadas || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start"><p className="text-xs text-muted-foreground">Taxa Sucesso</p><CheckCircle className="h-4 w-4 text-success" /></div>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.taxaSucesso || 0}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start"><p className="text-xs text-muted-foreground">Confirmadas</p><Zap className="h-4 w-4 text-warning" /></div>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.taxaConfirmacao || 0}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start"><p className="text-xs text-muted-foreground">Falhas</p><AlertCircle className="h-4 w-4 text-destructive" /></div>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.taxaFalha || 0}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start"><p className="text-xs text-muted-foreground">Na fila</p><Clock className="h-4 w-4 text-muted-foreground" /></div>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.pendentes || 0}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input placeholder="Buscar paciente ou número" value={busca} onChange={(e) => setBusca(e.target.value)} className="flex-1" />
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {isLoading && <p className="text-center py-6 text-sm text-muted-foreground">Carregando histórico...</p>}
            {!isLoading && mensagens.map((m) => {
              const cfg = statusConfig[m.status] || statusConfig.pendente;
              const tCfg = tipoConfig[m.tipo || "lembrete"] || tipoConfig.lembrete;
              return (
                <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{m.paciente}</span>
                      <span className="text-xs text-muted-foreground">{m.telefone}</span>
                      <Badge variant="secondary" className={`text-[10px] uppercase font-bold py-0 ${tCfg.className}`}>{tCfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[500px] mt-1">{m.texto || "Conteúdo oculto"}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 mt-3 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                    <span className="text-[10px] text-muted-foreground">{m.created_at ? format(parseISO(m.created_at), "dd/MM/yyyy HH:mm") : "--"}</span>
                    <Badge variant="outline" className={`gap-1 flex items-center shadow-none text-xs ${cfg.className}`}>
                      {cfg.icon} {cfg.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {!isLoading && mensagens.length === 0 && (
              <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                Nenhuma mensagem encontrada
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="conexao" className="mt-4">
           {/* Conexão com UAZAPI */}
           <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl ${config?.conectado ? 'bg-success/10' : 'bg-warning/10'}`}>
                  {config?.conectado ? <Power className="h-6 w-6 text-success" /> : <Settings className="h-6 w-6 text-warning" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Credenciais UAZAPI</h3>
                  <p className="text-sm text-muted-foreground">Conecte sua instância oficial do UAZAPI para envio das mensagens pelo seu número.</p>
                </div>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome / Número do WhatsApp</label>
                  <Input defaultValue={config?.numero} onChange={(e) => setNumeroLocal(e.target.value)} placeholder="+55 (11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token da API (UAZAPI)</label>
                  <Input type="password" defaultValue={config?.token_api} onChange={(e) => setTokenLocal(e.target.value)} placeholder="••••••••••••••••••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Base (Ex: https://api.uazapi.com/v1)</label>
                  <Input defaultValue={config?.url_api} onChange={(e) => setUrlLocal(e.target.value)} placeholder="https://..." />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button onClick={handleSaveConfig} disabled={updateConfig.isPending}>
                    {updateConfig.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  {config?.token_api && (
                    <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Testar Conexão</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground border-dashed">
              O gerenciamento de templates na UAZAPI acontece primordialmente pela Meta Cloud API.<br/>
              Em futuras versões, espelharemos os templates sincronizados aqui para rápido preenchimento.
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── GUIA DO AGENTE IA ── */}
        <TabsContent value="agente" className="mt-4">
          <Card className="bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Piloto Automático (Agente NLP)
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Ativar Agente Autônomo</Label>
                    <button
                      type="button"
                      onClick={() => setIaAtivoLocal(!iaAtivoLocal)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${iaAtivoLocal ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${iaAtivoLocal ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quando ativo, o Agente de Inteligência Artificial usando o ChatGPT responderá os pacientes automaticamente,
                  consultando horários livres e gravando marcações na sua agenda real sem intervenção humana.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Prompt do Sistema (Regras de Ouro e Personalidade)</Label>
                  <textarea
                    value={promptLocal}
                    onChange={(e) => setPromptLocal(e.target.value)}
                    placeholder="Ex: Haja como uma recepcionista carinhosa, ofereça sempre os horários da tarde primeiro..."
                    rows={8}
                    className="w-full mt-2 rounded-xl bg-background border border-input px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Aqui você ensina a IA como agir. Quaisquer regras de negócio restritas (não dar desconto, limitar dias de retorno) entram aqui.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSaveConfig} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                    Salvar Configurações do Agente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
