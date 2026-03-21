import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "R$79",
    desc: "Para profissionais individuais",
    features: ["Agenda inteligente", "WhatsApp automático", "Cadastro de pacientes", "Prontuário básico", "Financeiro simples", "1 profissional"],
    cta: "Começar teste gratuito",
    highlight: false,
  },
  {
    name: "Professional",
    price: "R$149",
    desc: "Para pequenas equipes",
    features: ["Tudo do Starter", "Até 3 profissionais", "Prontuário completo", "Autoagendamento online", "Relatórios básicos"],
    cta: "Começar teste gratuito",
    highlight: true,
  },
  {
    name: "Clinic",
    price: "R$249",
    desc: "Para clínicas em crescimento",
    features: ["Tudo do Professional", "Até 10 profissionais", "Teleconsulta", "BI avançado", "Multiagenda"],
    cta: "Começar teste gratuito",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "R$399+",
    desc: "Para grandes operações",
    features: ["Profissionais ilimitados", "White-label", "API completa", "Integrações externas", "Suporte prioritário"],
    cta: "Falar com especialista",
    highlight: false,
  },
];

export const LandingPricing = () => (
  <section id="planos" className="py-16 md:py-24 px-4 scroll-mt-20">
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">
          Escolha o plano ideal para o seu <span className="text-primary">negócio</span>
        </h2>
        <p className="text-muted-foreground">Teste grátis por 15 dias. Sem cartão de crédito.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={`relative flex flex-col ${p.highlight ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border"}`}
          >
            {p.highlight && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Mais popular
              </Badge>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
              <div className="pt-2">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={p.highlight ? "default" : "outline"} asChild>
                <a href="#cta-final">{p.cta}</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
