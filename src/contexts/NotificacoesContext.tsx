import { createContext, useContext, ReactNode, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type NotificacaoTipo = "sistema" | "agenda" | "financeiro" | "whatsapp" | "administrativo";
export type NotificacaoStatus = "nao_lida" | "lida";

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: NotificacaoTipo;
  prioridade: "baixa" | "media" | "alta";
  status: NotificacaoStatus;
  criadoEm: string;
  acao_url?: string | null;
}

interface NotificacoesContextType {
  notificacoes: Notificacao[];
  unreadCount: number;
  isLoading: boolean;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  adicionarNotificacao: (n: Omit<Notificacao, "id" | "status" | "criadoEm">) => void;
  remover: (id: string) => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | null>(null);

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Fetch notifications from Supabase ──
  const { data: rawNotificacoes = [], isLoading } = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Map DB rows to context shape
  const notificacoes: Notificacao[] = rawNotificacoes.map((n) => ({
    id: n.id,
    titulo: n.titulo,
    mensagem: n.conteudo || "",
    tipo: (n.categoria as NotificacaoTipo) || "sistema",
    prioridade: "media",
    status: n.lida ? "lida" : "nao_lida",
    criadoEm: new Date(n.created_at).toLocaleString("pt-BR"),
    acao_url: n.acao_url,
  }));

  const unreadCount = notificacoes.filter((n) => n.status === "nao_lida").length;

  // ── Mutations ──
  const marcarLidaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificacoes"] }),
  });

  const marcarTodasLidasMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("user_id", user.id)
        .eq("lida", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificacoes"] }),
  });

  const adicionarMutation = useMutation({
    mutationFn: async (n: Omit<Notificacao, "id" | "status" | "criadoEm">) => {
      if (!user?.id) return;
      const { error } = await supabase.from("notificacoes").insert({
        user_id: user.id,
        titulo: n.titulo,
        conteudo: n.mensagem,
        tipo: "info",
        categoria: n.tipo,
        lida: false,
        acao_url: n.acao_url,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificacoes"] }),
  });

  const removerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notificacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificacoes"] }),
  });

  const marcarLida = useCallback((id: string) => marcarLidaMutation.mutate(id), [marcarLidaMutation]);
  const marcarTodasLidas = useCallback(() => marcarTodasLidasMutation.mutate(), [marcarTodasLidasMutation]);
  const adicionarNotificacao = useCallback((n: Omit<Notificacao, "id" | "status" | "criadoEm">) => adicionarMutation.mutate(n), [adicionarMutation]);
  const remover = useCallback((id: string) => removerMutation.mutate(id), [removerMutation]);

  return (
    <NotificacoesContext.Provider value={{ notificacoes, unreadCount, isLoading, marcarLida, marcarTodasLidas, adicionarNotificacao, remover }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export const useNotificacoes = () => {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes must be used within NotificacoesProvider");
  return ctx;
};
