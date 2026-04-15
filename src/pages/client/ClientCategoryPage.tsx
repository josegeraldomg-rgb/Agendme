import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientEmpresa } from "@/contexts/ClientEmpresaContext";
import { useClientServicos } from "@/hooks/use-client-portal";

export default function ClientCategoryPage() {
  const { id: categoriaId, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const { empresa } = useClientEmpresa();

  const { data: servicos = [], isLoading } = useClientServicos(empresa?.id, categoriaId);

  const handleWhatsApp = (servicoNome: string) => {
    const num = empresa?.config && (empresa.config as Record<string, string>).whatsapp || "5500000000000";
    const msg = encodeURIComponent(`Olá! Gostaria de agendar: ${servicoNome}`);
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/app/${slug}`)} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Serviços</h1>
      </div>

      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && servicos.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">Nenhum serviço disponível nesta categoria.</p>
        )}

        {servicos.map((service) => (
          <div
            key={service.id}
            className="w-full bg-card rounded-xl border border-border p-4"
          >
            <h3 className="font-medium text-foreground text-sm">{service.nome}</h3>
            {service.descricao && (
              <p className="text-xs text-muted-foreground mt-1">{service.descricao}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                <DollarSign className="h-3.5 w-3.5" />
                R$ {Number(service.preco).toFixed(2)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {service.duracao_minutos} min
              </span>
            </div>
            <div className="mt-3">
              {service.whatsapp_only ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-9 text-xs gap-1.5 border-success text-success hover:bg-success/10"
                  onClick={() => handleWhatsApp(service.nome)}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chamar no WhatsApp
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full h-9 text-xs"
                  onClick={() => navigate(`/app/${slug}/agendar?servico=${service.id}&categoria=${categoriaId}`)}
                >
                  Agendar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
