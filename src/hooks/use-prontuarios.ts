import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "@/contexts/EmpresaContext";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Prontuario {
  id: string;
  empresa_id: string;
  paciente_id: string;
  profissional_id: string | null;
  agendamento_id: string | null;
  data_atendimento: string;
  tipo_atendimento: "presencial" | "teleconsulta";
  queixa_principal: string | null;
  registro_tecnico: string | null;   // campo principal UI
  anamnese: string | null;           // campo clínico estruturado
  exame_fisico: string | null;
  diagnostico: string | null;
  conduta: string | null;            // sugestão de conduta
  observacoes: string | null;
  anexos: ProntuarioAnexo[];         // jsonb array
  fechado: boolean;
  created_at: string;
  updated_at: string;
  // relations
  clientes?: { id: string; nome: string; email: string | null; telefone: string | null } | null;
  profissionais_clinica?: { id: string; nome: string } | null;
  agendamentos_clinica?: { id: string; data: string; hora_inicio: string; servicos?: { nome: string } | null } | null;
}

export interface ProntuarioAnexo {
  id: string;
  nome: string;
  tipo: "imagem" | "pdf" | "documento";
  url: string;
  descricao?: string;
}

export interface CreateProntuarioInput {
  paciente_id: string;
  profissional_id?: string | null;
  agendamento_id?: string | null;
  tipo_atendimento?: "presencial" | "teleconsulta";
  queixa_principal?: string | null;
  registro_tecnico?: string | null;
  diagnostico?: string | null;
  conduta?: string | null;
  observacoes?: string | null;
}

export interface UpdateProntuarioInput {
  id: string;
  registro_tecnico?: string | null;
  anamnese?: string | null;
  exame_fisico?: string | null;
  diagnostico?: string | null;
  conduta?: string | null;
  observacoes?: string | null;
  queixa_principal?: string | null;
  fechado?: boolean;
  anexos?: ProntuarioAnexo[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Lista prontuários da empresa. Opcionalmente filtrado por paciente.
 */
export function useProntuarios(filters?: { paciente_id?: string; profissional_id?: string; fechado?: boolean }) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["prontuarios", empresaId, filters],
    queryFn: async () => {
      if (!empresaId) return [] as Prontuario[];

      let query = supabase
        .from("prontuarios")
        .select(
          "*, clientes(id, nome, email, telefone), profissionais_clinica(id, nome), agendamentos_clinica(id, data, hora_inicio, servicos(nome))"
        )
        .eq("empresa_id", empresaId)
        .order("data_atendimento", { ascending: false });

      if (filters?.paciente_id) query = query.eq("paciente_id", filters.paciente_id);
      if (filters?.profissional_id) query = query.eq("profissional_id", filters.profissional_id);
      if (filters?.fechado !== undefined) query = query.eq("fechado", filters.fechado);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Prontuario[];
    },
    enabled: !!empresaId,
  });
}

/**
 * Busca um prontuário específico por ID.
 */
export function useProntuario(id?: string) {
  const empresaId = useEmpresaId();

  return useQuery({
    queryKey: ["prontuario", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("prontuarios")
        .select(
          "*, clientes(id, nome, email, telefone), profissionais_clinica(id, nome), agendamentos_clinica(id, data, hora_inicio, servicos(nome))"
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Prontuario;
    },
    enabled: !!id,
  });
}

/**
 * Cria novo prontuário.
 */
export function useCreateProntuario() {
  const queryClient = useQueryClient();
  const empresaId = useEmpresaId();

  return useMutation({
    mutationFn: async (input: CreateProntuarioInput) => {
      if (!empresaId) throw new Error("Empresa não encontrada");

      const { data, error } = await supabase
        .from("prontuarios")
        .insert({
          empresa_id: empresaId,
          paciente_id: input.paciente_id,
          profissional_id: input.profissional_id ?? null,
          agendamento_id: input.agendamento_id ?? null,
          tipo_atendimento: input.tipo_atendimento ?? "presencial",
          queixa_principal: input.queixa_principal ?? null,
          registro_tecnico: input.registro_tecnico ?? null,
          diagnostico: input.diagnostico ?? null,
          conduta: input.conduta ?? null,
          observacoes: input.observacoes ?? null,
          fechado: false,
          anexos: [],
        })
        .select(
          "*, clientes(id, nome, email, telefone), profissionais_clinica(id, nome)"
        )
        .single();

      if (error) throw error;
      return data as Prontuario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prontuarios"] });
      toast({ title: "Prontuário criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar prontuário", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * Atualiza conteúdo de um prontuário (campos clínicos, status, anexos).
 */
export function useUpdateProntuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateProntuarioInput) => {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // só inclui campos definidos
      if (updates.registro_tecnico !== undefined) payload.registro_tecnico = updates.registro_tecnico;
      if (updates.anamnese !== undefined) payload.anamnese = updates.anamnese;
      if (updates.exame_fisico !== undefined) payload.exame_fisico = updates.exame_fisico;
      if (updates.diagnostico !== undefined) payload.diagnostico = updates.diagnostico;
      if (updates.conduta !== undefined) payload.conduta = updates.conduta;
      if (updates.observacoes !== undefined) payload.observacoes = updates.observacoes;
      if (updates.queixa_principal !== undefined) payload.queixa_principal = updates.queixa_principal;
      if (updates.fechado !== undefined) payload.fechado = updates.fechado;
      if (updates.anexos !== undefined) payload.anexos = updates.anexos;

      const { data, error } = await supabase
        .from("prontuarios")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["prontuarios"] });
      queryClient.invalidateQueries({ queryKey: ["prontuario", vars.id] });
      const msg = vars.fechado ? "Prontuário fechado." : "Prontuário salvo!";
      toast({ title: msg });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao salvar prontuário", description: error.message, variant: "destructive" });
    },
  });
}
