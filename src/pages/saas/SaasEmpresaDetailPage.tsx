import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Phone, CreditCard, CalendarDays, ExternalLink, Globe, Settings2, BarChart3, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { mockEmpresas, planLimits, type Empresa } from "@/contexts/EmpresaContext";

const statusStyle: Record<string, string> = {
  ativa: "bg-success/10 text-success",
  inadimplente: "bg-warning/10 text-warning",
  suspensa: "bg-destructive/10 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
};

const tenantLogs = [
  { evento: "login", descricao: "Admin realizou login", data: "2026-03-21T10:30:00" },
  { evento: "config.alterada", descricao: "Timezone alterado para America/Sao_Paulo", data: "2026-03-20T14:15:00" },
  { evento: "plano.upgrade", descricao: "Plano alterado de Básico para Profissional", data: "2026-03-18T09:00:00" },
  { evento: "usuario.criado", descricao: "Novo usuário Dr. Pedro adicionado", data: "2026-03-15T11:45:00" },
  { evento: "backup.concluido", descricao: "Backup automático concluído (48.2 MB)", data: "2026-03-21T02:00:00" },
];

export default function SaasEmpresaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const empresa = mockEmpresas.find(e => e.id === id) as Empresa | undefined;
  const [status, setStatus] = useState(empresa?.status || "ativa");

  if (!empresa) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Empresa não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/saas/empresas")}>Voltar</Button>
      </div>
    );
  }

  const handleSuspend = () => { setStatus("suspensa"); toast.success("Empresa suspensa"); };
  const handleReactivate = () => { setStatus("ativa"); toast.success("Empresa reativada!"); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/saas/empresas")} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{empresa.nome}</h1>
          <p className="text-sm text-muted-foreground">{empresa.subdominio}.agend.me {empresa.dominio && `• ${empresa.dominio}`}</p>
        </div>
        <Badge className={cn("capitalize", statusStyle[status])} variant="outline">{status}</Badge>
      </div>

      <Tabs defaultValue="visao" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="metricas">Métricas & Limites</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs Tenant</TabsTrigger>
          <TabsTrigger value="acoes">Ações</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Dados da Empresa</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Building2, label: empresa.nome },
                  { icon: Mail, label: empresa.email },
                  { icon: Phone, label: empresa.telefone },
                  { icon: Globe, label: `${empresa.subdominio}.agend.me` },
                  { icon: CalendarDays, label: `Desde ${new Date(empresa.criadoEm).toLocaleDateString("pt-BR")}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <item.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Plano & Funcionalidades</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-semibold">{empresa.plano}</span>
                </div>
                <div className="space-y-2 pt-2">
                  {[
                    { label: "WhatsApp", enabled: empresa.limites.whatsappHabilitado },
                    { label: "Teleconsulta", enabled: empresa.limites.teleconsultaHabilitada },
                    { label: "IA (Prontuário)", enabled: empresa.limites.usoIaHabilitado },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{f.label}</span>
                      <Badge variant={f.enabled ? "default" : "secondary"}>{f.enabled ? "Ativo" : "Inativo"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Acesso Rápido</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2 justify-start" onClick={() => navigate("/dashboard")}>
                  <ExternalLink className="h-4 w-4 text-primary" /> Painel Admin
                </Button>
                <Button variant="outline" className="gap-2 justify-start" onClick={() => window.open(`/app/${empresa.slug}`, "_blank")}>
                  <ExternalLink className="h-4 w-4 text-primary" /> App do Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas & Limites */}
        <TabsContent value="metricas" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {empresa.metricas.map(m => {
              const pct = m.limite ? Math.round((m.valor / m.limite) * 100) : null;
              const isNearLimit = pct !== null && pct >= 80;
              return (
                <Card key={m.nome}>
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-muted-foreground">{m.nome}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-foreground">{m.valor.toLocaleString("pt-BR")}</span>
                      {m.limite && <span className="text-sm text-muted-foreground mb-0.5">/ {m.limite.toLocaleString("pt-BR")}</span>}
                    </div>
                    {pct !== null && (
                      <div className="space-y-1">
                        <Progress value={pct} className="h-2" />
                        <div className="flex items-center gap-1">
                          {isNearLimit && <AlertTriangle className="h-3 w-3 text-warning" />}
                          <span className={cn("text-xs", isNearLimit ? "text-warning" : "text-muted-foreground")}>{pct}% utilizado</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Limites do Plano {empresa.plano}</CardTitle>
              <CardDescription>Limites configurados conforme o plano contratado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead className="text-right">Limite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Máx. Usuários</TableCell><TableCell className="text-right font-medium">{empresa.limites.maxUsuarios}</TableCell></TableRow>
                  <TableRow><TableCell>Agendamentos/mês</TableCell><TableCell className="text-right font-medium">{empresa.limites.maxAgendamentosMes.toLocaleString()}</TableCell></TableRow>
                  <TableRow><TableCell>Armazenamento</TableCell><TableCell className="text-right font-medium">{(empresa.limites.armazenamentoMb / 1000).toFixed(1)} GB</TableCell></TableRow>
                  <TableRow><TableCell>IA habilitada</TableCell><TableCell className="text-right"><Badge variant={empresa.limites.usoIaHabilitado ? "default" : "secondary"}>{empresa.limites.usoIaHabilitado ? "Sim" : "Não"}</Badge></TableCell></TableRow>
                  <TableRow><TableCell>Teleconsulta</TableCell><TableCell className="text-right"><Badge variant={empresa.limites.teleconsultaHabilitada ? "default" : "secondary"}>{empresa.limites.teleconsultaHabilitada ? "Sim" : "Não"}</Badge></TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Tenant */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Configurações do Tenant</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select defaultValue={empresa.config.timezone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">America/São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">America/Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Fortaleza">America/Fortaleza (GMT-3)</SelectItem>
                      <SelectItem value="America/Cuiaba">America/Cuiabá (GMT-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue={empresa.config.idioma}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select defaultValue={empresa.config.moeda}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <Select defaultValue={empresa.config.formatoData}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => toast.success("Configurações salvas!")}>Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Domínio & Acesso</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subdomínio</Label>
                  <div className="flex items-center gap-1">
                    <Input defaultValue={empresa.subdominio} className="flex-1" />
                    <span className="text-sm text-muted-foreground">.agend.me</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Domínio Personalizado (opcional)</Label>
                  <Input defaultValue={empresa.dominio} placeholder="agenda.suaclinica.com.br" />
                </div>
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>WhatsApp Hub</Label>
                    <Switch defaultChecked={empresa.limites.whatsappHabilitado} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Teleconsulta</Label>
                    <Switch defaultChecked={empresa.limites.teleconsultaHabilitada} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>IA Prontuário</Label>
                    <Switch defaultChecked={empresa.limites.usoIaHabilitado} />
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success("Domínio atualizado!")}>Salvar Domínio</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tenant */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logs do Tenant</CardTitle>
              <CardDescription>Registro de eventos e alterações desta empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantLogs.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{l.evento}</Badge></TableCell>
                      <TableCell>{l.descricao}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(l.data).toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ações */}
        <TabsContent value="acoes" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Gestão de Status</h3>
                <p className="text-sm text-muted-foreground">Controle o acesso desta empresa ao sistema</p>
                <div className="flex gap-2">
                  {status !== "suspensa" && status !== "cancelada" && (
                    <Button variant="destructive" size="sm" onClick={handleSuspend}>Suspender</Button>
                  )}
                  {(status === "suspensa" || status === "inadimplente") && (
                    <Button size="sm" onClick={handleReactivate}>Reativar</Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Plano</h3>
                <p className="text-sm text-muted-foreground">Altere o plano e limites do tenant</p>
                <Select defaultValue={empresa.plano}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Profissional">Profissional</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => toast.success("Plano atualizado!")}>Aplicar</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
