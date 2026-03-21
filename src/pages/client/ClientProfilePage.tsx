import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, LogOut, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const mockDebits = [
  { id: "1", descricao: "Limpeza de Pele — 18/03", valor: 150, status: "pendente" },
  { id: "2", descricao: "Peeling Químico — 15/03", valor: 280, status: "pago" },
];

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState("Maria Oliveira");
  const [telefone, setTelefone] = useState("(11) 98765-4321");
  const [email, setEmail] = useState("maria@email.com");

  const handleSave = () => {
    setEditing(false);
    toast({ title: "Perfil atualizado! ✅" });
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
        <h1 className="text-lg font-bold text-foreground">Meu Perfil</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">MO</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{nome}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditing(!editing)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="space-y-3 bg-accent/30 rounded-xl p-4">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 h-10 rounded-lg" />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="mt-1 h-10 rounded-lg" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-10 rounded-lg" />
            </div>
            <Button className="w-full h-10 rounded-lg text-sm" onClick={handleSave}>Salvar</Button>
          </div>
        )}

        <Separator />

        {/* Debits */}
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" /> Meus Débitos
          </h3>
          <div className="space-y-2">
            {mockDebits.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm text-foreground">{d.descricao}</p>
                  <p className="text-xs text-muted-foreground">R$ {d.valor.toFixed(2)}</p>
                </div>
                {d.status === "pendente" ? (
                  <Button size="sm" variant="outline" className="text-xs h-8 rounded-lg">Pagar</Button>
                ) : (
                  <span className="text-xs text-success font-medium">Pago</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <Button variant="ghost" className="w-full justify-between text-destructive hover:text-destructive" onClick={() => navigate("/app/login")}>
          <span className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Sair</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
