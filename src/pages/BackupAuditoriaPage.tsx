import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Database, Download, RotateCcw, Shield, Clock, HardDrive, AlertTriangle,
  CheckCircle2, XCircle, Search, FileText, Plus, Eye, Trash2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/use-relatorios";


// --- Mock Data ---
const backupsMock = [
  { id: "1", tipo: "automatico", escopo: "global", status: "concluido", tamanho: 245.8, data: "2024-06-30T02:00:00", arquivo: "backup_global_20240630.sql.gz" },
  { id: "2", tipo: "manual", escopo: "empresa", status: "concluido", tamanho: 48.2, data: "2024-06-29T14:30:00", arquivo: "backup_clinica_abc_20240629.sql.gz" },
  { id: "3", tipo: "automatico", escopo: "global", status: "concluido", tamanho: 244.1, data: "2024-06-29T02:00:00", arquivo: "backup_global_20240629.sql.gz" },
  { id: "4", tipo: "automatico", escopo: "global", status: "erro", tamanho: 0, data: "2024-06-28T02:00:00", arquivo: "" },
  { id: "5", tipo: "manual", escopo: "empresa", status: "concluido", tamanho: 52.7, data: "2024-06-27T10:15:00", arquivo: "backup_clinica_xyz_20240627.sql.gz" },
];

const restauracoesMock = [
  { id: "1", backup: "backup_global_20240625.sql.gz", usuario: "Admin SaaS", status: "concluido", inicio: "2024-06-26T08:00:00", fim: "2024-06-26T08:12:00" },
  { id: "2", backup: "backup_clinica_abc_20240620.sql.gz", usuario: "Dr. Carlos", status: "concluido", inicio: "2024-06-21T09:30:00", fim: "2024-06-21T09:35:00" },
];

const auditoriaLogsMock = [
  { id: "1", usuario: "Admin", modulo: "Pacientes", acao: "pacientes.criar", ip: "192.168.1.10", data: "2024-06-30T15:42:00", detalhe: "Criou paciente Maria Silva" },
  { id: "2", usuario: "Dr. Carlos", modulo: "Prontuário", acao: "prontuario.editar", ip: "192.168.1.15", data: "2024-06-30T14:30:00", detalhe: "Editou prontuário #4521" },
  { id: "3", usuario: "Recepção", modulo: "Agenda", acao: "agenda.criar", ip: "192.168.1.12", data: "2024-06-30T13:20:00", detalhe: "Criou agendamento para João Santos" },
  { id: "4", usuario: "Admin", modulo: "Financeiro", acao: "financeiro.editar", ip: "192.168.1.10", data: "2024-06-30T12:10:00", detalhe: "Registrou pagamento R$ 250" },
  { id: "5", usuario: "Admin", modulo: "Usuários", acao: "permissoes.editar", ip: "192.168.1.10", data: "2024-06-30T11:00:00", detalhe: "Alterou permissões de Recepção" },
  { id: "6", usuario: "Sistema", modulo: "Sistema", acao: "backup.automatico", ip: "127.0.0.1", data: "2024-06-30T02:00:00", detalhe: "Backup automático concluído" },
  { id: "7", usuario: "Dr. Ana", modulo: "Prontuário", acao: "prontuario.criar", ip: "192.168.1.18", data: "2024-06-29T16:45:00", detalhe: "Criou prontuário para Pedro Lima" },
  { id: "8", usuario: "Admin", modulo: "Configurações", acao: "configuracoes.editar", ip: "192.168.1.10", data: "2024-06-29T10:30:00", detalhe: "Alterou cores White Label" },
];

