import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Zap, Activity, Clock, HardDrive, RefreshCw, Trash2, Search, Target,
  ArrowUpRight, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { globalCache } from "@/lib/cache";

// Seed some demo data
function seedDemoCache() {
  if (globalCache.getEntries().length > 0) return;
  const items: Array<[string, unknown, number]> = [
    ["permissoes:admin", { roles: ["admin"], modules: ["*"] }, 3600],
    ["configuracoes:whitelabel:e1", { corPrimaria: "#0A74DA", logo: "logo.png" }, 7200],
    ["dashboards:financeiro:e1", { receita: 42500, despesas: 18200 }, 300],
    ["pacientes:lista:e1", [{ id: "p1", nome: "Maria" }, { id: "p2", nome: "João" }], 600],
    ["servicos:lista:e1", [{ id: "s1", nome: "Consulta" }], 900],
    ["sessoes:user:admin", { userId: "u1", lastAccess: Date.now() }, 1800],
    ["agenda:slots:prof1:2026-03-21", { slots: 12, ocupados: 8 }, 120],
    ["api:uazapi:status", { connected: true }, 300],
  ];
  items.forEach(([k, v, t]) => globalCache.set(k, v, t));
  // Simulate some hits/misses
  for (let i = 0; i < 847; i++) globalCache.get("permissoes:admin");
  for (let i = 0; i < 153; i++) globalCache.get("nonexistent:" + i);
}

export default function SaasCachePage() {
  const [, setTick] = useState(0);
  const [searchKey, setSearchKey] = useState("");
  const [invalidateKey, setInvalidateKey] = useState("");

  useEffect(() => {
    seedDemoCache();
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics = globalCache.getMetrics();
  const hitRate = globalCache.getHitRate();
  const entries = globalCache.getEntries();
  const logs = globalCache.getInvalidationLogs();
  const moduleConfig = globalCache.getModuleConfig();

  const filteredEntries = entries.filter(e =>
    !searchKey || e.key.toLowerCase().includes(searchKey.toLowerCase())
  );

  const handleInvalidate = () => {
    if (!invalidateKey.trim()) return;
    const removed = globalCache.invalidate(invalidateKey.trim(), "manual_ui");
    if (removed) toast.success(`Cache "${invalidateKey}" invalidado`);
    else toast.error("Chave não encontrada");
    setInvalidateKey("");
    setTick(t => t + 1);
  };

  const handleClearAll = () => {
    globalCache.clearAll("manual_clear_all");
    toast.success("Todo o cache foi limpo");
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cache Global</h1>
          <p className="text-sm text-muted-foreground">Monitoramento e gestão do sistema de cache</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTick(t => t + 1)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-1" /> Limpar Tudo
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Hit Rate", value: `${hitRate}%`, icon: Target, desc: `${metrics.hits.toLocaleString()} hits` },
          { title: "Entradas Ativas", value: metrics.totalEntries.toString(), icon: HardDrive, desc: `~${metrics.memoryEstimateKb} KB` },
          { title: "Cache Hits", value: metrics.hits.toLocaleString(), icon: Zap, desc: "Total acumulado" },
          { title: "Cache Miss", value: metrics.misses.toLocaleString(), icon: Activity, desc: `${metrics.invalidations} invalidações` },
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

      <Tabs defaultValue="entradas" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="invalidar">Invalidar</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Entradas */}
        <TabsContent value="entradas" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filtrar por chave..." value={searchKey} onChange={e => setSearchKey(e.target.value)} className="pl-9" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>Tempo Restante</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map(e => {
                    const remaining = Math.max(0, Math.round((e.expiresAt - Date.now()) / 1000));
                    const pct = Math.round((remaining / e.ttl) * 100);
                    return (
                      <TableRow key={e.key}>
                        <TableCell className="font-mono text-xs">{e.key}</TableCell>
                        <TableCell className="text-muted-foreground">{e.ttl}s</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">{remaining}s</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => { globalCache.invalidate(e.key, "manual_ui"); setTick(t => t + 1); toast.success("Removido"); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredEntries.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma entrada encontrada</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuração */}
        <TabsContent value="config">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">TTL por Módulo</CardTitle>
              <CardDescription>Configure o tempo de expiração padrão para cada módulo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>TTL Padrão (s)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moduleConfig.map(m => (
                    <TableRow key={m.module}>
                      <TableCell className="capitalize font-medium">{m.module}</TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={m.ttl} className="w-24 h-8" onBlur={e => {
                          globalCache.setModuleConfig(m.module, parseInt(e.target.value) || m.ttl, m.active);
                          setTick(t => t + 1);
                        }} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.active ? "default" : "secondary"}>{m.active ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch checked={m.active} onCheckedChange={active => {
                          globalCache.setModuleConfig(m.module, m.ttl, active);
                          setTick(t => t + 1);
                          toast.success(`Cache ${m.module} ${active ? "ativado" : "desativado"}`);
                        }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invalidar */}
        <TabsContent value="invalidar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invalidar Cache</CardTitle>
              <CardDescription>Remova entradas específicas ou por módulo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Chave do cache (ex: pacientes:lista:e1)" value={invalidateKey} onChange={e => setInvalidateKey(e.target.value)} className="flex-1" />
                <Button onClick={handleInvalidate}>Invalidar</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["permissoes", "configuracoes", "dashboards", "pacientes", "servicos", "sessoes", "agenda", "api"].map(mod => (
                  <Button key={mod} variant="outline" size="sm" className="capitalize" onClick={() => {
                    const count = globalCache.invalidateByPrefix(mod + ":");
                    toast.success(`${count} entradas de "${mod}" invalidadas`);
                    setTick(t => t + 1);
                  }}>
                    {mod}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logs de Invalidação</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(-20).reverse().map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{l.key}</TableCell>
                      <TableCell><Badge variant="outline">{l.reason}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{new Date(l.timestamp).toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhuma invalidação registrada</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
