import { Search, MessageCircle, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo-agendme.png";
import { useClientEmpresa } from "@/contexts/ClientEmpresaContext";
import { useClientCategorias } from "@/hooks/use-client-portal";

// Emoji fallback para categorias sem ícone definido
const categoryEmojis = ["✨", "💆", "🌿", "🤲", "💇", "💅", "🏥", "💊", "👁️", "🦷"];

export default function ClientHomePage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { empresa } = useClientEmpresa();
  const [search, setSearch] = useState("");

  const { data: categorias = [], isLoading } = useClientCategorias(empresa?.id);

  const filtered = categorias.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  // Fallback para quando não há categorias reais
  const displayItems = categorias.length > 0 ? filtered : [];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Bem-vindo(a) à</p>
            <h1 className="text-xl font-bold text-primary-foreground">{empresa?.nome || "Clínica"}</h1>
          </div>
          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center">
            {empresa?.logo_url
              ? <img src={empresa.logo_url} alt={empresa.nome} className="h-10 w-10 object-cover" />
              : <img src={logo} alt="Agend.me" className="h-8 w-8" />
            }
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-0 h-11 rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 pt-6 flex-1">
        <h2 className="text-base font-semibold text-foreground mb-4">Categorias</h2>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && displayItems.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">
            Nenhuma categoria encontrada.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 auto-rows-fr">
          {displayItems.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/app/${slug}/categoria/${cat.id}`)}
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <span className="text-2xl">{cat.icone || categoryEmojis[idx % categoryEmojis.length]}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{cat.nome}</p>
                {cat.descricao && <p className="text-xs text-muted-foreground line-clamp-1">{cat.descricao}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp FAB — usa número real da empresa via config */}
      {empresa?.config && (empresa.config as Record<string, string>).whatsapp && (
        <Button
          size="icon"
          className="fixed bottom-24 right-4 h-12 w-12 rounded-full bg-success hover:bg-success/90 shadow-lg z-40"
          onClick={() => {
            const num = (empresa.config as Record<string, string>).whatsapp;
            window.open(`https://wa.me/${num}`, "_blank");
          }}
        >
          <MessageCircle className="h-5 w-5 text-success-foreground" />
        </Button>
      )}
    </div>
  );
}
