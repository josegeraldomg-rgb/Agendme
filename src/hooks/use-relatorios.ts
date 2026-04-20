import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";

// ── KPIs gerais ──

export function useRelatoriosKpis() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_kpis", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;

      // Total de agendamentos (todos os status)
      const { count: totalAgendamentos } = await supabase
        .from("agendamentos_clinica")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId);

      // Agendamentos do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const { count: agendamentosMes } = await supabase
        .from("agendamentos_clinica")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .gte("data_hora", inicioMes.toISOString());

      // Mês anterior
      const inicioMesAnterior = new Date(inicioMes);
      inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1);
      const { count: agendamentosMesAnterior } = await supabase
        .from("agendamentos_clinica")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .gte("data_hora", inicioMesAnterior.toISOString())
        .lt("data_hora", inicioMes.toISOString());

      // Total de pacientes ativos
      const { count: totalPacientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("ativo", true);

      // Receita do mês atual (financeiro_receitas)
      const { data: receitaData } = await supabase
        .from("financeiro_receitas")
        .select("valor")
        .eq("empresa_id", empresaId)
        .eq("status", "recebido")
        .gte("data_vencimento", inicioMes.toISOString().split("T")[0]);

      const receitaMes = receitaData?.reduce((sum, r) => sum + Number(r.valor || 0), 0) || 0;

      // Receita do mês anterior
      const { data: receitaAnteriorData } = await supabase
        .from("financeiro_receitas")
        .select("valor")
        .eq("empresa_id", empresaId)
        .eq("status", "recebido")
        .gte("data_vencimento", inicioMesAnterior.toISOString().split("T")[0])
        .lt("data_vencimento", inicioMes.toISOString().split("T")[0]);

      const receitaMesAnterior = receitaAnteriorData?.reduce((sum, r) => sum + Number(r.valor || 0), 0) || 0;

      // Cancelamentos do mês
      const { count: cancelamentos } = await supabase
        .from("agendamentos_clinica")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("status", "cancelado")
        .gte("data_hora", inicioMes.toISOString());

      return {
        receitaMes,
        receitaMesAnterior,
        agendamentosMes: agendamentosMes || 0,
        agendamentosMesAnterior: agendamentosMesAnterior || 0,
        totalPacientes: totalPacientes || 0,
        cancelamentos: cancelamentos || 0,
        totalAgendamentos: totalAgendamentos || 0,
      };
    },
    enabled: !!empresaId,
  });
}

// ── Receita mensal (últimos 6 meses) ──

export function useReceitaMensal() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_receita_mensal", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const meses = [];
      const hoje = new Date();

      for (let i = 5; i >= 0; i--) {
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);

        const { data } = await supabase
          .from("financeiro_receitas")
          .select("valor")
          .eq("empresa_id", empresaId)
          .eq("status", "recebido")
          .gte("data_vencimento", inicio.toISOString().split("T")[0])
          .lte("data_vencimento", fim.toISOString().split("T")[0]);

        const receita = data?.reduce((sum, r) => sum + Number(r.valor || 0), 0) || 0;
        const mes = inicio.toLocaleDateString("pt-BR", { month: "short" });

        meses.push({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), receita });
      }

      return meses;
    },
    enabled: !!empresaId,
  });
}

// ── Desempenho dos profissionais ──

export function useDesempenhoProfissionais() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_desempenho_profs", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data: agendamentos } = await supabase
        .from("agendamentos_clinica")
        .select("profissional_id, status, profissionais_clinica(nome)")
        .eq("empresa_id", empresaId)
        .gte("data_hora", inicioMes.toISOString());

      if (!agendamentos) return [];

      // Group by profissional
      const grouped: Record<string, { nome: string; atendimentos: number; cancelamentos: number }> = {};
      for (const a of agendamentos) {
        const id = a.profissional_id;
        if (!id) continue;
        if (!grouped[id]) {
          grouped[id] = {
            nome: (a.profissionais_clinica as { nome?: string })?.nome || "Profissional",
            atendimentos: 0,
            cancelamentos: 0,
          };
        }
        if (a.status === "concluido") grouped[id].atendimentos++;
        if (a.status === "cancelado") grouped[id].cancelamentos++;
      }

      return Object.values(grouped)
        .sort((a, b) => b.atendimentos - a.atendimentos)
        .slice(0, 5);
    },
    enabled: !!empresaId,
  });
}

