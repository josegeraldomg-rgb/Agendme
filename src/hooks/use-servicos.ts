import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useServicos() {
  return useQuery({
    queryKey: ["servicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (servico: { nome: string; descricao?: string; duracao_minutos?: number; preco_base?: number }) => {
      const { data, error } = await supabase.from("servicos").insert(servico).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      toast({ title: "Serviço criado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar serviço", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; nome?: string; descricao?: string; duracao_minutos?: number; preco_base?: number; ativo?: boolean }) => {
      const { data, error } = await supabase.from("servicos").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      toast({ title: "Serviço atualizado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}
