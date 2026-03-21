import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface TenantConfig {
  timezone: string;
  idioma: string;
  formatoData: string;
  moeda: string;
}

export interface TenantLimites {
  maxUsuarios: number;
  maxAgendamentosMes: number;
  armazenamentoMb: number;
  usoIaHabilitado: boolean;
  teleconsultaHabilitada: boolean;
  whatsappHabilitado: boolean;
}

export interface TenantMetrica {
  nome: string;
  valor: number;
  limite?: number;
}

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  email: string;
  telefone: string;
  plano: string;
  status: "ativa" | "suspensa" | "cancelada" | "inadimplente";
  logo?: string;
  dominio?: string;
  subdominio?: string;
  config: TenantConfig;
  limites: TenantLimites;
  metricas: TenantMetrica[];
  criadoEm: string;
}

interface EmpresaContextType {
  empresa: Empresa | null;
  setEmpresa: (empresa: Empresa | null) => void;
  empresas: Empresa[];
  switchEmpresa: (id: string) => void;
  isTenantActive: () => boolean;
  checkLimit: (resource: keyof TenantLimites, currentUsage?: number) => boolean;
}

const defaultConfig: TenantConfig = {
  timezone: "America/Sao_Paulo",
  idioma: "pt-BR",
  formatoData: "DD/MM/YYYY",
  moeda: "BRL",
};

const planLimits: Record<string, TenantLimites> = {
  Básico: { maxUsuarios: 3, maxAgendamentosMes: 200, armazenamentoMb: 500, usoIaHabilitado: false, teleconsultaHabilitada: false, whatsappHabilitado: true },
  Profissional: { maxUsuarios: 10, maxAgendamentosMes: 1000, armazenamentoMb: 2000, usoIaHabilitado: true, teleconsultaHabilitada: true, whatsappHabilitado: true },
  Premium: { maxUsuarios: 50, maxAgendamentosMes: 5000, armazenamentoMb: 10000, usoIaHabilitado: true, teleconsultaHabilitada: true, whatsappHabilitado: true },
};

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

const mockEmpresas: Empresa[] = [
  {
    id: "e1", nome: "Clínica Beleza Pura", slug: "beleza-pura", email: "contato@belezapura.com", telefone: "(11) 3333-4444",
    plano: "Profissional", status: "ativa", subdominio: "beleza-pura", dominio: "",
    config: { ...defaultConfig }, limites: planLimits["Profissional"],
    metricas: [{ nome: "Usuários", valor: 6, limite: 10 }, { nome: "Agendamentos/mês", valor: 342, limite: 1000 }, { nome: "Armazenamento (MB)", valor: 845, limite: 2000 }, { nome: "Pacientes", valor: 245 }],
    criadoEm: "2026-01-18",
  },
  {
    id: "e2", nome: "Studio Ana Costa", slug: "studio-ana", email: "ana@studio.com", telefone: "(21) 2222-5555",
    plano: "Básico", status: "ativa", subdominio: "studio-ana", dominio: "",
    config: { ...defaultConfig }, limites: planLimits["Básico"],
    metricas: [{ nome: "Usuários", valor: 2, limite: 3 }, { nome: "Agendamentos/mês", valor: 89, limite: 200 }, { nome: "Armazenamento (MB)", valor: 120, limite: 500 }, { nome: "Pacientes", valor: 78 }],
    criadoEm: "2026-02-10",
  },
  {
    id: "e3", nome: "Estética Renovar", slug: "estetica-renovar", email: "admin@renovar.com", telefone: "(31) 8888-9999",
    plano: "Premium", status: "ativa", subdominio: "estetica-renovar", dominio: "agenda.renovar.com.br",
    config: { ...defaultConfig }, limites: planLimits["Premium"],
    metricas: [{ nome: "Usuários", valor: 18, limite: 50 }, { nome: "Agendamentos/mês", valor: 1850, limite: 5000 }, { nome: "Armazenamento (MB)", valor: 3200, limite: 10000 }, { nome: "Pacientes", valor: 520 }],
    criadoEm: "2026-03-12",
  },
  {
    id: "e4", nome: "Espaço Zen", slug: "espaco-zen", email: "contato@zen.com", telefone: "(11) 7777-1111",
    plano: "Básico", status: "inadimplente", subdominio: "espaco-zen", dominio: "",
    config: { ...defaultConfig }, limites: planLimits["Básico"],
    metricas: [{ nome: "Usuários", valor: 3, limite: 3 }, { nome: "Agendamentos/mês", valor: 45, limite: 200 }, { nome: "Armazenamento (MB)", valor: 280, limite: 500 }, { nome: "Pacientes", valor: 95 }],
    criadoEm: "2025-12-05",
  },
  {
    id: "e5", nome: "Clínica Derma+", slug: "derma-plus", email: "adm@dermaplus.com", telefone: "(41) 6666-2222",
    plano: "Profissional", status: "ativa", subdominio: "derma-plus", dominio: "",
    config: { ...defaultConfig }, limites: planLimits["Profissional"],
    metricas: [{ nome: "Usuários", valor: 8, limite: 10 }, { nome: "Agendamentos/mês", valor: 720, limite: 1000 }, { nome: "Armazenamento (MB)", valor: 1500, limite: 2000 }, { nome: "Pacientes", valor: 312 }],
    criadoEm: "2026-03-08",
  },
  {
    id: "e7", nome: "Clínica Vitalidade", slug: "vitalidade", email: "contato@vitalidade.com", telefone: "(11) 4444-6666",
    plano: "Premium", status: "ativa", subdominio: "vitalidade", dominio: "",
    config: { ...defaultConfig }, limites: planLimits["Premium"],
    metricas: [{ nome: "Usuários", valor: 22, limite: 50 }, { nome: "Agendamentos/mês", valor: 2100, limite: 5000 }, { nome: "Armazenamento (MB)", valor: 4800, limite: 10000 }, { nome: "Pacientes", valor: 680 }],
    criadoEm: "2026-01-15",
  },
];

export function EmpresaProvider({ children, initialEmpresaId }: { children: ReactNode; initialEmpresaId?: string }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(
    mockEmpresas.find((e) => e.id === (initialEmpresaId || "e1")) || mockEmpresas[0]
  );

  const switchEmpresa = useCallback((id: string) => {
    const found = mockEmpresas.find((e) => e.id === id);
    if (found) setEmpresa(found);
  }, []);

  const isTenantActive = useCallback(() => {
    return empresa?.status === "ativa";
  }, [empresa]);

  const checkLimit = useCallback((resource: keyof TenantLimites, _currentUsage?: number) => {
    if (!empresa) return false;
    const limit = empresa.limites[resource];
    if (typeof limit === "boolean") return limit;
    return true;
  }, [empresa]);

  return (
    <EmpresaContext.Provider value={{ empresa, setEmpresa, empresas: mockEmpresas, switchEmpresa, isTenantActive, checkLimit }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}

export { mockEmpresas, planLimits };
