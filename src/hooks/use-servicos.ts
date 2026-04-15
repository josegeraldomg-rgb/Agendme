import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ServicoInsert = TablesInsert<"servicos">;
type ServicoUpdate = TablesUpdate<"servicos">;

export function useServicos(filters?: { categoria_id?: string; ativo?: boolean }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["servicos", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("servicos")
        .select("*, categorias_servicos(id, nome, cor, icone)")
        .eq("empresa_id", empresaId)
        .order("nome");

      if (filters?.categoria_id) query = query.eq("categoria_id", filters.categoria_id);
      if (filters?.ativo !== undefined) query = query.eq("ativo", filters.ativo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCategorias() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["categorias_servicos", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const { data, error } = await supabase
        .from("categorias_servicos")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCreateServico() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (servico: Omit<ServicoInsert, "empresa_id">) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("servicos")
        .insert({ ...servico, empresa_id: empresaId })
        .select()
        .single();
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
    mutationFn: async ({ id, ...updates }: ServicoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("servicos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
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
