import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Users, Search, Plus, Save, ChevronRight,
  ShieldCheck, ShieldAlert, Activity, UserCheck, Settings,
  Calendar, DollarSign, MessageCircle, Briefcase, Stethoscope,
  LayoutDashboard, CalendarOff, Globe
} from "lucide-react";
import { useUsuarios, useAllUserRoles, useUpdateUserRole, AppRole } from "@/hooks/use-usuarios";


/* ───── tipos ───── */
interface Permissao {
  id: string;
  nome: string;
  modulo: string;
  descricao: string;
}

interface Role {
  id: string;
  nome: string;
  descricao: string;
  permissoes: string[]; // permissao IDs
  isDefault?: boolean;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  roleId: string;
  permissoesIndividuais: { permissaoId: string; permitido: boolean }[];
  ativo: boolean;
}

interface LogAcesso {
  id: string;
  usuario: string;
  acao: string;
  modulo: string;
  dataHora: string;
  ip: string;
  resultado: "permitido" | "negado";
}

/* ───── tipo local ───── */
type UsuarioLocal = Usuario;

/* ───── Mock: ações RBAC ───── */
const acoesMock = ["visualizar", "criar", "editar", "excluir"];

/* ───── Mock: módulos do sistema ───── */
const modulosMock = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "agenda", label: "Agenda", icon: Calendar },
  { key: "ausencias", label: "Ausências", icon: CalendarOff },
  { key: "pacientes", label: "Pacientes", icon: Users },
  { key: "servicos", label: "Serviços", icon: Briefcase },
  { key: "prontuario", label: "Prontuário", icon: Stethoscope },
  { key: "financeiro", label: "Financeiro", icon: DollarSign },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "configuracoes", label: "Configurações", icon: Settings },
];

/* ───── Permissões derivadas (módulo × ação) ───── */
const allPermissoes: Permissao[] = modulosMock.flatMap((mod) =>
  acoesMock.map((acao) => ({
    id: `${mod.key}.${acao}`,
    nome: `${mod.key}.${acao}`,
    modulo: mod.key,
    descricao: `${acao} em ${mod.label}`,
  }))
);

/* ───── Mock: perfis de acesso padrão ───── */
const defaultRoles: Role[] = [
  {
    id: "admin",
    nome: "Administrador",
    descricao: "Acesso total ao sistema",
    permissoes: allPermissoes.map((p) => p.id),
    isDefault: true,
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Acesso à agenda, prontuário e pacientes",
    permissoes: allPermissoes
      .filter((p) => ["agenda", "prontuario", "pacientes", "dashboard"].includes(p.modulo))
      .map((p) => p.id),
    isDefault: true,
  },
  {
    id: "recepcionista",
    nome: "Recepcionista",
    descricao: "Acesso à agenda e pacientes",
    permissoes: allPermissoes
      .filter((p) =>
        ["agenda", "pacientes", "dashboard"].includes(p.modulo) &&
        ["visualizar", "criar", "editar"].includes(p.nome.split(".")[1])
      )
      .map((p) => p.id),
    isDefault: true,
  },
];

