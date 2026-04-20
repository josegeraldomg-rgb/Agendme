import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
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

    // Failsafe: ensure loading always ends even if Supabase hangs
    const failsafe = setTimeout(() => setLoading(false), 5000);

    const fetchEmpresa = async () => {
      try {
        // Use direct REST API with anon key to bypass any active auth session's RLS context.
        // This ensures the public policy (empresas_select_by_slug_public) is always used,
        // even if a SaaS admin is logged in on the same browser.
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zopywhhhotwvnmynuirc.supabase.co";
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcHl3aGhob3R3dm5teW51aXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTMwMDUsImV4cCI6MjA5MTY4OTAwNX0.i0Z34J8pUpT0pOZFr4wFN89iSBD0_41NKtpKqRyg-To";
        
        const res = await fetch(
          `${supabaseUrl}/rest/v1/empresas?slug=eq.${encodeURIComponent(slug)}&status=in.(ativa,trial)&select=*&limit=1`,
          {
            headers: {
              "apikey": anonKey,
              "Accept": "application/json",
            },
          }
        );

        const rows = await res.json();
        const data = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

        if (data) {
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
      } catch (err) {
        console.warn("Erro ao buscar empresa por slug:", err);
      } finally {
        clearTimeout(failsafe);
        setLoading(false);
      }
    };

    fetchEmpresa();

    return () => clearTimeout(failsafe);
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
