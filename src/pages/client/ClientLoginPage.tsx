import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    toast({ title: isLogin ? "Login realizado!" : "Conta criada com sucesso!" });
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Agend.me</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <Label className="text-sm">Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="mt-1 h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm">Telefone</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1 h-11 rounded-xl" />
              </div>
            </>
          )}
          <div>
            <Label className="text-sm">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm">Senha</Label>
            <Input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="••••••••" className="mt-1 h-11 rounded-xl" />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold">
            {isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Não tem conta? " : "Já tem conta? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>

        {isLogin && (
          <p className="text-center">
            <button className="text-xs text-muted-foreground hover:text-primary">Esqueci minha senha</button>
          </p>
        )}
      </div>
    </div>
  );
}
