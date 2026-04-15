import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit2, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useClientEmpresa } from "@/contexts/ClientEmpresaContext";
import { useClientPerfil, useUpdateClientPerfil } from "@/hooks/use-client-portal";
import { supabase } from "@/integrations/supabase/client";

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { empresa } = useClientEmpresa();
  const { data: perfil, isLoading } = useClientPerfil(empresa?.id);
  const updatePerfil = useUpdateClientPerfil();

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Populate local state from server data when starting edit
  const handleStartEdit = () => {
    setNome(perfil?.nome || "");
    setTelefone(perfil?.telefone || "");
    setEmail(perfil?.email || "");
    setEditing(true);
  };

  const handleSave = () => {
    if (!perfil?.id) return;
    updatePerfil.mutate(
      { clienteId: perfil.id, nome, telefone, email },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/app/${slug}/login`);
  };

  const initials = (perfil?.nome || "?")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
        <h1 className="text-lg font-bold text-foreground">Meu Perfil</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="p-5 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{perfil?.nome || "Paciente"}</h2>
              <p className="text-sm text-muted-foreground">{perfil?.email || ""}</p>
              {perfil?.telefone && (
                <p className="text-sm text-muted-foreground">{perfil.telefone}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleStartEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Se não há perfil: aviso */}
          {!perfil && (
            <p className="text-sm text-muted-foreground text-center border border-dashed border-border rounded-xl p-5">
              Nenhum perfil encontrado. Faça um agendamento para criar seu cadastro.
            </p>
          )}

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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-lg text-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-10 rounded-lg text-sm"
                  onClick={handleSave}
                  disabled={updatePerfil.isPending}
                >
                  {updatePerfil.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <Button
            variant="ghost"
            className="w-full justify-center gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      )}
    </div>
  );
}
