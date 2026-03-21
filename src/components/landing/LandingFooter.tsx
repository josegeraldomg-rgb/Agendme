import { Instagram, Youtube } from "lucide-react";

export const LandingFooter = () => (
  <footer className="border-t border-border py-10 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-center md:text-left space-y-1">
        <p className="text-sm font-bold text-primary">
          Agend<span className="text-foreground">.me</span>
        </p>
        <p className="text-xs text-muted-foreground">© Agend.me — Todos os direitos reservados.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Sobre nós</a>
        <a href="#" className="hover:text-foreground transition-colors">Termos de uso</a>
        <a href="#" className="hover:text-foreground transition-colors">Política de privacidade</a>
        <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
        <a href="#" className="hover:text-foreground transition-colors">Contato</a>
      </div>

      <div className="flex gap-3">
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
          <Instagram className="h-5 w-5" />
        </a>
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="YouTube">
          <Youtube className="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
);
