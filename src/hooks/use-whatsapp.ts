import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useWhatsAppConfig() {
  const { session } = useAuth();
  const userData = session?.user?.user_metadata;
  const empresaId = userData?.empresa_id;

  return useQuery({
    queryKey: ["whatsapp_config", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useUpdateWhatsAppConfig() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userData = session?.user?.user_metadata;
  const empresaId = userData?.empresa_id;

  return useMutation({
    mutationFn: async (updates: any) => {
      if (!empresaId) throw new Error("Sem empresa");
      const { data: existing } = await supabase.from("whatsapp_config").select("id").eq("empresa_id", empresaId).maybeSingle();

      if (existing) {
        const { error } = await supabase.from("whatsapp_config").update(updates).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("whatsapp_config").insert({ ...updates, empresa_id: empresaId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_config"] });
      toast({ title: "Configurações salvas!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });
}

export function useWhatsAppTemplates() {
  const { session } = useAuth();
  const userData = session?.user?.user_metadata;
  const empresaId = userData?.empresa_id;

  return useQuery({
    queryKey: ["whatsapp_templates", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!empresaId,
  });
}

export function useWhatsAppMensagens(searchTerm?: string, statusFilter?: string) {
  const { session } = useAuth();
  const userData = session?.user?.user_metadata;
  const empresaId = userData?.empresa_id;

  return useQuery({
    queryKey: ["whatsapp_mensagens", empresaId, searchTerm, statusFilter],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("whatsapp_mensagens")
        .select(`
          *,
          pacientes (nome)
        `)
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== "todos") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data || [];
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        result = result.filter(m => 
          (m.pacientes?.nome?.toLowerCase().includes(s)) ||
          (m.telefone?.includes(s))
        );
      }

      return result.map(m => ({
        ...m,
        paciente: m.pacientes?.nome || "Paciente Avulso",
      }));
    },
    enabled: !!empresaId,
  });
}

export function useWhatsAppStats() {
  const { session } = useAuth();
  const userData = session?.user?.user_metadata;
  const empresaId = userData?.empresa_id;

  return useQuery({
    queryKey: ["whatsapp_stats", empresaId],
    queryFn: async () => {
      if (!empresaId) return { enviadas: 0, taxaSucesso: 0, taxaFalha: 0, taxaConfirmacao: 0, pendentes: 0 };
      
      const { data, error } = await supabase
        .from("whatsapp_mensagens")
        .select("status, tipo")
        .eq("empresa_id", empresaId);
        
      if (error) throw error;

      const total = data?.length || 0;
      if (total === 0) return { enviadas: 0, taxaSucesso: 0, taxaFalha: 0, taxaConfirmacao: 0, pendentes: 0 };

      const enviadas = data.filter(d => d.status === "enviado" || d.status === "entregue" || d.status === "lido").length;
      const erros = data.filter(d => d.status === "erro").length;
      const pendentes = data.filter(d => d.status === "pendente" || d.status === "processando").length;
      
      const confimacoesTotal = data.filter(d => d.tipo === "confirmacao").length;
      const confirmada = data.filter(d => d.tipo === "confirmacao" && d.status !== "erro" && d.status !== "pendente").length;

      return {
        enviadas,
        pendentes,
        taxaSucesso: Math.round((enviadas / max(total - pendentes, 1)) * 100),
        taxaFalha: Math.round((erros / max(total - pendentes, 1)) * 100),
        taxaConfirmacao: confimacoesTotal > 0 ? Math.round((confirmada / confimacoesTotal) * 100) : 0,
      };
    },
    enabled: !!empresaId,
  });
}

function max(a: number, b: number) {
  return a > b ? a : b;
}
