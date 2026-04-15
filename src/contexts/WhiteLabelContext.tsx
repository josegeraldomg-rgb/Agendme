import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";

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
  isLoading: boolean;
  updateConfig: (patch: Partial<WhiteLabelConfig>) => void;
  saveConfig: () => void;
  resetToDefault: () => void;
  applyTheme: (config: WhiteLabelConfig) => void;
  isSaving: boolean;
}

export const defaultConfig: WhiteLabelConfig = {
  empresaId: "",
  nomeExibicao: "",
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
  if (cfg.corPrimaria && /^#[0-9A-Fa-f]{6}$/.test(cfg.corPrimaria)) {
    root.style.setProperty("--primary", hexToHsl(cfg.corPrimaria));
    root.style.setProperty("--ring", hexToHsl(cfg.corPrimaria));
    root.style.setProperty("--sidebar-primary", hexToHsl(cfg.corPrimaria));
  }
  if (cfg.corSecundaria && /^#[0-9A-Fa-f]{6}$/.test(cfg.corSecundaria)) {
    root.style.setProperty("--accent", hexToHsl(cfg.corSecundaria));
  }
  if (cfg.corFundo && /^#[0-9A-Fa-f]{6}$/.test(cfg.corFundo)) {
    root.style.setProperty("--background", hexToHsl(cfg.corFundo));
  }
  if (cfg.corTexto && /^#[0-9A-Fa-f]{6}$/.test(cfg.corTexto)) {
    root.style.setProperty("--foreground", hexToHsl(cfg.corTexto));
  }
}

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const empresaId = useEmpresaId();
  const queryClient = useQueryClient();
  const [localConfig, setLocalConfig] = useState<WhiteLabelConfig>(defaultConfig);

  // ── Load from Supabase (empresas.white_label) ──
  const { isLoading } = useQuery({
    queryKey: ["white_label", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, white_label")
        .eq("id", empresaId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
    onSuccess: (data: { id: string; nome: string; white_label?: Record<string, unknown> } | null) => {
      if (!data) return;
      const wl = data.white_label as Partial<WhiteLabelConfig> | null;
      const merged: WhiteLabelConfig = {
        ...defaultConfig,
        ...(wl || {}),
        empresaId: data.id,
        nomeExibicao: (wl as { nomeExibicao?: string })?.nomeExibicao || data.nome || "",
      };
      setLocalConfig(merged);
      applyCSS(merged);
    },
  } as Parameters<typeof useQuery>[0]);

  // ── Save to Supabase ──
  const saveMutation = useMutation({
    mutationFn: async (cfg: WhiteLabelConfig) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { error } = await supabase
        .from("empresas")
        .update({ white_label: cfg as unknown as Record<string, unknown>, nome: cfg.nomeExibicao || undefined })
        .eq("id", empresaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["white_label"] });
      toast({ title: "Configurações salvas!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });

  useEffect(() => { applyCSS(localConfig); }, [localConfig]);

  const updateConfig = useCallback((patch: Partial<WhiteLabelConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const saveConfig = useCallback(() => {
    saveMutation.mutate(localConfig);
  }, [localConfig, saveMutation]);

  const resetToDefault = useCallback(() => {
    setLocalConfig(prev => ({ ...defaultConfig, empresaId: prev.empresaId }));
    const root = document.documentElement;
    ["--primary", "--ring", "--sidebar-primary", "--accent", "--background", "--foreground"].forEach(
      v => root.style.removeProperty(v)
    );
  }, []);

  const applyTheme = useCallback((cfg: WhiteLabelConfig) => {
    setLocalConfig(cfg);
  }, []);

  return (
    <WhiteLabelContext.Provider value={{
      config: localConfig,
      isLoading,
      updateConfig,
      saveConfig,
      resetToDefault,
      applyTheme,
      isSaving: saveMutation.isPending,
    }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const ctx = useContext(WhiteLabelContext);
  if (!ctx) throw new Error("useWhiteLabel must be used within WhiteLabelProvider");
  return ctx;
}
