import { AlertTriangle, Clock, CalendarX, DollarSign, MessageSquare, TrendingDown } from "lucide-react";

const problems = [
  { icon: AlertTriangle, text: "Pacientes esquecem consultas" },
  { icon: CalendarX, text: "Cancelamentos de última hora" },
  { icon: Clock, text: "Agenda desorganizada" },
  { icon: TrendingDown, text: "Perda de faturamento" },
  { icon: DollarSign, text: "Falta de controle financeiro" },
  { icon: MessageSquare, text: "Atendimento manual pelo WhatsApp" },
];

export const LandingProblems = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50 px-4">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            Sua agenda cheia… mas cheia de <span className="text-destructive">faltas?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Se você se identifica com algum desses problemas, o Agend.me foi feito para você.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p) => (
            <div
              key={p.text}
              className="flex items-center gap-3 rounded-xl bg-background p-4 border border-border shadow-sm text-left"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <p.icon className="h-5 w-5 text-destructive" />
              </div>
              <span className="text-sm font-medium">{p.text}</span>
            </div>
          ))}
        </div>

        <div className="inline-block rounded-full bg-primary/10 px-6 py-2.5">
          <p className="text-primary font-semibold text-sm">
            ✨ O Agend.me resolve tudo isso automaticamente.
          </p>
        </div>
      </div>
    </section>
  );
};
