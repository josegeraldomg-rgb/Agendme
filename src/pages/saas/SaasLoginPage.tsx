import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-agendme.png";

export default function SaasLoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigate to SaaS dashboard once AuthContext confirms the user is authenticated.
  // Avoids the race condition where ProtectedRoute redirects back before user state is set.
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/saas/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await signIn(email, senha);
      if (error) {
        toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
        setLoading(false);
      }
      // On success: useEffect above handles navigation once AuthContext updates user
    } catch (err: any) {
      console.error("Erro crítico:", err);
      toast({ title: "Erro Crítico", description: err?.message || "Falha desconhecida", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src={logo} alt="Agend.me" className="h-14 w-14 mx-auto mb-4" />
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
