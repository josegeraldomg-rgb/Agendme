import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeioPagamento = "dinheiro" | "pix" | "cartao" | "mercado_pago";

export interface Receita {
  id: string;
  empresa_id: string;
  agendamento_id: string | null;
  paciente_id: string | null;
  profissional_id: string | null;
  servico_id: string | null;
  descricao: string | null;
  valor: number;
  desconto: number | null;
  valor_final: number | null;
  meio_pagamento: MeioPagamento;
  data_pagamento: string;       // date string yyyy-MM-dd
  data_competencia: string;     // date string yyyy-MM-dd
  comissao_empresa_perc: number | null;
  comissao_profissional_perc: number | null;
  comissao_empresa_valor: number | null;
  comissao_profissional_valor: number | null;
  categoria: string | null;
  observacoes: string | null;
  created_at: string;
  // relations
  clientes?: { nome: string } | null;
  profissionais_clinica?: { nome: string } | null;
  servicos?: { nome: string } | null;
}

export interface CreateReceitaInput {
  paciente_id?: string | null;
  profissional_id?: string | null;
  servico_id?: string | null;
  agendamento_id?: string | null;
  descricao?: string | null;
  valor: number;
  desconto?: number;
  meio_pagamento: MeioPagamento;
  data_pagamento: string;
  data_competencia?: string;
  comissao_empresa_perc?: number;
  comissao_profissional_perc?: number;
  categoria?: string | null;
  observacoes?: string | null;
}

export interface ComissaoConfig {
  id: string;
  empresa_id: string;
  tipo: string;               // "servico" | "pagamento" | "global"
  profissional_id: string | null;
  servico_id: string | null;
  meio_pagamento: string | null;
  referencia: string | null;
  perc_empresa: number;
  perc_profissional: number;
  ativo: boolean | null;
  // relations
  servicos?: { nome: string } | null;
}

export interface UpdateComissaoInput {
  id: string;
  perc_empresa: number;
  perc_profissional: number;
}

export interface Repasse {
  id: string;
  empresa_id: string;
  profissional_id: string;
  valor: number;
  periodo_inicio: string;
  periodo_fim: string;
  status: string;
  meio_pagamento: MeioPagamento | null;
  data_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
  // relations
  profissionais_clinica?: { nome: string } | null;
}

export interface CreateRepasseInput {
  profissional_id: string;
  valor: number;
  periodo_inicio: string;
  periodo_fim: string;
  meio_pagamento?: MeioPagamento;
  observacoes?: string;
}

// ─── Receitas ─────────────────────────────────────────────────────────────────

export function useReceitas(filters?: {
  profissional_id?: string;
  meio_pagamento?: MeioPagamento;
  data_inicio?: string;
  data_fim?: string;
}) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["receitas", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [] as Receita[];

      let query = supabase
        .from("financeiro_receitas")
        .select("*, clientes(nome), profissionais_clinica(nome), servicos(nome)")
        .eq("empresa_id", empresaId)
        .order("data_pagamento", { ascending: false });

      if (filters?.profissional_id) query = query.eq("profissional_id", filters.profissional_id);
      if (filters?.meio_pagamento) query = query.eq("meio_pagamento", filters.meio_pagamento);
      if (filters?.data_inicio) query = query.gte("data_pagamento", filters.data_inicio);
      if (filters?.data_fim) query = query.lte("data_pagamento", filters.data_fim);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Receita[];
    },
    enabled: !!empresaId,
  });
}