// ── Audit log ──

export function useAuditLog(limit = 50, modulo?: string) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["audit_log", empresaId, modulo, limit],
    queryFn: async () => {
      if (!empresaId) return [];

      let query = supabase
        .from("audit_log")
        .select("id, acao, tabela, ip, origem, created_at, user_id")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (modulo && modulo !== "todos") {
        query = query.eq("tabela", modulo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!empresaId,
  });
}

// ── Receita por meio de pagamento ──

const MEIO_PAGAMENTO_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao: "Cartão",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  mercado_pago: "Mercado Pago",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5, var(--muted-foreground)))",
];

export function useReceitaPorMeio() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_receita_por_meio", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data } = await supabase
        .from("financeiro_receitas")
        .select("valor, meio_pagamento")
        .eq("empresa_id", empresaId);

      const agrupado: Record<string, number> = {};
      for (const r of data || []) {
        const label = MEIO_PAGAMENTO_LABELS[r.meio_pagamento] ?? r.meio_pagamento;
        agrupado[label] = (agrupado[label] || 0) + Number(r.valor || 0);
      }

      return Object.entries(agrupado).map(([nome, valor], i) => ({
        nome,
        valor,
        cor: CHART_COLORS[i % CHART_COLORS.length],
      }));
    },
    enabled: !!empresaId,
  });
}

// ── Ocupação semanal ──

export function useOcupacaoSemanal() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_ocupacao_semanal", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

      // Buscar agendamentos do mês atual
      const inicio = new Date();
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);

      const { data: agendamentos } = await supabase
        .from("agendamentos_clinica")
        .select("data, status")
        .eq("empresa_id", empresaId)
        .gte("data", inicio.toISOString().split("T")[0]);

      const porDia: Record<string, { total: number; concluidos: number }> = {};
      for (const d of DIAS) porDia[d] = { total: 0, concluidos: 0 };

      for (const a of agendamentos || []) {
        const dia = DIAS[new Date(a.data + "T12:00:00").getDay()];
        porDia[dia].total++;
        if (a.status === "concluido" || a.status === "confirmado" || a.status === "em_atendimento") {
          porDia[dia].concluidos++;
        }
      }

      return ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => ({
        dia,
        ocupacao: porDia[dia].total > 0
          ? Math.round((porDia[dia].concluidos / porDia[dia].total) * 100)
          : 0,
      }));
    },
    enabled: !!empresaId,
  });
}

// ── Faltas vs confirmações por mês ──

export function useFaltasVsConfirmacoes() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_faltas_confirmacoes", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const hoje = new Date();
      const meses = [];

      for (let i = 5; i >= 0; i--) {
        const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);

        const { data } = await supabase
          .from("agendamentos_clinica")
          .select("status")
          .eq("empresa_id", empresaId)
          .gte("data", ref.toISOString().split("T")[0])
          .lte("data", fim.toISOString().split("T")[0]);

        const total = data?.length || 1;
        const faltas = data?.filter((a) => a.status === "faltou").length || 0;
        const confirmados = data?.filter((a) =>
          ["confirmado", "concluido", "em_atendimento"].includes(a.status)
        ).length || 0;

        const mes = ref.toLocaleDateString("pt-BR", { month: "short" });
        meses.push({
          mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3),
          faltas: Math.round((faltas / total) * 100),
          confirmados: Math.round((confirmados / total) * 100),
        });
      }

      return meses;
    },
    enabled: !!empresaId,
  });
}

// ── Crescimento de pacientes por mês ──

export function usePacientesCrescimento() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["relatorios_pacientes_crescimento", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data: clientes } = await supabase
        .from("clientes")
        .select("created_at, ativo")
        .eq("empresa_id", empresaId);

      const hoje = new Date();
      const meses = [];

      for (let i = 5; i >= 0; i--) {
        const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);

        const novos = (clientes || []).filter((c) => {
          const d = new Date(c.created_at);
          return d >= ref && d <= fim;
        }).length;

        const ativos = (clientes || []).filter((c) => {
          const d = new Date(c.created_at);
          return d <= fim && c.ativo;
        }).length;

        const mes = ref.toLocaleDateString("pt-BR", { month: "short" });
        meses.push({
          mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3),
          novos,
          ativos,
        });
      }

      return meses;
    },
    enabled: !!empresaId,
  });
}
