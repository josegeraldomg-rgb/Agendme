import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Empresa } from "./EmpresaContext";

interface ClientEmpresaContextType {
  empresa: Empresa | null;
  slug: string;
  loading: boolean;
}

const ClientEmpresaContext = createContext<ClientEmpresaContextType>({ empresa: null, slug: "", loading: true });

export function ClientEmpresaProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchEmpresa = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("slug", slug)
        .in("status", ["ativa", "trial"])
        .single();

      if (!error && data) {
        setEmpresa({
          id: data.id,
          nome: data.nome,
          slug: data.slug,
          email: data.email,
          telefone: data.telefone,
          plano: data.plano,
          status: data.status,
          logo_url: data.logo_url,
          dominio_customizado: data.dominio_customizado,
          subdominio: data.subdominio,
          config: (data.config as Record<string, unknown>) || {},
          limites: (data.limites as any) || {},
          white_label: (data.white_label as Record<string, unknown>) || {},
          created_at: data.created_at,
        });
      }
      setLoading(false);
    };

    fetchEmpresa();
  }, [slug]);

  return (
    <ClientEmpresaContext.Provider value={{ empresa, slug: slug || "", loading }}>
      {children}
    </ClientEmpresaContext.Provider>
  );
}

export function useClientEmpresa() {
  return useContext(ClientEmpresaContext);
}
