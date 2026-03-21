import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const LandingCTAFinal = () => (
  <section id="cta-final" className="py-16 md:py-24 px-4 scroll-mt-20">
    <div className="max-w-3xl mx-auto text-center space-y-6 rounded-3xl bg-primary p-10 md:p-16">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
        Comece hoje a transformar sua agenda.
      </h2>
      <p className="text-primary-foreground/80 text-lg">
        Teste grátis por 15 dias. Sem compromisso.
      </p>
      <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold">
        Começar teste gratuito <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </section>
);
