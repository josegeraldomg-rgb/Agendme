import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "O Agend.me é difícil de usar?", a: "Não. O sistema foi criado para ser simples e intuitivo. Em poucos minutos você já estará agendando." },
  { q: "Funciona no celular?", a: "Sim. O sistema funciona perfeitamente em celulares, tablets e desktops." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Não há contrato obrigatório. Cancele a qualquer momento." },
  { q: "O paciente precisa baixar app?", a: "Não necessariamente. O paciente pode usar diretamente pelo navegador do celular." },
  { q: "Meus dados ficam seguros?", a: "Sim. O sistema possui criptografia de ponta e backup automático diário." },
];

export const LandingFAQ = () => (
  <section id="faq" className="py-16 md:py-24 px-4 scroll-mt-20">
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">Perguntas frequentes</h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
