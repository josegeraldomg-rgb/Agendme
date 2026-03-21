import { Calendar, MessageSquare, Brain, Users, DollarSign, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    items: ["Visual diária, semanal e mensal", "Encaixes rápidos", "Lista de espera automática", "Bloqueio de horários", "Agendamentos recorrentes"],
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Automático",
    items: ["Lembretes automáticos", "Confirmação com 1 clique", "Cancelamento inteligente", "Mensagens personalizadas"],
  },
  {
    icon: Brain,
    title: "Prontuário Digital com IA",
    items: ["Registro clínico estruturado", "Transcrição automática por áudio", "Histórico completo", "Exportação em PDF"],
  },
  {
    icon: Users,
    title: "Cadastro de Pacientes",
    items: ["Histórico completo", "Documentos anexados", "Dados clínicos", "Controle financeiro individual"],
  },
  {
    icon: DollarSign,
    title: "Financeiro Integrado",
    items: ["Controle de receitas", "Controle de despesas", "Comissões automáticas", "Relatórios financeiros"],
  },
  {
    icon: Smartphone,
    title: "App do Paciente",
    items: ["Autoagendamento", "Histórico de atendimentos", "Pagamentos", "Comunicação com clínica"],
  },
];

export const LandingFeatures = () => (
  <section id="funcionalidades" className="py-16 md:py-24 bg-muted/50 px-4 scroll-mt-20">
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">
          Tudo que você precisa em <span className="text-primary">um só lugar</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Funcionalidades pensadas para simplificar a rotina de clínicas e profissionais de saúde.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Card key={f.title} className="border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {f.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
