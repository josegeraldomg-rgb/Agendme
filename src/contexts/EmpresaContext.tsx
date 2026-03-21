import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  email: string;
  telefone: string;
  plano: string;
  status: "ativa" | "suspensa" | "cancelada" | "inadimplente";
  logo?: string;
}

interface EmpresaContextType {
  empresa: Empresa | null;
  setEmpresa: (empresa: Empresa | null) => void;
  empresas: Empresa[];
  switchEmpresa: (id: string) => void;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

// Mock empresas — will be replaced by DB data
const mockEmpresas: Empresa[] = [
  { id: "e1", nome: "Clínica Beleza Pura", slug: "beleza-pura", email: "contato@belezapura.com", telefone: "(11) 3333-4444", plano: "Profissional", status: "ativa" },
  { id: "e2", nome: "Studio Ana Costa", slug: "studio-ana", email: "ana@studio.com", telefone: "(21) 2222-5555", plano: "Básico", status: "ativa" },
  { id: "e3", nome: "Estética Renovar", slug: "estetica-renovar", email: "admin@renovar.com", telefone: "(31) 8888-9999", plano: "Premium", status: "ativa" },
  { id: "e4", nome: "Espaço Zen", slug: "espaco-zen", email: "contato@zen.com", telefone: "(11) 7777-1111", plano: "Básico", status: "inadimplente" },
  { id: "e5", nome: "Clínica Derma+", slug: "derma-plus", email: "adm@dermaplus.com", telefone: "(41) 6666-2222", plano: "Profissional", status: "ativa" },
  { id: "e7", nome: "Clínica Vitalidade", slug: "vitalidade", email: "contato@vitalidade.com", telefone: "(11) 4444-6666", plano: "Premium", status: "ativa" },
];

export function EmpresaProvider({ children, initialEmpresaId }: { children: ReactNode; initialEmpresaId?: string }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(
    mockEmpresas.find((e) => e.id === (initialEmpresaId || "e1")) || mockEmpresas[0]
  );

  const switchEmpresa = useCallback((id: string) => {
    const found = mockEmpresas.find((e) => e.id === id);
    if (found) setEmpresa(found);
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, setEmpresa, empresas: mockEmpresas, switchEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}

export { mockEmpresas };
