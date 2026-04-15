import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

// Tipo da empresa vindo do Supabase
type EmpresaRow = Tables<"empresas">;

export interface TenantConfig {
  timezone: string;
  idioma: string;
  formatoData: string;
  moeda: string;
}

export interface TenantLimites {
  max_profissionais: number;
  max_pacientes: number;
  max_agendamentos_mes: number;
  whatsapp_habilitado: boolean;
  teleconsulta_habilitada: boolean;
  agente_bolso_habilitado: boolean;
}

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  email: string | null;
  telefone: string | null;
  plano: string;
  status: string;
  logo_url: string | null;
  dominio_customizado: string | null;
  subdominio: string | null;
  config: Record<string, unknown>;
  limites: TenantLimites;
  white_label: Record<string, unknown>;
  created_at: string;
}

interface EmpresaContextType {
  empresa: Empresa | null;
  empresaId: string | null;
  loading: boolean;
  error: string | null;
  setEmpresa: (empresa: Empresa | null) => void;
  empresas: Empresa[];
  switchEmpresa: (id: string) => void;
  isTenantActive: () => boolean;
  checkLimit: (resource: keyof TenantLimites, currentUsage?: number) => boolean;
  refetch: () => void;
}

const defaultLimites: TenantLimites = {
  max_profissionais: 5,
  max_pacientes: 100,
  max_agendamentos_mes: 500,
  whatsapp_habilitado: false,
  teleconsulta_habilitada: false,
  agente_bolso_habilitado: false,
};

function parseEmpresaRow(row: EmpresaRow): Empresa {
  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    email: row.email,
    telefone: row.telefone,
    plano: row.plano,
    status: row.status,
    logo_url: row.logo_url,
    dominio_customizado: row.dominio_customizado,
    subdominio: row.subdominio,
    config: (row.config as Record<string, unknown>) || {},
    limites: (row.limites as unknown as TenantLimites) || defaultLimites,
    white_label: (row.white_label as Record<string, unknown>) || {},
    created_at: row.created_at,
  };
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresa = useCallback(async () => {
    if (!profile?.empresa_id) {
      setEmpresa(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", profile.empresa_id)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setEmpresa(parseEmpresaRow(data));
      }
    } catch (err) {
      console.error("Erro ao buscar empresa:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar empresa");
    } finally {
      setLoading(false);
    }
  }, [profile?.empresa_id]);

  // Buscar todas as empresas (para saas_owner)
  const fetchEmpresas = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");

      if (fetchError) throw fetchError;
      if (data) {
        setEmpresas(data.map(parseEmpresaRow));
      }
    } catch (err) {
      console.error("Erro ao buscar empresas:", err);
    }
  }, []);

  useEffect(() => {
    fetchEmpresa();
    fetchEmpresas();
  }, [fetchEmpresa, fetchEmpresas]);

  const switchEmpresa = useCallback(async (id: string) => {
    const found = empresas.find((e) => e.id === id);
    if (found) {
      setEmpresa(found);
      // Atualizar empresa_id no profile do usuário
      if (profile) {
        await supabase
          .from("profiles")
          .update({ empresa_id: id })
          .eq("id", profile.id);
      }
    }
  }, [empresas, profile]);

  const isTenantActive = useCallback(() => {
    return empresa?.status === "ativa";
  }, [empresa]);

  const checkLimit = useCallback((resource: keyof TenantLimites, _currentUsage?: number) => {
    if (!empresa) return false;
    const limit = empresa.limites[resource];
    if (typeof limit === "boolean") return limit;
    return true;
  }, [empresa]);

  const refetch = useCallback(() => {
    fetchEmpresa();
    fetchEmpresas();
  }, [fetchEmpresa, fetchEmpresas]);

  return (
    <EmpresaContext.Provider
      value={{
        empresa,
        empresaId: empresa?.id || null,
        loading,
        error,
        setEmpresa,
        empresas,
        switchEmpresa,
        isTenantActive,
        checkLimit,
        refetch,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}

// Hook helper: retorna empresa_id para queries
export function useEmpresaId(): string | null {
  const { empresaId } = useEmpresa();
  return empresaId;
}
