import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dra. Camila Reis",
    city: "São Paulo, SP",
    text: "Reduzi minhas faltas em mais de 60% após usar o Agend.me. O lembrete automático pelo WhatsApp é sensacional!",
  },
  {
    name: "Dr. Lucas Mendes",
    city: "Belo Horizonte, MG",
    text: "Finalmente consigo ter controle financeiro real da minha clínica. Os relatórios são simples e diretos.",
  },
  {
    name: "Dra. Ana Beatriz",
    city: "Curitiba, PR",
    text: "O prontuário digital com IA mudou minha rotina. Eu dito e ele transcreve. Ganho 30 minutos por dia.",
  },
];

export const LandingSocial = () => (
  <section id="depoimentos" className="py-16 md:py-24 bg-muted/50 px-4 scroll-mt-20">
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">
          Quem usa, <span className="text-primary">recomenda</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <Card key={t.name} className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
