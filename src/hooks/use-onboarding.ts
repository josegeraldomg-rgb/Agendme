import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface EmpresaFormData {
  nome: string;
  slug: string;
  email: string;
  telefone: string;
  segmento: string;
}

export interface AparenciaFormData {
  corPrimaria: string;
  nomeExibicao: string;
}

export interface ProfissionalFormData {
  nome: string;
  email: string;
  especialidade: string;
  comissaoPercentual: number;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function useOnboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const completarOnboarding = async (
    empresa: EmpresaFormData,
    aparencia: AparenciaFormData,
    profissional: ProfissionalFormData
  ) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // ── 1. Criar empresa ──────────────────────────────────────────────────
      const empresaId = crypto.randomUUID(); // Gerado no frontend para não dependermos do retorno barrado pelo RLS

      const { error: empresaError } = await supabase
        .from("empresas")
        .insert({
          id: empresaId,
          nome: empresa.nome,
          slug: empresa.slug,
          email: empresa.email || null,
          telefone: empresa.telefone || null,
          config: { segmento: empresa.segmento },
          white_label: {
            cor_primaria: aparencia.corPrimaria,
            cor_secundaria: aparencia.corPrimaria,
            nome_exibicao: aparencia.nomeExibicao || empresa.nome,
            fonte: "Inter",
            cor_fundo: "#ffffff",
            cor_texto: "#1a1a2e",
            favicon_url: null,
            logo_login_url: null,
          },
          status: "trial",
          plano: "basico",
        });

      if (empresaError) {
        // Slug duplicado é o erro mais comum
        if (empresaError.code === "23505") {
          throw new Error("Esse endereço já está em uso. Escolha um endereço diferente para sua clínica.");
        }
        throw empresaError;
      }

      // ── 2. Vincular profile → empresa ────────────────────────────────────
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ empresa_id: empresaId })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // ── 2.5 Atualizar a sessão local (JWT Metadata) ──────────────────────
      await supabase.auth.updateUser({
        data: { empresa_id: empresaId }
      });

      // ── 3. Criar primeiro profissional ───────────────────────────────────
      //   get_user_empresa_id() agora retorna empresaId pois o profile foi atualizado
      const { error: profError } = await supabase
        .from("profissionais_clinica")
        .insert({
          empresa_id: empresaId,
          user_id: user.id,
          nome: profissional.nome,
          email: profissional.email || null,
          especialidades: profissional.especialidade
            ? [profissional.especialidade]
            : [],
          comissao_percentual: profissional.comissaoPercentual,
        });

      if (profError) throw profError;

      // ── 4. Atualizar contexto e navegar ──────────────────────────────────
      await refreshProfile();

      toast({
        title: "Clínica configurada com sucesso! 🎉",
        description: "Bem-vindo ao AgendMe. Seu período trial está ativo.",
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Erro ao configurar clínica",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { completarOnboarding, loading };
}
