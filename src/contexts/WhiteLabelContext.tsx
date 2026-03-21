import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface WhiteLabelConfig {
  empresaId: string;
  nomeExibicao: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  corFundo: string;
  logoUrl: string;
  faviconUrl: string;
  imagemTopoUrl: string;
}

interface WhiteLabelContextType {
  config: WhiteLabelConfig;
  updateConfig: (patch: Partial<WhiteLabelConfig>) => void;
  resetToDefault: () => void;
  applyTheme: (config: WhiteLabelConfig) => void;
}

const defaultConfig: WhiteLabelConfig = {
  empresaId: "e1",
  nomeExibicao: "Clínica Beleza Pura",
  corPrimaria: "#0EA5E9",
  corSecundaria: "#E0F2FE",
  corTexto: "#1E293B",
  corFundo: "#F8FAFC",
  logoUrl: "",
  faviconUrl: "",
  imagemTopoUrl: "",
};

const WhiteLabelContext = createContext<WhiteLabelContextType | null>(null);

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyCSS(cfg: WhiteLabelConfig) {
  const root = document.documentElement;
  if (cfg.corPrimaria) {
    root.style.setProperty("--primary", hexToHsl(cfg.corPrimaria));
    root.style.setProperty("--ring", hexToHsl(cfg.corPrimaria));
    root.style.setProperty("--sidebar-primary", hexToHsl(cfg.corPrimaria));
  }
  if (cfg.corSecundaria) {
    root.style.setProperty("--accent", hexToHsl(cfg.corSecundaria));
  }
  if (cfg.corFundo) {
    root.style.setProperty("--background", hexToHsl(cfg.corFundo));
  }
  if (cfg.corTexto) {
    root.style.setProperty("--foreground", hexToHsl(cfg.corTexto));
  }
}

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);

  useEffect(() => { applyCSS(config); }, [config]);

  const updateConfig = useCallback((patch: Partial<WhiteLabelConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const resetToDefault = useCallback(() => {
    setConfig(defaultConfig);
    // Reset CSS vars
    const root = document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--sidebar-primary");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--background");
    root.style.removeProperty("--foreground");
  }, []);

  const applyTheme = useCallback((cfg: WhiteLabelConfig) => {
    setConfig(cfg);
  }, []);

  return (
    <WhiteLabelContext.Provider value={{ config, updateConfig, resetToDefault, applyTheme }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const ctx = useContext(WhiteLabelContext);
  if (!ctx) throw new Error("useWhiteLabel must be used within WhiteLabelProvider");
  return ctx;
}

export { defaultConfig };
