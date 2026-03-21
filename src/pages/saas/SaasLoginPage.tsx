import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function SaasLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !senha.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Login realizado com sucesso!" });
      navigate("/saas/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-primary-foreground">A</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Agend.me</h1>
          <p className="text-sm text-muted-foreground mt-1">Painel do Administrador SaaS</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <div>
            <Label className="text-sm">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@agend.me" type="email" className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm">Senha</Label>
            <Input value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" type="password" className="mt-1 h-11 rounded-xl" />
          </div>
          <Button className="w-full h-11 rounded-xl font-semibold" onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
