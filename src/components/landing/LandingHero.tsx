import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroMockup from "@/assets/hero-mockup.png";

export const LandingHero = () => {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
            🚀 Teste grátis por 15 dias
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Pare de perder pacientes por{" "}
            <span className="text-primary">faltas e desorganização.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            A plataforma completa para clínicas e profissionais de saúde que querem automatizar agendamentos, reduzir faltas e ter controle total da rotina.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="gap-2 text-base" asChild>
              <a href="#planos">
                Começar teste gratuito <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
              <a href="#funcionalidades">
                <Play className="h-4 w-4" /> Ver como funciona
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl" />
          <img
            src={heroMockup}
            alt="Dashboard do Agend.me mostrando agenda inteligente, WhatsApp e financeiro"
            className="relative rounded-2xl shadow-2xl border border-border"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};
