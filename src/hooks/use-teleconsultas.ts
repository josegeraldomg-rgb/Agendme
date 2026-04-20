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
  });
}

export function useCreateTeleconsulta() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const empresaId = session?.user?.user_metadata?.empresa_id;

  return useMutation({
    mutationFn: async ({ paciente_id, profissional_id, data, hora }: {
      paciente_id: string;
      profissional_id: string;
      data: string;
      hora: string;
    }) => {
      if (!empresaId) throw new Error("Empresa não encontrada");

      // Gerar sala Jitsi com ID único
      const salaId = `agendme-${empresaId.slice(0, 8)}-${Date.now()}`;
      const linkSala = `https://meet.jit.si/${salaId}`;

      const { error } = await supabase.from("teleconsultas").insert({
        empresa_id: empresaId,
        paciente_id,
        profissional_id,
        data,
        hora,
        link_sala: linkSala,
        link_sala_paciente: linkSala,
        sala_id_externo: salaId,
        provedor: "jitsi",
        status: "criada",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teleconsultas"] });
      toast({ title: "Teleconsulta criada!", description: "O link da sala foi gerado automaticamente." });
    },
    onError: (e: Error) => toast({ title: "Erro ao criar", description: e.message, variant: "destructive" }),
  });
}
