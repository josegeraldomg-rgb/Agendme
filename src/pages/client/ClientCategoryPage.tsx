import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockServices: Record<string, { id: string; nome: string; preco: number; duracao: number; descricao: string }[]> = {
  "1": [
    { id: "s1", nome: "Limpeza de Pele", preco: 150, duracao: 60, descricao: "Limpeza profunda com extração" },
    { id: "s2", nome: "Peeling Químico", preco: 280, duracao: 45, descricao: "Renovação celular com ácidos" },
    { id: "s3", nome: "Microagulhamento", preco: 350, duracao: 50, descricao: "Estímulo de colágeno" },
    { id: "s4", nome: "Botox", preco: 800, duracao: 30, descricao: "Toxina botulínica para rugas" },
  ],
  "2": [
    { id: "s5", nome: "Drenagem Linfática", preco: 120, duracao: 60, descricao: "Massagem para reduzir inchaço" },
    { id: "s6", nome: "Criolipólise", preco: 500, duracao: 40, descricao: "Congelamento de gordura localizada" },
  ],
  "3": [
    { id: "s7", nome: "Depilação a Laser", preco: 200, duracao: 30, descricao: "Laser de diodo" },
    { id: "s8", nome: "Depilação com Cera", preco: 80, duracao: 20, descricao: "Cera morna" },
  ],
};

const categoryNames: Record<string, string> = {
  "1": "Estética Facial",
  "2": "Estética Corporal",
  "3": "Depilação",
  "4": "Massagens",
  "5": "Cabelo",
  "6": "Unhas",
};

export default function ClientCategoryPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const services = mockServices[id || ""] || [];
  const categoryName = categoryNames[id || ""] || "Categoria";

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/app/${slug}`)} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">{categoryName}</h1>
      </div>

      <div className="p-4 space-y-3">
        {services.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">Nenhum serviço disponível nesta categoria.</p>
        )}
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => navigate(`/app/${slug}/servico/${service.id}`)}
            className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-foreground text-sm">{service.nome}</h3>
            <p className="text-xs text-muted-foreground mt-1">{service.descricao}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                <DollarSign className="h-3.5 w-3.5" />
                R$ {service.preco.toFixed(2)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {service.duracao} min
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
