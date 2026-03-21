import heroMockup from "@/assets/hero-mockup.png";

const screens = [
  { label: "Agenda", img: heroMockup },
  { label: "Dashboard", img: heroMockup },
  { label: "App Paciente", img: heroMockup },
];

export const LandingDemo = () => (
  <section className="py-16 md:py-24 bg-muted/50 px-4">
    <div className="max-w-6xl mx-auto space-y-10 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">
        Conheça o <span className="text-primary">Agend.me</span> por dentro
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {screens.map((s) => (
          <div key={s.label} className="space-y-3">
            <img src={s.img} alt={s.label} className="rounded-xl border border-border shadow-lg" loading="lazy" />
            <p className="text-sm font-semibold text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
