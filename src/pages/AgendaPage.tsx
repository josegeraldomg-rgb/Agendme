import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { useState } from "react";

const horarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const agendamentos = [
  { hora: "09:00", duracao: 1, paciente: "Maria Silva", servico: "Consulta", status: "confirmado" },
  { hora: "10:00", duracao: 1, paciente: "Carlos Souza", servico: "Retorno", status: "pendente" },
  { hora: "11:00", duracao: 2, paciente: "Ana Oliveira", servico: "Avaliação Completa", status: "confirmado" },
  { hora: "14:00", duracao: 1, paciente: "Pedro Santos", servico: "Fisioterapia", status: "cancelado" },
  { hora: "15:00", duracao: 1, paciente: "Lucia Mendes", servico: "Consulta", status: "confirmado" },
  { hora: "16:00", duracao: 1, paciente: "João Lima", servico: "Retorno", status: "pendente" },
];

const statusStyle: Record<string, string> = {
  confirmado: "border-l-4 border-l-success bg-success/5",
  pendente: "border-l-4 border-l-warning bg-warning/5",
  cancelado: "border-l-4 border-l-destructive bg-destructive/5 opacity-60",
};

type View = "dia" | "semana" | "mes";

const AgendaPage = () => {
  const [view, setView] = useState<View>("dia");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground text-sm">Gerencie os horários da clínica</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">21 de Março, 2026</span>
              <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["dia", "semana", "mes"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <Select defaultValue="todos">
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="joao">Dr. João</SelectItem>
                  <SelectItem value="paula">Dra. Paula</SelectItem>
                  <SelectItem value="ricardo">Dr. Ricardo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {horarios.map((hora) => {
              const agendamento = agendamentos.find((a) => a.hora === hora);
              return (
                <div key={hora} className="flex gap-3 min-h-[52px]">
                  <span className="text-xs font-mono text-muted-foreground w-12 pt-3 text-right">{hora}</span>
                  <div className="flex-1 border-t border-border pt-1">
                    {agendamento ? (
                      <div className={`rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow ${statusStyle[agendamento.status]}`}>
                        <p className="text-sm font-medium text-foreground">{agendamento.paciente}</p>
                        <p className="text-xs text-muted-foreground">{agendamento.servico}</p>
                      </div>
                    ) : (
                      <div className="h-10 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaPage;
