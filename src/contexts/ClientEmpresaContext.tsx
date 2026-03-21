import { createContext, useContext, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { mockEmpresas, type Empresa } from "./EmpresaContext";

interface ClientEmpresaContextType {
  empresa: Empresa | null;
  slug: string;
}

const ClientEmpresaContext = createContext<ClientEmpresaContextType>({ empresa: null, slug: "" });

export function ClientEmpresaProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const empresa = mockEmpresas.find((e) => e.slug === slug) || null;

  return (
    <ClientEmpresaContext.Provider value={{ empresa, slug: slug || "" }}>
      {children}
    </ClientEmpresaContext.Provider>
  );
}

export function useClientEmpresa() {
  return useContext(ClientEmpresaContext);
}
