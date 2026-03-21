import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categorias = [
  {
    nome: "Consultas",
    servicos: [
      { nome: "Consulta Inicial", duracao: 60, preco: 250, ativo: true },
      { nome: "Retorno", duracao: 30, preco: 150, ativo: true },
    ],
  },
  {
    nome: "Fisioterapia",
    servicos: [
      { nome: "Sessão Fisioterapia", duracao: 50, preco: 180, ativo: true },
      { nome: "Avaliação Postural", duracao: 45, preco: 200, ativo: true },
      { nome: "RPG", duracao: 60, preco: 220, ativo: false },
    ],
  },
  {
    nome: "Estética",
    servicos: [
      { nome: "Limpeza de Pele", duracao: 90, preco: 280, ativo: true },
      { nome: "Peeling", duracao: 45, preco: 350, ativo: true },
    ],
  },
];

const ServicosPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm">Gerencie os serviços da clínica</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="space-y-6">
        {categorias.map((cat, i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{cat.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cat.servicos.map((s, j) => (
                  <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.duracao} min</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">R$ {s.preco.toFixed(2)}</span>
                      <Badge variant={s.ativo ? "default" : "secondary"} className="text-xs">
                        {s.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicosPage;
