import { Search, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo-agendme.png";

const mockCategories = [
  { id: "1", nome: "Estética Facial", icon: "✨", count: 8 },
  { id: "2", nome: "Estética Corporal", icon: "💆", count: 12 },
  { id: "3", nome: "Depilação", icon: "🌿", count: 6 },
  { id: "4", nome: "Massagens", icon: "🤲", count: 5 },
  { id: "5", nome: "Cabelo", icon: "💇", count: 10 },
  { id: "6", nome: "Unhas", icon: "💅", count: 7 },
];

export default function ClientHomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockCategories.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Bem-vindo(a) à</p>
            <h1 className="text-xl font-bold text-primary-foreground">Clínica Beleza & Saúde</h1>
          </div>
          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center">
            <img src={logo} alt="Agend.me" className="h-8 w-8" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-0 h-11 rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 pt-6 flex-1">
        <h2 className="text-base font-semibold text-foreground mb-4">Categorias</h2>
        <div className="grid grid-cols-2 gap-3 auto-rows-fr">
          {filtered.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/app/categoria/${cat.id}`)}
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{cat.nome}</p>
                <p className="text-xs text-muted-foreground">{cat.count} serviços</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp FAB */}
      <Button
        size="icon"
        className="fixed bottom-24 right-4 h-12 w-12 rounded-full bg-success hover:bg-success/90 shadow-lg z-40"
        onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
      >
        <MessageCircle className="h-5 w-5 text-success-foreground" />
      </Button>
    </div>
  );
}
