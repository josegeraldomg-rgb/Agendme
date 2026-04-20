import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-agendme.png";

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { signIn, signUp, resetPassword, user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (isLogin) {
         navigate(slug ? `/app/${slug}` : "/app", { replace: true });
      }
    }
  }, [user, authLoading, navigate, slug, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, senha);
      setLoading(false);
      if (error) {
        toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Login realizado!" });
        // navigation is handled by useEffect when user state is updated
      }
    } else {
      const { error } = await signUp(email, senha, { nome, telefone });
      setLoading(false);
      if (error) {
        toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: "Verifique seu email para confirmar." });
        setIsLogin(true);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: "Informe seu email", description: "Digite seu email acima para receber o link de redefinição.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada para redefinir a senha." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src={logo} alt="Agend.me" className="h-14 w-14 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">Agend.me</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label className="text-sm">Nome</Label>
                  <Input id="input-client-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="mt-1 h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-sm">Telefone</Label>
                  <Input id="input-client-telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1 h-11 rounded-xl" />
                </div>
              </>
            )}
            <div>
              <Label className="text-sm">Email</Label>
              <Input id="input-client-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm">Senha</Label>
              <Input id="input-client-senha" value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="••••••••" className="mt-1 h-11 rounded-xl" />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold" disabled={loading}>
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Não tem conta? " : "Já tem conta? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>

        {isLogin && (
          <p className="text-center">
            <button
              id="btn-esqueci-senha-client"
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              disabled={loading}
            >
              Esqueci minha senha
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
