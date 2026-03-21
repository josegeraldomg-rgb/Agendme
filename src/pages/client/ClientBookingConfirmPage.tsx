import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Upload, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClientBookingConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicoId = searchParams.get("servico") || "";
  const dataStr = searchParams.get("data") || "";
  const hora = searchParams.get("hora") || "";

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  const serviceNames: Record<string, string> = {
    s1: "Limpeza de Pele", s2: "Peeling Químico", s3: "Microagulhamento", s4: "Botox",
    s5: "Drenagem Linfática", s6: "Criolipólise", s7: "Depilação a Laser", s8: "Depilação com Cera",
  };

  const dateFormatted = dataStr
    ? format(parse(dataStr, "yyyy-MM-dd", new Date()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  const handleConfirm = () => {
    if (!nome.trim() || !telefone.trim()) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Agendamento confirmado! ✅", description: "Você receberá uma confirmação por WhatsApp." });
      navigate("/app/historico");
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Confirmar Agendamento</h1>
      </div>

      <div className="p-4 space-y-5">
        {/* Summary */}
        <div className="bg-accent/50 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Resumo</h2>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <UserIcon className="h-4 w-4 text-primary" />
            <span>{serviceNames[servicoId] || "Serviço"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{hora}</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Nome completo *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm">Telefone *</Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email" className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm">Observações</Label>
            <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Alguma informação adicional?" className="mt-1 rounded-xl" rows={3} />
          </div>
          <div>
            <Label className="text-sm">Anexar imagem (opcional)</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-6 w-6" />
              <span className="text-xs">Toque para enviar uma imagem</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full h-12 rounded-xl text-sm font-semibold"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Confirmando..." : "Confirmar Agendamento"}
        </Button>
      </div>
    </div>
  );
}
