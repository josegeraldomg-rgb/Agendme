import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ClienteInsert = TablesInsert<"clientes">;
type ClienteUpdate = TablesUpdate<"clientes">;

export function useClientes(filters?: { ativo?: boolean; search?: string }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["clientes", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("clientes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("nome");

      if (filters?.ativo !== undefined) query = query.eq("ativo", filters.ativo);
      if (filters?.search) query = query.ilike("nome", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCliente(id?: string) {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (cliente: Omit<ClienteInsert, "empresa_id">) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("clientes")
        .insert({ ...cliente, empresa_id: empresaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Paciente cadastrado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao cadastrar paciente", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ClienteUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("clientes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast({ title: "Paciente atualizado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete: apenas desativa
      const { error } = await supabase
        .from("clientes")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Paciente desativado!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao desativar", description: error.message, variant: "destructive" });
    },
  });
}
