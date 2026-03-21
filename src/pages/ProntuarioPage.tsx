import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Plus } from "lucide-react";

const prontuarios = [
  { data: "20/03/2026", paciente: "Maria Silva", profissional: "Dr. João", descricao: "Avaliação inicial. Queixa de dores lombares. Solicitado exames complementares." },
  { data: "19/03/2026", paciente: "Carlos Souza", profissional: "Dra. Paula", descricao: "Retorno com resultados de exames. Início do tratamento conservador." },
  { data: "18/03/2026", paciente: "Ana Oliveira", profissional: "Dr. Ricardo", descricao: "Sessão de fisioterapia. Exercícios de fortalecimento. Paciente relata melhora." },
  { data: "17/03/2026", paciente: "Pedro Santos", profissional: "Dr. João", descricao: "Consulta de rotina. Sem queixas significativas. Orientações gerais." },
];

const ProntuarioPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prontuário</h1>
          <p className="text-muted-foreground text-sm">Histórico de atendimentos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por paciente..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prontuarios.map((p, i) => (
              <div key={i} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.paciente}</p>
                      <p className="text-xs text-muted-foreground">{p.profissional} • {p.data}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Download className="h-3 w-3" /> PDF
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProntuarioPage;
