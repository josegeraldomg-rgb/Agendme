import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const allServices: Record<string, { nome: string; preco: number; duracao: number; descricao: string; categoria: string }> = {
  s1: { nome: "Limpeza de Pele", preco: 150, duracao: 60, descricao: "Limpeza profunda com extração de cravos e espinhas. Inclui esfoliação, vapor de ozônio, extração, máscara calmante e protetor solar.", categoria: "Estética Facial" },
  s2: { nome: "Peeling Químico", preco: 280, duracao: 45, descricao: "Renovação celular com ácidos para uniformizar a pele e reduzir manchas.", categoria: "Estética Facial" },
  s3: { nome: "Microagulhamento", preco: 350, duracao: 50, descricao: "Procedimento que estimula a produção de colágeno para rejuvenescimento.", categoria: "Estética Facial" },
  s4: { nome: "Botox", preco: 800, duracao: 30, descricao: "Aplicação de toxina botulínica para suavizar rugas e linhas de expressão.", categoria: "Estética Facial" },
  s5: { nome: "Drenagem Linfática", preco: 120, duracao: 60, descricao: "Massagem suave para reduzir inchaço e eliminar toxinas.", categoria: "Estética Corporal" },
  s6: { nome: "Criolipólise", preco: 500, duracao: 40, descricao: "Congelamento controlado de gordura localizada.", categoria: "Estética Corporal" },
  s7: { nome: "Depilação a Laser", preco: 200, duracao: 30, descricao: "Remoção definitiva de pelos com laser de diodo.", categoria: "Depilação" },
  s8: { nome: "Depilação com Cera", preco: 80, duracao: 20, descricao: "Remoção de pelos com cera morna.", categoria: "Depilação" },
};

const mockProfessionals = [
  { id: "p1", nome: "Dra. Ana Silva", especialidade: "Dermatologista", rating: 4.9 },
  { id: "p2", nome: "Dr. Carlos Mendes", especialidade: "Esteticista", rating: 4.7 },
  { id: "p3", nome: "Dra. Mariana Costa", especialidade: "Fisioterapeuta", rating: 4.8 },
];

export default function ClientServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = allServices[id || ""];

  if (!service) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Serviço não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header image area */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent flex items-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 h-9 w-9 bg-card/80 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="px-5 -mt-4 relative z-10">
        <Badge variant="secondary" className="mb-2 text-xs">{service.categoria}</Badge>
        <h1 className="text-xl font-bold text-foreground">{service.nome}</h1>

        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            <DollarSign className="h-4 w-4" /> R$ {service.preco.toFixed(2)}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> {service.duracao} min
          </span>
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{service.descricao}</p>

        {/* Professionals */}
        <h2 className="text-sm font-semibold text-foreground mt-6 mb-3">Profissionais disponíveis</h2>
        <div className="space-y-2">
          {mockProfessionals.map((prof) => (
            <div key={prof.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">
                  {prof.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{prof.nome}</p>
                <p className="text-xs text-muted-foreground">{prof.especialidade}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-xs font-medium text-foreground">{prof.rating}</span>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-6 mb-6 h-12 rounded-xl text-sm font-semibold"
          onClick={() => navigate(`/app/agendar?servico=${id}`)}
        >
          Agendar Agora
        </Button>
      </div>
    </div>
  );
}
