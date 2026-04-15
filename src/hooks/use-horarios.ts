import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";

export function useHorarios(profissionalId?: string) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["horarios", empresaId, profissionalId],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("horarios_funcionamento")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("dia_semana");

      if (profissionalId) query = query.eq("profissional_id", profissionalId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCreateHorario() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (horario: {
      profissional_id: string;
      dia_semana: number;
      hora_inicio: string;
      hora_fim: string;
      intervalo_minutos?: number;
      ativo?: boolean;
    }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("horarios_funcionamento")
        .insert({ ...horario, empresa_id: empresaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios"] });
      toast({ title: "Horário adicionado!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao criar horário", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      dia_semana?: number;
      hora_inicio?: string;
      hora_fim?: string;
      intervalo_minutos?: number;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("horarios_funcionamento")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios"] });
      toast({ title: "Horário atualizado!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("horarios_funcionamento").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios"] });
      toast({ title: "Horário removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });
}
