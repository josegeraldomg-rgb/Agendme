import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAgendamentos(filters?: { data_aula?: string; turma_id?: string }) {
  return useQuery({
    queryKey: ["agendamentos", filters],
    queryFn: async () => {
      let query = supabase.from("agendamentos").select("*, turmas(nome, professor_id, servico_id)").order("data_aula", { ascending: false });
      if (filters?.data_aula) query = query.eq("data_aula", filters.data_aula);
      if (filters?.turma_id) query = query.eq("turma_id", filters.turma_id);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useProfessores() {
  return useQuery({
    queryKey: ["professores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("professores").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useTurmas() {
  return useQuery({
    queryKey: ["turmas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("turmas").select("*, servicos(nome), professores(nome)").order("nome");
      if (error) throw error;
      return data;
    },
  });
}
