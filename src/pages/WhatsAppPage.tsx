import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";

const mensagens = [
  { paciente: "Maria Silva", tipo: "lembrete", status: "enviado", data: "21/03 08:00", texto: "Olá Maria! Lembramos da sua consulta amanhã às 09:00." },
  { paciente: "Carlos Souza", tipo: "confirmacao", status: "pendente", data: "21/03 08:05", texto: "Carlos, confirme sua presença para amanhã às 10:00." },
  { paciente: "Ana Oliveira", tipo: "aniversario", status: "enviado", data: "20/03 09:00", texto: "Feliz aniversário, Ana! 🎂 A equipe deseja tudo de bom!" },
  { paciente: "Pedro Santos", tipo: "lembrete", status: "erro", data: "20/03 08:00", texto: "Pedro, sua sessão de fisioterapia é amanhã às 14:00." },
  { paciente: "Lucia Mendes", tipo: "confirmacao", status: "enviado", data: "19/03 08:00", texto: "Lucia, sua consulta está confirmada para amanhã às 15:30." },
];

const statusIcon: Record<string, React.ReactNode> = {
  enviado: <CheckCircle className="h-4 w-4 text-success" />,
  pendente: <Clock className="h-4 w-4 text-warning" />,
  erro: <AlertCircle className="h-4 w-4 text-destructive" />,
};

const tipoColor: Record<string, string> = {
  lembrete: "bg-primary/10 text-primary",
  confirmacao: "bg-success/10 text-success",
  aniversario: "bg-warning/10 text-warning",
};

const templates = [
  { nome: "Lembrete de Consulta", texto: "Olá {{nome_paciente}}! Lembramos da sua consulta em {{data_hora}}." },
  { nome: "Confirmação", texto: "{{nome_paciente}}, confirme sua presença para {{data_hora}}." },
  { nome: "Aniversário", texto: "Feliz aniversário, {{nome_paciente}}! 🎂 A equipe deseja tudo de bom!" },
];

const WhatsAppPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WhatsApp Hub</h1>
          <p className="text-muted-foreground text-sm">Mensagens automáticas e templates</p>
        </div>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Enviar Mensagem
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Messages list */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Mensagens Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mensagens.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-shadow animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{m.paciente}</span>
                      <Badge className={`text-[10px] ${tipoColor[m.tipo]}`}>{m.tipo}</Badge>
                      <span className="flex items-center gap-1 ml-auto">{statusIcon[m.status]}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{m.texto}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Templates</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((t, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-foreground">{t.nome}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{t.texto}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppPage;
