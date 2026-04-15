import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

// ── Todas as empresas (para saas_owner) ──
export function useSaasEmpresas(search?: string) {
  return useQuery({
    queryKey: ["saas_empresas", search],
    queryFn: async () => {
      let query = supabase
        .from("empresas")
        .select("id, nome, slug, email, telefone, plano, status, created_at, logo_url")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      if (search) {
        const s = search.toLowerCase();
        return (data || []).filter(
          (e) => e.nome.toLowerCase().includes(s) || (e.email || "").toLowerCase().includes(s)
        );
      }
      return data || [];
    },
  });
}

// ── KPIs do dashboard SaaS ──
export function useSaasKpis() {
  return useQuery({
    queryKey: ["saas_kpis"],
    queryFn: async () => {
      const { data: empresas, error } = await supabase
        .from("empresas")
        .select("id, status, plano, created_at");
      if (error) throw error;

      const total = empresas?.length || 0;
      const ativas = empresas?.filter((e) => e.status === "ativa").length || 0;
      const inadimplentes = empresas?.filter((e) => e.status === "inadimplente").length || 0;
      const suspensas = empresas?.filter((e) => e.status === "suspensa").length || 0;

      // Empresas novas este mês
      const inicioMes = startOfMonth(new Date());
      const novasMes = empresas?.filter((e) => new Date(e.created_at) >= inicioMes).length || 0;

      // MRR: somar cobranças pagas deste mês via saas_pagamentos
      const { data: pgtos } = await supabase
        .from("saas_pagamentos")
        .select("valor")
        .eq("status", "pago")
        .gte("data_vencimento", format(inicioMes, "yyyy-MM-dd"));

      const mrr = pgtos?.reduce((sum, p) => sum + Number(p.valor || 0), 0) || 0;

      return { total, ativas, inadimplentes, suspensas, novasMes, mrr };
    },
  });
}

// ── Receita mensal (últimos 6 meses) via saas_pagamentos ──
export function useSaasReceitaMensal() {
  return useQuery({
    queryKey: ["saas_receita_mensal"],
    queryFn: async () => {
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const ref = subMonths(new Date(), i);
        const inicio = format(startOfMonth(ref), "yyyy-MM-dd");
        const fim = format(endOfMonth(ref), "yyyy-MM-dd");

        const { data } = await supabase
          .from("saas_pagamentos")
          .select("valor")
          .eq("status", "pago")
          .gte("data_vencimento", inicio)
          .lte("data_vencimento", fim);

        const receita = data?.reduce((sum, p) => sum + Number(p.valor || 0), 0) || 0;
        const mes = ref.toLocaleDateString("pt-BR", { month: "short" });
        meses.push({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), receita });
      }
      return meses;
    },
  });
}

// ── Crescimento de empresas (últimos 6 meses) ──
export function useSaasEmpresasCrescimento() {
  return useQuery({
    queryKey: ["saas_crescimento"],
    queryFn: async () => {
      const { data: empresas } = await supabase
        .from("empresas")
        .select("created_at");

      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const ref = subMonths(new Date(), i);
        const inicio = startOfMonth(ref);
        const fim = endOfMonth(ref);
        const count = (empresas || []).filter((e) => {
          const d = new Date(e.created_at);
          return d >= inicio && d <= fim;
        }).length;
        const acumulado = (empresas || []).filter((e) => new Date(e.created_at) <= fim).length;
        const mes = ref.toLocaleDateString("pt-BR", { month: "short" });
        meses.push({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), empresas: acumulado, novas: count });
      }
      return meses;
    },
  });
}

// ── Pagamentos SaaS ──
export function useSaasPagamentos(statusFilter?: string) {
  return useQuery({
    queryKey: ["saas_pagamentos", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("saas_pagamentos")
        .select("id, empresa_id, valor, status, plano, metodo_pagamento, data_vencimento, data_pagamento, descricao, empresas(nome)")
        .order("data_vencimento", { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== "todos") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Atualizar status de empresa ──
export function useUpdateEmpresaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ empresaId, status }: { empresaId: string; status: string }) => {
      const { error } = await supabase
        .from("empresas")
        .update({ status })
        .eq("id", empresaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas_empresas"] });
      queryClient.invalidateQueries({ queryKey: ["saas_kpis"] });
      toast({ title: "Status atualizado! ✅" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });
}

// ── Atualizar permissões/config da empresa ──
export function useUpdateEmpresaConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ empresaId, config }: { empresaId: string; config: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("empresas")
        .update({ config })
        .eq("id", empresaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas_empresas"] });
      toast({ title: "Configurações salvas! ✅" });
    },
    onError: (e: Error) => toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });
}

// ── Logs globais (audit_log sem filtro de empresa) ──
export function useSaasAuditLogs(limit = 50, origemFilter?: string) {
  return useQuery({
    queryKey: ["saas_audit_logs", origemFilter, limit],
    queryFn: async () => {
      let query = supabase
        .from("audit_log")
        .select("id, empresa_id, user_id, acao, tabela, origem, ip, created_at, empresas(nome)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (origemFilter && origemFilter !== "todos") {
        query = query.eq("origem", origemFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