/* ─────────────────── COMPONENTE PRINCIPAL ─────────────────── */
const UsuariosPermissoesPage = () => {
  const { data: usuariosDB = [], isLoading: loadingUsers } = useUsuarios();
  const { data: rolesDB = [], isLoading: loadingRoles } = useAllUserRoles();
  const updateRole = useUpdateUserRole();

  // Build usuarios list with role data
  const usuarios: UsuarioLocal[] = useMemo(() => usuariosDB.map((u) => {
    const userRole = rolesDB.find((r) => r.user_id === u.id);
    return {
      id: u.id,
      nome: u.nome || u.email || "—",
      email: u.email || "",
      roleId: userRole?.role || "profissional",
      permissoesIndividuais: [],
      ativo: true,
    };
  }), [usuariosDB, rolesDB]);

  // Roles state (initialized from defaults, editable in UI)
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  // Empty access logs — would come from audit_log table (Épico 1.4)
  const logs: LogAcesso[] = [];

  const [activeTab, setActiveTab] = useState("perfis");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [logFilter, setLogFilter] = useState("all");

  /* dialogs */
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const handleCreateRole = () => {
    if (!newRoleName) return;
    const novo: Role = { id: Date.now().toString(), nome: newRoleName, descricao: newRoleDesc, permissoes: [] };
    setRoles(prev => [...prev, novo]);
    setShowNewRole(false);
    setNewRoleName("");
    setNewRoleDesc("");
    setSelectedRoleId(novo.id);
    setActiveTab("perfis");
  };

  const toggleRolePermission = (roleId: string, permId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const has = r.permissoes.includes(permId);
      return { ...r, permissoes: has ? r.permissoes.filter(p => p !== permId) : [...r.permissoes, permId] };
    }));
  };

  const toggleAllModulePerms = (roleId: string, modulo: string, checked: boolean) => {
    const modulePerms = allPermissoes.filter(p => p.modulo === modulo).map(p => p.id);
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      if (checked) {
        return { ...r, permissoes: [...new Set([...r.permissoes, ...modulePerms])] };
      }
      return { ...r, permissoes: r.permissoes.filter(p => !modulePerms.includes(p)) };
    }));
  };

  const changeUserRole = (userId: string, roleId: string) => {
    updateRole.mutate({ userId, role: roleId as AppRole });
  };


  // Individual permissions (future: persist to DB in Épico 1.4)
  const [localPerms, setLocalPerms] = useState<Record<string, { permissaoId: string; permitido: boolean }[]>>({});

  const toggleUserIndividual = (userId: string, permId: string) => {
    setLocalPerms(prev => {
      const existing = (prev[userId] || []).find(p => p.permissaoId === permId);
      const cur = prev[userId] || [];
      return {
        ...prev,
        [userId]: existing
          ? cur.filter(p => p.permissaoId !== permId)
          : [...cur, { permissaoId: permId, permitido: true }],
      };
    });
  };

  const toggleUserActive = (_userId: string) => {
    // Disable/enable user would go through Supabase Auth admin (Épico 1.4)
  };


  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const selectedUser = usuarios.find(u => u.id === selectedUserId);

  const stats = {
    totalUsers: usuarios.length,
    activeUsers: usuarios.filter(u => u.ativo).length,
    totalRoles: roles.length,
    denied: logs.filter(l => l.resultado === "negado").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Permissões & Usuários
          </h1>
          <p className="text-muted-foreground text-sm">Controle de acesso baseado em funções (RBAC)</p>
        </div>
        <Dialog open={showNewRole} onOpenChange={setShowNewRole}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Perfil</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Perfil de Acesso</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Nome do Perfil</Label><Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Ex: Gerente" /></div>
              <div><Label>Descrição</Label><Input value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="Descrição do perfil..." /></div>
              <Button onClick={handleCreateRole} className="w-full">Criar Perfil</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Usuários", value: stats.totalUsers, icon: Users, color: "text-primary" },
          { label: "Ativos", value: stats.activeUsers, icon: UserCheck, color: "text-success" },
          { label: "Perfis", value: stats.totalRoles, icon: ShieldCheck, color: "text-primary" },
          { label: "Acessos Negados", value: stats.denied, icon: ShieldAlert, color: "text-destructive" },
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
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelectedRoleId(null); setSelectedUserId(null); }}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="perfis" className="gap-1 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Perfis</TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" /> Usuários</TabsTrigger>
          <TabsTrigger value="matriz" className="gap-1 text-xs"><Globe className="h-3.5 w-3.5" /> Matriz</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1 text-xs"><Activity className="h-3.5 w-3.5" /> Logs</TabsTrigger>
        </TabsList>

        {/* ─── PERFIS ─── */}
        <TabsContent value="perfis" className="mt-4">
          {!selectedRole ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => {
                const userCount = usuarios.filter(u => u.roleId === role.id).length;
                return (
                  <Card key={role.id} className="cursor-pointer hover:shadow-md transition-all border-border" onClick={() => setSelectedRoleId(role.id)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        {role.isDefault && <Badge variant="outline" className="text-[10px]">Padrão</Badge>}
                      </div>
                      <h3 className="font-semibold text-foreground">{role.nome}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{role.descricao}</p>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{role.permissoes.length} permissões</span>
                        <span>{userCount} usuário{userCount !== 1 ? "s" : ""}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <RolePermissionsEditor
              role={selectedRole}
              onBack={() => setSelectedRoleId(null)}
              onToggle={(permId) => toggleRolePermission(selectedRole.id, permId)}
              onToggleModule={(mod, checked) => toggleAllModulePerms(selectedRole.id, mod, checked)}
              allPermissoes={allPermissoes}
            />
          )}
        </TabsContent>

        {/* ─── USUÁRIOS ─── */}
        <TabsContent value="usuarios" className="mt-4 space-y-4">
          {!selectedUser ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar usuário..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                {usuarios
                  .filter(u => !searchTerm || u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(u => {
                    const role = roles.find(r => r.id === u.roleId);
                    return (
                      <Card key={u.id} className="cursor-pointer hover:shadow-md transition-all border-border" onClick={() => setSelectedUserId(u.id)}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{u.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{u.nome}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs gap-1">
                              <Shield className="h-3 w-3" /> {role?.nome}
                            </Badge>
                            {u.permissoesIndividuais.length > 0 && (
                              <Badge className="text-[10px] bg-warning/15 text-warning border-warning/30">+{u.permissoesIndividuais.length} individual</Badge>
                            )}
                            <Badge className={`text-xs ${u.ativo ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}`}>
                              {u.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </>
          ) : (
            <UserPermissionsEditor
              user={selectedUser}
              roles={roles}
              allPermissoes={allPermissoes}
              onBack={() => setSelectedUserId(null)}
              onChangeRole={roleId => changeUserRole(selectedUser.id, roleId)}
              onToggleIndividual={permId => toggleUserIndividual(selectedUser.id, permId)}
              onToggleActive={() => toggleUserActive(selectedUser.id)}
            />
          )}
        </TabsContent>

        {/* ─── MATRIZ ─── */}
        <TabsContent value="matriz" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Matriz de Permissões por Perfil</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Módulo / Ação</th>
                    {roles.map(r => (
                      <th key={r.id} className="text-center py-2 px-2 text-muted-foreground font-medium min-w-[100px]">{r.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modulosMock.map(mod => (
                    <>
                      <tr key={mod.key} className="bg-muted/30">
                        <td colSpan={roles.length + 1} className="py-2 px-3 font-semibold text-foreground flex items-center gap-2">
                          <mod.icon className="h-3.5 w-3.5 text-primary" /> {mod.label}
                        </td>
                      </tr>
                      {acoesMock.map(acao => {
                        const permId = `${mod.key}.${acao}`;
                        return (
                          <tr key={permId} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-1.5 px-3 pl-8 text-muted-foreground capitalize">{acao}</td>
                            {roles.map(r => (
                              <td key={r.id} className="text-center py-1.5 px-2">
                                {r.permissoes.includes(permId) ? (
                                  <ShieldCheck className="h-4 w-4 text-success mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground/30">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── LOGS ─── */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar nos logs..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Select value={logFilter} onValueChange={setLogFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="permitido">Permitidos</SelectItem>
                    <SelectItem value="negado">Negados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Usuário</th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Ação</th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Módulo</th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">IP</th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs
                      .filter(l => logFilter === "all" || l.resultado === logFilter)
                      .filter(l => !searchTerm || l.usuario.toLowerCase().includes(searchTerm.toLowerCase()) || l.acao.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(l => (
                        <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-2.5 px-4 font-medium text-foreground">{l.usuario}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{l.acao}</td>
                          <td className="py-2.5 px-4">
                            <Badge variant="outline" className="text-[10px] capitalize">{l.modulo}</Badge>
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground text-xs">{l.dataHora}</td>
                          <td className="py-2.5 px-4 text-muted-foreground text-xs font-mono">{l.ip}</td>
                          <td className="py-2.5 px-4">
                            <Badge className={`text-[10px] capitalize ${l.resultado === "permitido" ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>
                              {l.resultado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ═══ Editor de Permissões do Perfil ═══ */
interface RoleEditorProps {
  role: Role;
  onBack: () => void;
  onToggle: (permId: string) => void;
  onToggleModule: (mod: string, checked: boolean) => void;
  allPermissoes: Permissao[];
}

const RolePermissionsEditor = ({ role, onBack, onToggle, onToggleModule, allPermissoes }: RoleEditorProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>← Voltar</Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> {role.nome}
          </h2>
          <p className="text-xs text-muted-foreground">{role.descricao} • {role.permissoes.length} permissões ativas</p>
        </div>
      </div>
      <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modulosMock.map(mod => {
        const modulePerms = allPermissoes.filter(p => p.modulo === mod.key);
        const activeCount = modulePerms.filter(p => role.permissoes.includes(p.id)).length;
        const allActive = activeCount === modulePerms.length;
        return (
          <Card key={mod.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <mod.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                    <p className="text-[10px] text-muted-foreground">{activeCount}/{modulePerms.length} ativas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Todas</span>
                  <Switch checked={allActive} onCheckedChange={checked => onToggleModule(mod.key, checked)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {modulePerms.map(perm => (
                  <label key={perm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                    <Checkbox checked={role.permissoes.includes(perm.id)} onCheckedChange={() => onToggle(perm.id)} />
                    <span className="text-xs text-foreground capitalize">{perm.nome.split(".")[1]}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

/* ═══ Editor de Permissões do Usuário ═══ */
interface UserEditorProps {
  user: Usuario;
  roles: Role[];
  allPermissoes: Permissao[];
  onBack: () => void;
  onChangeRole: (roleId: string) => void;
  onToggleIndividual: (permId: string) => void;
  onToggleActive: () => void;
}

const UserPermissionsEditor = ({ user, roles, allPermissoes, onBack, onChangeRole, onToggleIndividual, onToggleActive }: UserEditorProps) => {
  const userRole = roles.find(r => r.id === user.roleId);
  const effectivePerms = new Set([
    ...(userRole?.permissoes || []),
    ...user.permissoesIndividuais.filter(p => p.permitido).map(p => p.permissaoId),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>← Voltar</Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{user.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{user.nome}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ativo</span>
            <Switch checked={user.ativo} onCheckedChange={onToggleActive} />
          </div>
          <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
        </div>
      </div>

      {/* Role selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium whitespace-nowrap">Perfil de Acesso</Label>
            <Select value={user.roleId} onValueChange={onChangeRole}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex-1">Permissões herdadas do perfil. Permissões individuais sobrescrevem o perfil.</p>
          </div>
        </CardContent>
      </Card>

      {/* Permissions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modulosMock.map(mod => {
          const modulePerms = allPermissoes.filter(p => p.modulo === mod.key);
          return (
            <Card key={mod.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <mod.icon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {modulePerms.map(perm => {
                    const fromRole = userRole?.permissoes.includes(perm.id) || false;
                    const individual = user.permissoesIndividuais.find(p => p.permissaoId === perm.id);
                    const effective = individual ? individual.permitido : fromRole;
                    return (
                      <label key={perm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                        <Checkbox checked={effective} onCheckedChange={() => onToggleIndividual(perm.id)} />
                        <span className="text-xs text-foreground capitalize">{perm.nome.split(".")[1]}</span>
                        {individual && <Badge className="text-[8px] bg-warning/15 text-warning border-warning/30 px-1">ind.</Badge>}
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UsuariosPermissoesPage;
