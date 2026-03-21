import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";
import {
  Plus, MoreHorizontal, Pencil, Trash2, Image as ImageIcon, X,
  Clock, DollarSign, Users, MessageSquare, FolderOpen, ChevronDown, ChevronRight, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──

interface Profissional {
  id: string;
  nome: string;
  avatar: string;
}

interface ProfissionalVinculado {
  profissionalId: string;
  precoPersonalizado?: number;
  duracaoPersonalizada?: number;
}

interface Servico {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  duracao: number;
  preco: number;
  ativo: boolean;
  whatsappOnly: boolean;
  orientacoesCliente: string;
  fotos: string[];
  profissionais: ProfissionalVinculado[];
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
}

// ── Mock Data ──

const mockProfissionais: Profissional[] = [
  { id: "p1", nome: "Dra. Ana Silva", avatar: "AS" },
  { id: "p2", nome: "Dr. Carlos Mendes", avatar: "CM" },
  { id: "p3", nome: "Dra. Mariana Costa", avatar: "MC" },
];

const initialCategorias: Categoria[] = [
  { id: "cat1", nome: "Consultas", descricao: "Consultas médicas e retornos" },
  { id: "cat2", nome: "Fisioterapia", descricao: "Sessões de fisioterapia e avaliação" },
  { id: "cat3", nome: "Estética", descricao: "Procedimentos estéticos" },
];

const initialServicos: Servico[] = [
  {
    id: "s1", categoriaId: "cat1", nome: "Consulta Inicial", descricao: "Consulta completa com anamnese",
    duracao: 60, preco: 250, ativo: true, whatsappOnly: false,
    orientacoesCliente: "Trazer exames recentes e lista de medicamentos em uso.",
    fotos: [], profissionais: [
      { profissionalId: "p1", precoPersonalizado: 280, duracaoPersonalizada: 50 },
      { profissionalId: "p2" },
    ],
  },
  {
    id: "s2", categoriaId: "cat1", nome: "Retorno", descricao: "Consulta de retorno",
    duracao: 30, preco: 150, ativo: true, whatsappOnly: false,
    orientacoesCliente: "", fotos: [], profissionais: [{ profissionalId: "p1" }],
  },
  {
    id: "s3", categoriaId: "cat2", nome: "Sessão Fisioterapia", descricao: "Sessão de fisioterapia convencional",
    duracao: 50, preco: 180, ativo: true, whatsappOnly: false,
    orientacoesCliente: "Usar roupa confortável.", fotos: [], profissionais: [{ profissionalId: "p3" }],
  },
  {
    id: "s4", categoriaId: "cat2", nome: "Avaliação Postural", descricao: "Avaliação completa da postura",
    duracao: 45, preco: 200, ativo: true, whatsappOnly: false,
    orientacoesCliente: "", fotos: [], profissionais: [{ profissionalId: "p3", precoPersonalizado: 220, duracaoPersonalizada: 60 }],
  },
  {
    id: "s5", categoriaId: "cat3", nome: "Limpeza de Pele", descricao: "Limpeza profunda com extração",
    duracao: 90, preco: 280, ativo: true, whatsappOnly: false,
    orientacoesCliente: "Não usar maquiagem no dia do procedimento.",
    fotos: [], profissionais: [{ profissionalId: "p1" }, { profissionalId: "p2", precoPersonalizado: 250, duracaoPersonalizada: 75 }],
  },
  {
    id: "s6", categoriaId: "cat3", nome: "Peeling", descricao: "Peeling químico facial",
    duracao: 45, preco: 350, ativo: true, whatsappOnly: true,
    orientacoesCliente: "Suspender uso de ácidos 7 dias antes.", fotos: [], profissionais: [{ profissionalId: "p1" }],
  },
];

// ── Main Component ──

const ServicosPage = () => {
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [servicos, setServicos] = useState<Servico[]>(initialServicos);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categorias.map((c) => c.id)));

  // Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [catForm, setCatForm] = useState({ nome: "", descricao: "" });

  // Service dialog
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Servico | null>(null);
  const [svcTab, setSvcTab] = useState("geral");

  // Service form state
  const [svcForm, setSvcForm] = useState<Omit<Servico, "id">>({
    categoriaId: "", nome: "", descricao: "", duracao: 30, preco: 0,
    ativo: true, whatsappOnly: false, orientacoesCliente: "", fotos: [], profissionais: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Category handlers ──
  const openNewCat = () => {
    setEditingCat(null);
    setCatForm({ nome: "", descricao: "" });
    setCatDialogOpen(true);
  };
  const openEditCat = (cat: Categoria) => {
    setEditingCat(cat);
    setCatForm({ nome: cat.nome, descricao: cat.descricao });
    setCatDialogOpen(true);
  };
  const saveCat = () => {
    if (!catForm.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (editingCat) {
      setCategorias((prev) => prev.map((c) => c.id === editingCat.id ? { ...c, ...catForm } : c));
      toast({ title: "Categoria atualizada" });
    } else {
      const newCat: Categoria = { id: `cat-${Date.now()}`, ...catForm };
      setCategorias((prev) => [...prev, newCat]);
      setExpandedCats((prev) => new Set([...prev, newCat.id]));
      toast({ title: "Categoria criada" });
    }
    setCatDialogOpen(false);
  };
  const deleteCat = (id: string) => {
    const hasServices = servicos.some((s) => s.categoriaId === id);
    if (hasServices) {
      toast({ title: "Categoria possui serviços", description: "Remova os serviços primeiro.", variant: "destructive" });
      return;
    }
    setCategorias((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Categoria removida" });
  };

  // ── Service handlers ──
  const openNewSvc = (catId?: string) => {
    setEditingSvc(null);
    setSvcForm({
      categoriaId: catId || categorias[0]?.id || "", nome: "", descricao: "",
      duracao: 30, preco: 0, ativo: true, whatsappOnly: false,
      orientacoesCliente: "", fotos: [], profissionais: [],
    });
    setSvcTab("geral");
    setSvcDialogOpen(true);
  };
  const openEditSvc = (svc: Servico) => {
    setEditingSvc(svc);
    setSvcForm({ ...svc });
    setSvcTab("geral");
    setSvcDialogOpen(true);
  };
  const saveSvc = () => {
    if (!svcForm.nome.trim() || !svcForm.categoriaId) {
      toast({ title: "Preencha nome e categoria", variant: "destructive" });
      return;
    }
    if (svcForm.preco <= 0 || svcForm.duracao <= 0) {
      toast({ title: "Preço e duração devem ser maiores que zero", variant: "destructive" });
      return;
    }
    if (editingSvc) {
      setServicos((prev) => prev.map((s) => s.id === editingSvc.id ? { ...editingSvc, ...svcForm } : s));
      toast({ title: "Serviço atualizado" });
    } else {
      setServicos((prev) => [...prev, { id: `svc-${Date.now()}`, ...svcForm }]);
      toast({ title: "Serviço criado" });
    }
    setSvcDialogOpen(false);
  };
  const deleteSvc = (id: string) => {
    setServicos((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Serviço removido" });
  };
  const toggleSvcAtivo = (id: string) => {
    setServicos((prev) => prev.map((s) => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  // ── Photo handlers ──
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSvcForm((prev) => ({ ...prev, fotos: [...prev.fotos, ev.target?.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };
  const removePhoto = (idx: number) => {
    setSvcForm((prev) => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== idx) }));
  };

  // ── Professional handlers ──
  const toggleProfissional = (profId: string) => {
    setSvcForm((prev) => {
      const exists = prev.profissionais.find((p) => p.profissionalId === profId);
      if (exists) {
        return { ...prev, profissionais: prev.profissionais.filter((p) => p.profissionalId !== profId) };
      }
      return { ...prev, profissionais: [...prev.profissionais, { profissionalId: profId }] };
    });
  };
  const updateProfPersonalizado = (profId: string, field: "precoPersonalizado" | "duracaoPersonalizada", value: number | undefined) => {
    setSvcForm((prev) => ({
      ...prev,
      profissionais: prev.profissionais.map((p) =>
        p.profissionalId === profId ? { ...p, [field]: value } : p
      ),
    }));
  };

  // ── Toggle category expand ──
  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
          <p className="text-2xl font-bold text-foreground">{categorias.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Serviços</p>
          <p className="text-2xl font-bold text-foreground">{servicos.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-primary">{servicos.filter((s) => s.ativo).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Só WhatsApp</p>
          <p className="text-2xl font-bold text-foreground">{servicos.filter((s) => s.whatsappOnly).length}</p>
        </Card>
      </div>

      {/* Categories + Services */}
      <div className="space-y-4">
        {categorias.map((cat) => {
          const catServicos = servicos.filter((s) => s.categoriaId === cat.id);
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCat(cat.id)}>
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
                          {svc.fotos.length > 0 ? (
                            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-border">
                              <img src={svc.fotos[0]} alt="" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{svc.nome}</p>
                              {svc.whatsappOnly && (
                                <Badge variant="outline" className="text-[10px] border-success text-success shrink-0">WhatsApp</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {svc.duracao}min
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> {svc.profissionais.length}
                              </span>
                              {svc.orientacoesCliente && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" /> Orientações
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold text-foreground">R$ {svc.preco.toFixed(2)}</span>
                          <Switch checked={svc.ativo} onCheckedChange={() => toggleSvcAtivo(svc.id)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEditSvc(svc)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteSvc(svc.id)}>
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
            <DialogTitle>{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
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
            <Button onClick={saveCat}>{editingCat ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Service Dialog ── */}
      <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSvc ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>

          <Tabs value={svcTab} onValueChange={setSvcTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
              <TabsTrigger value="fotos">Fotos</TabsTrigger>
              <TabsTrigger value="orientacoes">Orientações</TabsTrigger>
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
                  <Select value={svcForm.categoriaId} onValueChange={(v) => setSvcForm((p) => ({ ...p, categoriaId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
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
                  <Input type="number" min={1} value={svcForm.duracao} onChange={(e) => setSvcForm((p) => ({ ...p, duracao: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Preço base (R$) *</Label>
                  <Input type="number" min={0} step={0.01} value={svcForm.preco} onChange={(e) => setSvcForm((p) => ({ ...p, preco: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
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
                  <p className="text-sm font-medium text-foreground">Apenas via WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Cliente agenda apenas pelo WhatsApp</p>
                </div>
                <Switch checked={svcForm.whatsappOnly} onCheckedChange={(v) => setSvcForm((p) => ({ ...p, whatsappOnly: v }))} />
              </div>
            </TabsContent>

            {/* Tab: Profissionais */}
            <TabsContent value="profissionais" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Vincule profissionais e defina tempos e preços diferenciados por profissional.
              </p>
              <div className="space-y-3">
                {mockProfissionais.map((prof) => {
                  const vinculado = svcForm.profissionais.find((p) => p.profissionalId === prof.id);
                  const isLinked = !!vinculado;
                  return (
                    <div key={prof.id} className={cn("rounded-xl border p-4 transition-all", isLinked ? "border-primary/40 bg-primary/5" : "border-border")}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-xs">{prof.avatar}</span>
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
                              placeholder={`Padrão: ${svcForm.preco.toFixed(2)}`}
                              value={vinculado?.precoPersonalizado ?? ""}
                              onChange={(e) => {
                                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                updateProfPersonalizado(prof.id, "precoPersonalizado", val);
                              }}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Duração personalizada (min)</Label>
                            <Input
                              type="number" min={1}
                              placeholder={`Padrão: ${svcForm.duracao}`}
                              value={vinculado?.duracaoPersonalizada ?? ""}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                updateProfPersonalizado(prof.id, "duracaoPersonalizada", val);
                              }}
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

            {/* Tab: Fotos */}
            <TabsContent value="fotos" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Adicione fotos do serviço, portfólio e registros de antes/depois.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <div className="grid grid-cols-3 gap-3">
                {svcForm.fotos.map((foto, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    <img src={foto} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-medium">Adicionar</span>
                </button>
              </div>
            </TabsContent>

            {/* Tab: Orientações */}
            <TabsContent value="orientacoes" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Instruções enviadas automaticamente ao cliente nos lembretes de WhatsApp.
              </p>
              <div>
                <Label>Orientações ao cliente</Label>
                <Textarea
                  value={svcForm.orientacoesCliente}
                  onChange={(e) => setSvcForm((p) => ({ ...p, orientacoesCliente: e.target.value }))}
                  placeholder='Ex: "Comparecer de calçado aberto", "Jejum de 8 horas"'
                  rows={4}
                />
              </div>
              {svcForm.orientacoesCliente && (
                <div className="rounded-lg bg-muted/60 border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Pré-visualização do lembrete:</p>
                  <p className="text-sm text-foreground">
                    📋 <strong>Orientações para {svcForm.nome || "seu atendimento"}:</strong>
                  </p>
                  <p className="text-sm text-foreground mt-1">{svcForm.orientacoesCliente}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSvcDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveSvc}>{editingSvc ? "Salvar" : "Criar Serviço"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicosPage;
