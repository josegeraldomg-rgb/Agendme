import { CheckCircle2 } from "lucide-react";

const items = [
  "Lembretes automáticos por WhatsApp",
  "Confirmação com 1 clique",
  "Agenda inteligente",
  "Prontuário digital com IA",
  "Financeiro integrado",
];

export const LandingPromise = () => (
  <section className="py-16 md:py-24 px-4">
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold">
        Mais pacientes atendidos. Menos faltas.{" "}
        <span className="text-primary">Mais organização.</span>
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {item}
          </div>
        ))}
      </div>
    </div>
  </section>
);
