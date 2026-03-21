import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFaturas(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["faturas", filters],
    queryFn: async () => {
      let query = supabase.from("faturas").select("*, clientes(nome, email)").order("data_vencimento", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status as "pago" | "pendente" | "vencido");
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [clientesRes, agendamentosRes, faturasRes] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("agendamentos").select("id", { count: "exact", head: true }),
        supabase.from("faturas").select("valor, status"),
      ]);

      const totalClientes = clientesRes.count || 0;
      const totalAgendamentos = agendamentosRes.count || 0;
      const faturas = faturasRes.data || [];
      const receitaTotal = faturas
        .filter((f) => f.status === "pago")
        .reduce((sum, f) => sum + Number(f.valor), 0);
      const faturasPendentes = faturas.filter((f) => f.status === "pendente").length;

      return { totalClientes, totalAgendamentos, receitaTotal, faturasPendentes };
    },
  });
}
