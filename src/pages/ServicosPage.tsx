import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2,
  Clock, Users, FolderOpen, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useServicos, useCategorias, useCreateServico, useUpdateServico } from "@/hooks/use-servicos";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";

// ── Hooks for categories and profissional_servicos ──

function useCreateCategoria() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();
  return useMutation({
    mutationFn: async (cat: { nome: string; descricao?: string }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("categorias_servicos")
        .insert({ ...cat, empresa_id: empresaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias_servicos"] });
      toast({ title: "Categoria criada!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; nome?: string; descricao?: string }) => {
      const { data, error } = await supabase
        .from("categorias_servicos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias_servicos"] });
      toast({ title: "Categoria atualizada!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_servicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias_servicos"] });
      toast({ title: "Categoria removida!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });
}

function useDeleteServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("servicos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      toast({ title: "Serviço removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });
}

function useProfissionais() {
  const empresaId = useEmpresaId();
  return useQuery({
    queryKey: ["profissionais", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("profissionais_clinica")
        .select("id, nome, avatar_url, ativo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

function useProfissionalServicos(servicoId?: string) {
  return useQuery({
    queryKey: ["profissional_servicos", servicoId],
    queryFn: async () => {
      if (!servicoId) return [];
      const { data, error } = await supabase
        .from("profissional_servicos")
        .select("*")
        .eq("servico_id", servicoId);
      if (error) throw error;
      return data;
    },
    enabled: !!servicoId,
  });
}

function useSyncProfissionalServicos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ servicoId, vinculos }: {
      servicoId: string;
      vinculos: { profissional_id: string; preco_customizado?: number | null; duracao_customizada?: number | null }[];
    }) => {
      // Delete all existing then insert new
      await supabase.from("profissional_servicos").delete().eq("servico_id", servicoId);
      if (vinculos.length > 0) {
        const rows = vinculos.map((v) => ({ ...v, servico_id: servicoId }));
        const { error } = await supabase.from("profissional_servicos").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissional_servicos"] });
    },
  });
}

// ── Main Component ──

const ServicosPage = () => {
  const { data: categorias, isLoading: loadingCats } = useCategorias();
  const { data: servicos, isLoading: loadingServicos } = useServicos();
  const { data: profissionais } = useProfissionais();
  const createServico = useCreateServico();
  const updateServico = useUpdateServico();
  const deleteServico = useDeleteServico();
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const deleteCategoria = useDeleteCategoria();
  const syncVinculos = useSyncProfissionalServicos();

  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ nome: "", descricao: "" });

  // Service dialog
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);
  const [svcTab, setSvcTab] = useState("geral");

  // Service form state
  const [svcForm, setSvcForm] = useState({
    categoria_id: "", nome: "", descricao: "", duracao_minutos: 30, preco_base: 0,
    ativo: true, permite_agendamento_online: true,
  });

  // Profissional vinculos for service dialog
  const [vinculos, setVinculos] = useState<
    { profissional_id: string; preco_customizado?: number | null; duracao_customizada?: number | null }[]
  >([]);

  const isLoading = loadingCats || loadingServicos;

  // Auto-expand all categories on first load
  const catIds = useMemo(() => categorias?.map((c) => c.id) || [], [categorias]);
  if (expandedCats.size === 0 && catIds.length > 0) {
    setExpandedCats(new Set(catIds));
  }

  // ── Category handlers ──
  const openNewCat = () => {
    setEditingCatId(null);
    setCatForm({ nome: "", descricao: "" });
    setCatDialogOpen(true);
  };
  const openEditCat = (cat: NonNullable<typeof categorias>[0]) => {
    setEditingCatId(cat.id);
    setCatForm({ nome: cat.nome, descricao: cat.descricao || "" });
    setCatDialogOpen(true);
  };
  const saveCat = () => {
    if (!catForm.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (editingCatId) {
      updateCategoria.mutate({ id: editingCatId, ...catForm }, { onSuccess: () => setCatDialogOpen(false) });
    } else {
      createCategoria.mutate(catForm, { onSuccess: () => setCatDialogOpen(false) });
    }
  };
  const handleDeleteCat = (id: string) => {
    const hasServices = (servicos || []).some((s) => s.categoria_id === id);
    if (hasServices) {
      toast({ title: "Categoria possui serviços", description: "Remova os serviços primeiro.", variant: "destructive" });
      return;
    }
    deleteCategoria.mutate(id);
  };

  // ── Service handlers ──
  const openNewSvc = (catId?: string) => {
    setEditingSvcId(null);
    setSvcForm({
      categoria_id: catId || categorias?.[0]?.id || "", nome: "", descricao: "",
      duracao_minutos: 30, preco_base: 0, ativo: true, permite_agendamento_online: true,
    });
    setVinculos([]);
    setSvcTab("geral");
    setSvcDialogOpen(true);
  };
  const openEditSvc = async (svc: NonNullable<typeof servicos>[0]) => {
    setEditingSvcId(svc.id);
    setSvcForm({
      categoria_id: svc.categoria_id || "",
      nome: svc.nome,
      descricao: svc.descricao || "",
      duracao_minutos: svc.duracao_minutos,
      preco_base: Number(svc.preco_base) || 0,
      ativo: svc.ativo ?? true,
      permite_agendamento_online: svc.permite_agendamento_online ?? true,
    });
    // Load existing vinculos
    const { data } = await supabase
      .from("profissional_servicos")
      .select("profissional_id, preco_customizado, duracao_customizada")
      .eq("servico_id", svc.id);
    setVinculos(
      (data || []).map((v) => ({
        profissional_id: v.profissional_id,
        preco_customizado: v.preco_customizado ? Number(v.preco_customizado) : null,
        duracao_customizada: v.duracao_customizada,
      }))
    );
    setSvcTab("geral");
    setSvcDialogOpen(true);
  };
  const saveSvc = () => {
    if (!svcForm.nome.trim() || !svcForm.categoria_id) {
      toast({ title: "Preencha nome e categoria", variant: "destructive" });
      return;
    }
    if (svcForm.preco_base <= 0 || svcForm.duracao_minutos <= 0) {
      toast({ title: "Preço e duração devem ser maiores que zero", variant: "destructive" });
      return;
    }
    if (editingSvcId) {
      updateServico.mutate(
        { id: editingSvcId, ...svcForm },
        {
          onSuccess: () => {
            syncVinculos.mutate({ servicoId: editingSvcId, vinculos });
            setSvcDialogOpen(false);
          },
        }
      );
    } else {
      createServico.mutate(svcForm, {
        onSuccess: (newSvc) => {
          if (newSvc && vinculos.length > 0) {
            syncVinculos.mutate({ servicoId: newSvc.id, vinculos });
          }
          setSvcDialogOpen(false);
        },
      });
    }
  };

  // ── Professional handlers ──
  const toggleProfissional = (profId: string) => {
    setVinculos((prev) => {
      const exists = prev.find((p) => p.profissional_id === profId);
      if (exists) return prev.filter((p) => p.profissional_id !== profId);
      return [...prev, { profissional_id: profId }];
    });
  };
  const updateProfField = (profId: string, field: "preco_customizado" | "duracao_customizada", value: number | null) => {
    setVinculos((prev) =>
      prev.map((p) => (p.profissional_id === profId ? { ...p, [field]: value } : p))
    );
  };

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const totalServicos = servicos?.length || 0;
  const totalAtivos = servicos?.filter((s) => s.ativo).length || 0;
  const totalOnline = servicos?.filter((s) => s.permite_agendamento_online).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm">Gerencie categorias e serviços da clínica</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={openNewCat}>
            <FolderOpen className="h-4 w-4" />
            Nova Categoria
          </Button>
          <Button className="gap-2" onClick={() => openNewSvc()}>
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Categorias</p>
          <p className="text-2xl font-bold text-foreground">{categorias?.length || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Serviços</p>
          <p className="text-2xl font-bold text-foreground">{totalServicos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-primary">{totalAtivos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Agend. Online</p>
          <p className="text-2xl font-bold text-foreground">{totalOnline}</p>
        </Card>
      </div>

      {/* Categories + Services */}
      <div className="space-y-4">
        {(categorias || []).map((cat) => {
          const catServicos = (servicos || []).filter((s) => s.categoria_id === cat.id);
          const isExpanded = expandedCats.has(cat.id);
          return (
            <Card key={cat.id} className="animate-fade-in overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleCat(cat.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{cat.nome}</h3>
                    {cat.descricao && <p className="text-xs text-muted-foreground">{cat.descricao}</p>}
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">{catServicos.length} serviço{catServicos.length !== 1 ? "s" : ""}</Badge>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openNewSvc(cat.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCat(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCat(cat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {isExpanded && catServicos.length > 0 && (
                <CardContent className="pt-0 pb-3 px-5">
                  <div className="space-y-2">
                    {catServicos.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{svc.nome}</p>
                              {!svc.permite_agendamento_online && (
                                <Badge variant="outline" className="text-[10px] border-warning text-warning shrink-0">Só presencial</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {svc.duracao_minutos}min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold text-foreground">R$ {Number(svc.preco_base || 0).toFixed(2)}</span>
                          <Switch
                            checked={svc.ativo ?? true}
                            onCheckedChange={(v) => updateServico.mutate({ id: svc.id, ativo: v })}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEditSvc(svc)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteServico.mutate(svc.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
              {isExpanded && catServicos.length === 0 && (
                <CardContent className="pt-0 pb-4 px-5">
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum serviço nesta categoria</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Category Dialog ── */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCatId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome *</Label>
              <Input value={catForm.nome} onChange={(e) => setCatForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Ex: Estética Facial" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={catForm.descricao} onChange={(e) => setCatForm((p) => ({ ...p, descricao: e.target.value }))} placeholder="Breve descrição da categoria" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveCat} disabled={createCategoria.isPending || updateCategoria.isPending}>
              {editingCatId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Service Dialog ── */}
      <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSvcId ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>

          <Tabs value={svcTab} onValueChange={setSvcTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
              <TabsTrigger value="orientacoes">Opções</TabsTrigger>
            </TabsList>

            {/* Tab: Geral */}
            <TabsContent value="geral" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={svcForm.nome} onChange={(e) => setSvcForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Ex: Limpeza de Pele" />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select value={svcForm.categoria_id} onValueChange={(v) => setSvcForm((p) => ({ ...p, categoria_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {(categorias || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={svcForm.descricao} onChange={(e) => setSvcForm((p) => ({ ...p, descricao: e.target.value }))} placeholder="Descrição do serviço" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duração (min) *</Label>
                  <Input type="number" min={1} value={svcForm.duracao_minutos} onChange={(e) => setSvcForm((p) => ({ ...p, duracao_minutos: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Preço base (R$) *</Label>
                  <Input type="number" min={0} step={0.01} value={svcForm.preco_base} onChange={(e) => setSvcForm((p) => ({ ...p, preco_base: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Profissionais */}
            <TabsContent value="profissionais" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Vincule profissionais e defina tempos e preços diferenciados.
              </p>
              <div className="space-y-3">
                {(profissionais || []).map((prof) => {
                  const vinculado = vinculos.find((p) => p.profissional_id === prof.id);
                  const isLinked = !!vinculado;
                  return (
                    <div key={prof.id} className={cn("rounded-xl border p-4 transition-all", isLinked ? "border-primary/40 bg-primary/5" : "border-border")}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-xs">
                              {prof.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{prof.nome}</span>
                        </div>
                        <Switch checked={isLinked} onCheckedChange={() => toggleProfissional(prof.id)} />
                      </div>
                      {isLinked && (
                        <div className="grid grid-cols-2 gap-3 mt-3 pl-[52px]">
                          <div>
                            <Label className="text-xs">Preço personalizado (R$)</Label>
                            <Input
                              type="number" min={0} step={0.01}
                              placeholder={`Padrão: ${svcForm.preco_base.toFixed(2)}`}
                              value={vinculado?.preco_customizado ?? ""}
                              onChange={(e) => updateProfField(prof.id, "preco_customizado", e.target.value ? parseFloat(e.target.value) : null)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Duração personalizada (min)</Label>
                            <Input
                              type="number" min={1}
                              placeholder={`Padrão: ${svcForm.duracao_minutos}`}
                              value={vinculado?.duracao_customizada ?? ""}
                              onChange={(e) => updateProfField(prof.id, "duracao_customizada", e.target.value ? parseInt(e.target.value) : null)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab: Opções */}
            <TabsContent value="orientacoes" className="space-y-4 mt-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Serviço ativo</p>
                  <p className="text-xs text-muted-foreground">Visível para agendamento</p>
                </div>
                <Switch checked={svcForm.ativo} onCheckedChange={(v) => setSvcForm((p) => ({ ...p, ativo: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Agendamento online</p>
                  <p className="text-xs text-muted-foreground">Permitir agendamento pelo portal do paciente</p>
                </div>
                <Switch checked={svcForm.permite_agendamento_online} onCheckedChange={(v) => setSvcForm((p) => ({ ...p, permite_agendamento_online: v }))} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSvcDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveSvc} disabled={createServico.isPending || updateServico.isPending}>
              {editingSvcId ? "Salvar" : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicosPage;
