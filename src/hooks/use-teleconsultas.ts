import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useTeleconsultas(filterStatus?: string, searchTerm?: string) {
  const { session } = useAuth();
  const userData = session?.user?.user_metadata;
  const empresaId = userData?.empresa_id;

  return useQuery({
    queryKey: ["teleconsultas", empresaId, filterStatus, searchTerm],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("teleconsultas")
        .select(`
          *,
          pacientes (nome),
          profiles (nome)
        `)
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (filterStatus && filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data || [];
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        result = result.filter(t => t.pacientes?.nome?.toLowerCase().includes(s));
      }

      return result.map(t => ({
        ...t,
        paciente: t.pacientes?.nome || "Paciente não encontrado",
        profissional: t.profiles?.nome || "Profissional não encontrado",
      }));
    },
    enabled: !!empresaId,
  });
}

export function useUpdateTeleconsultaStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, iniciadaEm, encerradaEm, duracao }: { id: string, status: string, iniciadaEm?: string, encerradaEm?: string, duracao?: number }) => {
      const updates: any = { status };
      if (iniciadaEm) updates.iniciada_em = iniciadaEm;
      if (encerradaEm) updates.encerrada_em = encerradaEm;
      if (duracao !== undefined) updates.duracao_minutos = duracao;

      const { error } = await supabase
        .from("teleconsultas")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teleconsultas"] });
    },
    onError: (e: Error) => toast({ title: "Erro na sessão", description: e.message, variant: "destructive" }),
  });
}

export function useTeleconsultaChat(teleconsultaId: string) {
  return useQuery({
    queryKey: ["teleconsulta_chat", teleconsultaId],
    queryFn: async () => {
      if (!teleconsultaId) return [];
      const { data, error } = await supabase
        .from("teleconsulta_chat")
        .select("*")
        .eq("teleconsulta_id", teleconsultaId)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!teleconsultaId,
    // Polling if needed, but since Jitsi has chat we might just rely on real-time channels or just not use DB chat when active.
  });
}
