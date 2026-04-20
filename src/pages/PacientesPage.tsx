import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientes, useCreateCliente, useUpdateCliente } from "@/hooks/use-clientes";

const PacientesPage = () => {
  const { data: pacientes, isLoading } = useClientes();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", data_nascimento: "" });

  const filtered = useMemo(() => {
    setPage(1); // reset on search change
    return (pacientes || []).filter(
      (p) =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.telefone || "").includes(search)
    );
  }, [pacientes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreate = () => {
    if (!form.nome || !form.email) return;
    createCliente.mutate(
      { nome: form.nome, email: form.email, telefone: form.telefone || undefined, data_nascimento: form.data_nascimento || undefined },
      { onSuccess: () => { setDialogOpen(false); setForm({ nome: "", email: "", telefone: "", data_nascimento: "" }); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground text-sm">{pacientes?.length || 0} pacientes cadastrados</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Telefone</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {p.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{p.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">{p.telefone || "—"}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">{p.email}</td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={p.ativo ? "default" : "destructive"}
                          className="text-xs cursor-pointer"
                          onClick={() => updateCliente.mutate({ id: p.id, ativo: !p.ativo })}
                        >
                          {p.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum paciente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Paginação */}
            {filtered.length > pageSize && (
              <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                <p className="text-xs text-muted-foreground">
                  Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Próxima <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input value={form.data_nascimento} onChange={(e) => setForm((p) => ({ ...p, data_nascimento: e.target.value }))} type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createCliente.isPending}>
              {createCliente.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PacientesPage;
