import { Zap, Brain, Video, Layers, Users2, Palette, BarChart3 } from "lucide-react";

const diffs = [
  { icon: Zap, label: "Integração real com WhatsApp" },
  { icon: Brain, label: "Prontuário com Inteligência Artificial" },
  { icon: Video, label: "Teleconsulta integrada" },
  { icon: Layers, label: "Sistema completo (não apenas agenda)" },
  { icon: Users2, label: "Multi-profissionais" },
  { icon: Palette, label: "White-label" },
  { icon: BarChart3, label: "Relatórios inteligentes" },
];

export const LandingDifferentials = () => (
  <section className="py-16 md:py-24 px-4">
    <div className="max-w-5xl mx-auto text-center space-y-10">
      <h2 className="text-3xl md:text-4xl font-bold">
        Por que escolher o <span className="text-primary">Agend.me?</span>
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {diffs.map((d) => (
          <div key={d.label} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <d.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-left">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
