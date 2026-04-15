import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Agendamento = Tables<"agendamentos_clinica">;
type AgendamentoInsert = TablesInsert<"agendamentos_clinica">;
type AgendamentoUpdate = TablesUpdate<"agendamentos_clinica">;

export function useAgendamentos(filters?: { data?: string; profissional_id?: string; status?: string }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["agendamentos_clinica", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("agendamentos_clinica")
        .select("*, clientes(id, nome, email, telefone, foto_url), profissionais_clinica(id, nome, cor_agenda, especialidades), servicos(id, nome, duracao_minutos, preco_base)")
        .eq("empresa_id", empresaId)
        .order("data", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (filters?.data) query = query.eq("data", filters.data);
      if (filters?.profissional_id) query = query.eq("profissional_id", filters.profissional_id);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useAgendamentosByRange(startDate?: string, endDate?: string) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["agendamentos_clinica_range", empresaId, startDate, endDate],
    queryFn: async () => {
      if (!empresaId || !startDate || !endDate) return [];
      const { data, error } = await supabase
        .from("agendamentos_clinica")
        .select("*, clientes(id, nome, telefone), profissionais_clinica(id, nome, cor_agenda), servicos(id, nome, duracao_minutos)")
        .eq("empresa_id", empresaId)
        .gte("data", startDate)
        .lte("data", endDate)
        .order("data", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!empresaId && !!startDate && !!endDate,
  });
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (agendamento: Omit<AgendamentoInsert, "empresa_id">) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("agendamentos_clinica")
        .insert({ ...agendamento, empresa_id: empresaId })
        .select("*, clientes(nome), profissionais_clinica(nome), servicos(nome)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos_clinica"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Agendamento criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar agendamento", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AgendamentoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("agendamentos_clinica")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos_clinica"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Agendamento atualizado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useCancelAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivo, tipo }: { id: string; motivo?: string; tipo: "cancelado_paciente" | "cancelado_clinica" }) => {
      const { data, error } = await supabase
        .from("agendamentos_clinica")
        .update({
          status: tipo,
          cancelamento_motivo: motivo || null,
          cancelado_em: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos_clinica"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Agendamento cancelado." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" });
    },
  });
}

// Hooks para profissionais (movidos de use-agendamentos antigo)
export function useProfissionais() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["profissionais_clinica", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("profissionais_clinica")
        .select("*, profissional_servicos(servico_id, servicos(id, nome, duracao_minutos, preco_base))")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

// Horários de funcionamento
export function useHorariosFuncionamento(profissionalId?: string) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["horarios_funcionamento", empresaId, profissionalId],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("horarios_funcionamento")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("dia_semana")
        .order("hora_inicio");

      if (profissionalId) query = query.eq("profissional_id", profissionalId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}
