import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

type ReceitaInsert = TablesInsert<"financeiro_receitas">;

// Hook para receitas financeiras (substitui useFaturas antigo)
export function useReceitas(filters?: { profissional_id?: string; periodo_inicio?: string; periodo_fim?: string }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["financeiro_receitas", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("financeiro_receitas")
        .select("*, clientes(id, nome), profissionais_clinica(id, nome), servicos(id, nome)")
        .eq("empresa_id", empresaId)
        .order("data_pagamento", { ascending: false });

      if (filters?.profissional_id) query = query.eq("profissional_id", filters.profissional_id);
      if (filters?.periodo_inicio) query = query.gte("data_pagamento", filters.periodo_inicio);
      if (filters?.periodo_fim) query = query.lte("data_pagamento", filters.periodo_fim);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

export function useCreateReceita() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (receita: Omit<ReceitaInsert, "empresa_id">) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      const { data, error } = await supabase
        .from("financeiro_receitas")
        .insert({ ...receita, empresa_id: empresaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro_receitas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ title: "Receita registrada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao registrar receita", description: error.message, variant: "destructive" });
    },
  });
}

// Dashboard stats — dados reais do Supabase
export function useDashboardStats() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["dashboard-stats", empresaId],
    queryFn: async () => {
      if (!empresaId) {
        return { totalClientes: 0, totalAgendamentos: 0, receitaTotal: 0, agendamentosHoje: 0 };
      }

      const hoje = new Date().toISOString().split("T")[0];

      const [clientesRes, agendamentosRes, receitasRes, agendamentosHojeRes] = await Promise.all([
        supabase
          .from("clientes")
          .select("id", { count: "exact", head: true })
          .eq("empresa_id", empresaId)
          .eq("ativo", true),
        supabase
          .from("agendamentos_clinica")
          .select("id", { count: "exact", head: true })
          .eq("empresa_id", empresaId),
        supabase
          .from("financeiro_receitas")
          .select("valor_final")
          .eq("empresa_id", empresaId),
        supabase
          .from("agendamentos_clinica")
          .select("id", { count: "exact", head: true })
          .eq("empresa_id", empresaId)
          .eq("data", hoje)
          .not("status", "in", "(cancelado_paciente,cancelado_clinica,faltou)"),
      ]);

      const totalClientes = clientesRes.count || 0;
      const totalAgendamentos = agendamentosRes.count || 0;
      const agendamentosHoje = agendamentosHojeRes.count || 0;
      const receitas = receitasRes.data || [];
      const receitaTotal = receitas.reduce((sum, r) => sum + Number(r.valor_final || 0), 0);

      return { totalClientes, totalAgendamentos, receitaTotal, agendamentosHoje };
    },
    enabled: !!empresaId,
  });
}

// Repasses para profissionais
export function useRepasses(filters?: { profissional_id?: string; status?: string }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["repasses", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [];
      let query = supabase
        .from("repasses")
        .select("*, profissionais_clinica(id, nome)")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (filters?.profissional_id) query = query.eq("profissional_id", filters.profissional_id);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });
}

// Backward compatibility — alias para código antigo
export const useFaturas = useReceitas;
