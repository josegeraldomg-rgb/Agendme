import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const pacientes = [
  { nome: "Maria Silva", telefone: "(11) 99999-1234", email: "maria@email.com", status: "ativo" },
  { nome: "Carlos Souza", telefone: "(11) 98888-5678", email: "carlos@email.com", status: "ativo" },
  { nome: "Ana Oliveira", telefone: "(21) 97777-9012", email: "ana@email.com", status: "ativo" },
  { nome: "Pedro Santos", telefone: "(11) 96666-3456", email: "pedro@email.com", status: "bloqueado" },
  { nome: "Lucia Mendes", telefone: "(31) 95555-7890", email: "lucia@email.com", status: "ativo" },
  { nome: "João Lima", telefone: "(11) 94444-1234", email: "joao@email.com", status: "ativo" },
  { nome: "Fernanda Costa", telefone: "(21) 93333-5678", email: "fernanda@email.com", status: "ativo" },
  { nome: "Roberto Alves", telefone: "(11) 92222-9012", email: "roberto@email.com", status: "ativo" },
];

const PacientesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground text-sm">{pacientes.length} pacientes cadastrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente por nome, telefone ou email..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
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
                {pacientes.map((p, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{p.nome.split(" ").map(n=>n[0]).join("")}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{p.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">{p.telefone}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">{p.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant={p.status === "ativo" ? "default" : "destructive"} className="text-xs">
                        {p.status === "ativo" ? "Ativo" : "Bloqueado"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PacientesPage;
