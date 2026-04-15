import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";

// ── Ausências ──

export function useAusencias(profissionalId?: string) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["ausencias", empresaId, profissionalId],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("ausencias")
        .select("*, profissionais_clinica(id, nome)")
        .eq("empresa_id", empresaId)
        .order("data_inicio", { ascending: false });

      if (profissionalId) query = query.eq("profissional_id", profissionalId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCreateAusencia() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (ausencia: {
      profissional_id: string;
      data_inicio: string;
      data_fim: string;
      dia_todo?: boolean;
      hora_inicio?: string | null;
      hora_fim?: string | null;
      motivo?: string;
      tipo?: string;
    }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("ausencias")
        .insert({ ...ausencia, empresa_id: empresaId })
        .select("*, profissionais_clinica(id, nome)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      toast({ title: "Ausência registrada!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao registrar ausência", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteAusencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ausencias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ausencias"] });
      toast({ title: "Ausência removida!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });
}

// ── Feriados ──

export function useFeriados() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["feriados", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("feriados")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCreateFeriado() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (feriado: { data: string; nome: string; recorrente?: boolean }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("feriados")
        .insert({ ...feriado, empresa_id: empresaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({ title: "Feriado adicionado!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao criar feriado", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteFeriado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feriados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast({ title: "Feriado removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });
}