export function useCreateReceita() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (input: CreateReceitaInput) => {
      if (!empresaId) throw new Error("Empresa não encontrada");

      const valorFinal = input.valor - (input.desconto ?? 0);
      const comissaoEmpresaValor = input.comissao_empresa_perc
        ? (valorFinal * input.comissao_empresa_perc) / 100
        : null;
      const comissaoProfissionalValor = input.comissao_profissional_perc
        ? (valorFinal * input.comissao_profissional_perc) / 100
        : null;

      const { data, error } = await supabase
        .from("financeiro_receitas")
        .insert({
          empresa_id: empresaId,
          paciente_id: input.paciente_id ?? null,
          profissional_id: input.profissional_id ?? null,
          servico_id: input.servico_id ?? null,
          agendamento_id: input.agendamento_id ?? null,
          descricao: input.descricao ?? null,
          valor: input.valor,
          desconto: input.desconto ?? 0,
          valor_final: valorFinal,
          meio_pagamento: input.meio_pagamento,
          data_pagamento: input.data_pagamento,
          data_competencia: input.data_competencia ?? input.data_pagamento,
          comissao_empresa_perc: input.comissao_empresa_perc ?? null,
          comissao_profissional_perc: input.comissao_profissional_perc ?? null,
          comissao_empresa_valor: comissaoEmpresaValor,
          comissao_profissional_valor: comissaoProfissionalValor,
          categoria: input.categoria ?? null,
          observacoes: input.observacoes ?? null,
        })
        .select("*, clientes(nome), profissionais_clinica(nome), servicos(nome)")
        .single();

      if (error) throw error;
      return data as Receita;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Receita registrada!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao registrar receita", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteReceita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financeiro_receitas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
      toast({ title: "Receita removida" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover receita", description: error.message, variant: "destructive" });
    },
  });
}

// ─── Comissões Config ─────────────────────────────────────────────────────────

export function useComissoesConfig() {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["comissoes_config", empresaId],
    queryFn: async () => {
      if (!empresaId) return [] as ComissaoConfig[];
      const { data, error } = await supabase
        .from("comissoes_config")
        .select("*, servicos(nome)")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("tipo");
      if (error) throw error;
      return (data ?? []) as ComissaoConfig[];
    },
    enabled: !!empresaId,
  });
}

export function useUpdateComissaoConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, perc_empresa, perc_profissional }: UpdateComissaoInput) => {
      const { error } = await supabase
        .from("comissoes_config")
        .update({ perc_empresa, perc_profissional })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes_config"] });
      toast({ title: "Comissão atualizada ✅" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar comissão", description: error.message, variant: "destructive" });
    },
  });
}

// ─── Repasses ─────────────────────────────────────────────────────────────────

export function useRepasses(filters?: { profissional_id?: string }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["repasses", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [] as Repasse[];
      let query = supabase
        .from("repasses")
        .select("*, profissionais_clinica(nome)")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (filters?.profissional_id) query = query.eq("profissional_id", filters.profissional_id);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Repasse[];
    },
    enabled: !!empresaId,
  });
}

export function useCreateRepasse() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (input: CreateRepasseInput) => {
      if (!empresaId) throw new Error("Empresa não encontrada");
      const { data, error } = await supabase
        .from("repasses")
        .insert({
          empresa_id: empresaId,
          profissional_id: input.profissional_id,
          valor: input.valor,
          periodo_inicio: input.periodo_inicio,
          periodo_fim: input.periodo_fim,
          meio_pagamento: input.meio_pagamento ?? null,
          observacoes: input.observacoes ?? null,
          status: "pago",
          data_pagamento: new Date().toISOString().split("T")[0],
        })
        .select("*, profissionais_clinica(nome)")
        .single();
      if (error) throw error;
      return data as Repasse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repasses"] });
      toast({ title: "Repasse registrado! ✅" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao registrar repasse", description: error.message, variant: "destructive" });
    },
  });
}

// ─── Computed stats ───────────────────────────────────────────────────────────

/** Resumo financeiro por profissional calculado a partir das receitas e repasses */
export function useFinanceiroResumo(receitas: Receita[], repasses: Repasse[]) {
  const profIds = [...new Set(receitas.map((r) => r.profissional_id).filter(Boolean) as string[])];

  return profIds.map((profId) => {
    const receitasProf = receitas.filter((r) => r.profissional_id === profId);
    const repassesProf = repasses.filter((rp) => rp.profissional_id === profId);

    const totalComissao = receitasProf.reduce(
      (acc, r) => acc + (r.comissao_profissional_valor ?? 0),
      0
    );
    const totalRepassado = repassesProf.reduce((acc, rp) => acc + rp.valor, 0);
    const saldoPendente = totalComissao - totalRepassado;
    const profNome = receitasProf[0]?.profissionais_clinica?.nome ?? "—";

    return {
      profissional_id: profId,
      nome: profNome,
      atendimentos: receitasProf.length,
      totalComissao,
      totalRepassado,
      saldoPendente,
    };
  });
}