const verificacoesMock = [
  { id: "1", status: "sucesso", descricao: "Verificação de integridade - todas tabelas consistentes", data: "2024-06-30T03:00:00" },
  { id: "2", status: "sucesso", descricao: "Verificação de integridade - sem inconsistências", data: "2024-06-29T03:00:00" },
  { id: "3", status: "erro", descricao: "Tabela whatsapp_mensagens - 2 registros órfãos detectados", data: "2024-06-28T03:00:00" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    concluido: { variant: "default", label: "Concluído" },
    pendente: { variant: "secondary", label: "Pendente" },
    erro: { variant: "destructive", label: "Erro" },
    sucesso: { variant: "default", label: "Sucesso" },
  };
  const cfg = map[status] || { variant: "outline" as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export default function BackupAuditoriaPage() {
  const [searchAudit, setSearchAudit] = useState("");
  const [filterModulo, setFilterModulo] = useState("todos");
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  const { data: auditLogsReal = [], isLoading: loadingAudit } = useAuditLog(100, filterModulo !== "todos" ? filterModulo : undefined);

  // Use real logs if available, else fallback to mock for UI demonstration
  const logsSource = auditLogsReal.length > 0 ? auditLogsReal.map(l => ({
    id: l.id,
    usuario: l.user_id ? l.user_id.slice(0, 8) + "..." : "Sistema",
    modulo: l.tabela || l.origem || "sistema",
    acao: l.acao,
    detalhe: l.acao,
    ip: l.ip || "—",
    data: l.created_at,
  })) : auditoriaLogsMock;

  const filteredLogs = logsSource.filter(l => {
    const matchSearch = !searchAudit || l.detalhe.toLowerCase().includes(searchAudit.toLowerCase()) || l.usuario.toLowerCase().includes(searchAudit.toLowerCase());
    const matchModulo = filterModulo === "todos" || l.modulo.toLowerCase() === filterModulo.toLowerCase();
    return matchSearch && matchModulo;
  });


  const handleBackupManual = () => {
    toast.success("Backup manual iniciado com sucesso!");
  };

  const handleRestore = () => {
    setRestoreDialog(false);
    toast.success("Restauração iniciada. Você será notificado ao concluir.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backup & Auditoria</h1>
          <p className="text-sm text-muted-foreground">Proteção de dados e rastreabilidade de ações</p>
        </div>
        <Button onClick={handleBackupManual}><Plus className="h-4 w-4 mr-1" /> Backup Manual</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Backups Realizados", value: "127", icon: Database, desc: "Últimos 30 dias" },
          { title: "Último Backup", value: "Hoje 02:00", icon: Clock, desc: "Automático - Global" },
          { title: "Armazenamento", value: "12.4 GB", icon: HardDrive, desc: "Total utilizado" },
          { title: "Logs Registrados", value: String(auditLogsReal.length || "—"), icon: Shield, desc: "Últimos 30 dias" },
        ].map(k => (

          <Card key={k.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{k.title}</p>
                  <p className="text-2xl font-bold text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.desc}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <k.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="restauracoes">Restaurações</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          <TabsTrigger value="politicas">Políticas</TabsTrigger>
          <TabsTrigger value="integridade">Integridade</TabsTrigger>
        </TabsList>

        {/* Backups */}
        <TabsContent value="backups">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Histórico de Backups</CardTitle>
              <CardDescription>Backups automáticos e manuais do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Escopo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupsMock.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{b.tipo}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{b.escopo}</TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell>{b.tamanho > 0 ? `${b.tamanho} MB` : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(b.data).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {b.status === "concluido" && (
                          <>
                            <Button size="sm" variant="ghost" title="Download"><Download className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" title="Restaurar" onClick={() => { setSelectedBackup(b.arquivo); setRestoreDialog(true); }}>
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurações */}
        <TabsContent value="restauracoes">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Histórico de Restaurações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Backup</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restauracoesMock.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm">{r.backup}</TableCell>
                      <TableCell>{r.usuario}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{new Date(r.inicio).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(r.fim).toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auditoria */}
        <TabsContent value="auditoria" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar ação ou usuário..." value={searchAudit} onChange={e => setSearchAudit(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterModulo} onValueChange={setFilterModulo}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Módulos</SelectItem>
                <SelectItem value="pacientes">Pacientes</SelectItem>
                <SelectItem value="prontuário">Prontuário</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="usuários">Usuários</SelectItem>
                <SelectItem value="configurações">Configurações</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhe</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.usuario}</TableCell>
                      <TableCell><Badge variant="outline">{l.modulo}</Badge></TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{l.acao}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{l.detalhe}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{l.ip}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(l.data).toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Políticas */}
        <TabsContent value="politicas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Política de Backup Automático</CardTitle>
                <CardDescription>Configure a frequência e retenção dos backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select defaultValue="diario">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário de Execução</Label>
                  <Input type="time" defaultValue="02:00" />
                </div>
                <div className="space-y-2">
                  <Label>Retenção (dias)</Label>
                  <Input type="number" defaultValue={30} min={7} max={365} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Backup Ativo</Label>
                  <Switch defaultChecked />
                </div>
                <Button className="w-full" onClick={() => toast.success("Política salva!")}>Salvar Política</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo da Política Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Frequência", value: "Diário" },
                  { label: "Horário", value: "02:00 AM" },
                  { label: "Retenção", value: "30 dias" },
                  { label: "Status", value: "Ativo" },
                  { label: "Próximo backup", value: "Amanhã 02:00" },
                  { label: "Espaço estimado", value: "~250 MB/backup" },
                ].map(i => (
                  <div key={i.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{i.label}</span>
                    <span className="font-medium text-foreground">{i.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integridade */}
        <TabsContent value="integridade" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-foreground">Verificações de Integridade</h3>
              <p className="text-sm text-muted-foreground">Monitoramento automático de consistência dos dados</p>
            </div>
            <Button variant="outline" onClick={() => toast.success("Verificação iniciada...")}><RefreshCw className="h-4 w-4 mr-1" /> Verificar Agora</Button>
          </div>

          <div className="space-y-3">
            {verificacoesMock.map(v => (
              <Card key={v.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  {v.status === "sucesso" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{v.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(v.data).toLocaleString("pt-BR")}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Restore confirmation dialog */}
      <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Restauração</DialogTitle>
            <DialogDescription>
              Esta ação irá restaurar o sistema ao estado do backup selecionado. Dados atuais podem ser sobrescritos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Atenção: Ação irreversível</p>
                <p className="text-xs text-muted-foreground mt-1">Arquivo: {selectedBackup}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRestore}>Confirmar Restauração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
