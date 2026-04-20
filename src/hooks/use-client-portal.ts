import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ── Helper: fetch público via REST (anon key) ──
// Usa a mesma estratégia do ClientEmpresaContext para bypass de sessão ativa.
// Isso garante que as RLS policies públicas (portal do cliente) sejam usadas
// mesmo quando um admin/clínica está logado no mesmo navegador.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://zopywhhhotwvnmynuirc.supabase.co";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcHl3aGhob3R3dm5teW51aXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTMwMDUsImV4cCI6MjA5MTY4OTAwNX0.i0Z34J8pUpT0pOZFr4wFN89iSBD0_41NKtpKqRyg-To";

async function anonFetch<T = any>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: ANON_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`REST ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

// ── Categorias de serviços por empresa (via REST público) ──
export function useClientCategorias(empresaId?: string) {
  return useQuery({
    queryKey: ["client_categorias", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      return anonFetch(
        `categorias_servicos?empresa_id=eq.${empresaId}&ativo=eq.true&select=id,nome,descricao,icone,ativo,ordem&order=ordem.asc`
      );
    },
    enabled: !!empresaId,
  });
}

// ── Serviços por categoria (via REST público) ──
export function useClientServicos(empresaId?: string, categoriaId?: string) {
  return useQuery({
    queryKey: ["client_servicos", empresaId, categoriaId],
    queryFn: async () => {
      if (!empresaId) return [];
      let path = `servicos?empresa_id=eq.${empresaId}&ativo=eq.true&select=id,nome,descricao,preco,duracao_minutos,categoria_id,whatsapp_only&order=nome.asc`;
      if (categoriaId) path += `&categoria_id=eq.${categoriaId}`;
      return anonFetch(path);
    },
    enabled: !!empresaId,
  });
}

// ── Profissionais (via REST público) ──
export function useClientProfissionais(empresaId?: string, servicoId?: string) {
  return useQuery({
    queryKey: ["client_profissionais", empresaId, servicoId],
    queryFn: async () => {
      if (!empresaId) return [];

      // All active profissionais for the company
      const profissionais = await anonFetch<{ id: string; nome: string; especialidade?: string; bio?: string; avatar_url?: string }>(
        `profissionais_clinica?empresa_id=eq.${empresaId}&ativo=eq.true&select=id,nome,especialidade,bio,avatar_url&order=nome.asc`
      );

      if (servicoId) {
        // Filter by service linkage
        const links = await anonFetch<{ profissional_id: string }>(
          `profissional_servicos?servico_id=eq.${servicoId}&select=profissional_id`
        );
        const linkedIds = new Set(links.map((l) => l.profissional_id));
        return profissionais.filter((p) => linkedIds.has(p.id));
      }

      return profissionais;
    },
    enabled: !!empresaId,
  });
}

// ── Histórico de agendamentos do paciente logado ──
export function useClientHistorico(empresaId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client_historico", empresaId, user?.id],
    queryFn: async () => {
      if (!empresaId || !user?.id) return [];

      // Find cliente by auth user
      const { data: cliente } = await supabase
        .from("clientes")
        .select("id")
        .eq("empresa_id", empresaId)
        .eq("email", user.email)
        .maybeSingle();

      if (!cliente) return [];

      const { data, error } = await supabase
        .from("agendamentos_clinica")
        .select(`
          id, data_hora, status, observacoes,
          servicos(nome, duracao_minutos),
          profissionais_clinica(nome)
        `)
        .eq("empresa_id", empresaId)
        .eq("cliente_id", cliente.id)
        .order("data_hora", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!empresaId && !!user?.id,
  });
}

// ── Perfil do paciente (clientes table) ──
export function useClientPerfil(empresaId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client_perfil", empresaId, user?.id],
    queryFn: async () => {
      if (!empresaId || !user?.email) return null;
      const { data } = await supabase
        .from("clientes")
        .select("id, nome, email, telefone, cpf, data_nascimento, observacoes")
        .eq("empresa_id", empresaId)
        .eq("email", user.email)
        .maybeSingle();
      return data;
    },
    enabled: !!empresaId && !!user?.email,
  });
}

// ── Atualizar perfil do paciente ──
export function useUpdateClientPerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clienteId, nome, telefone, email }: { clienteId: string; nome: string; telefone: string; email: string }) => {
      const { error } = await supabase
        .from("clientes")
        .update({ nome, telefone, email })
        .eq("id", clienteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_perfil"] });
      toast({ title: "Perfil atualizado! ✅" });
    },
    onError: (e: Error) => toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" }),
  });
}

// ── Criar agendamento real ──
export function useCriarAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      empresaId: string;
      servicoId: string;
      profissionalId: string;
      dataHora: Date;
      observacoes?: string;
      nomeCliente?: string;
      emailCliente?: string;
      telefoneCliente?: string;
    }) => {
      // Get or create cliente
      let clienteId: string | null = null;

      if (params.emailCliente) {
        const { data: existingCliente } = await supabase
          .from("clientes")
          .select("id")
          .eq("empresa_id", params.empresaId)
          .eq("email", params.emailCliente)
          .maybeSingle();

        if (existingCliente) {
          clienteId = existingCliente.id;
        } else {
          const { data: newCliente, error: cErr } = await supabase
            .from("clientes")
            .insert({
              empresa_id: params.empresaId,
              nome: params.nomeCliente || params.emailCliente,
              email: params.emailCliente,
              telefone: params.telefoneCliente,
              ativo: true,
            })
            .select("id")
            .single();
          if (cErr) throw cErr;
          clienteId = newCliente.id;
        }
      }

      // Create agendamento
      const { data, error } = await supabase
        .from("agendamentos_clinica")
        .insert({
          empresa_id: params.empresaId,
          servico_id: params.servicoId,
          profissional_id: params.profissionalId,
          cliente_id: clienteId,
          data_hora: params.dataHora.toISOString(),
          status: "pendente",
          observacoes: params.observacoes,
          canal_origem: "portal_cliente",
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_historico"] });
      toast({ title: "Agendamento confirmado! ✅", description: "Você receberá uma confirmação em breve." });
    },
    onError: (e: Error) => toast({ title: "Erro ao agendar", description: e.message, variant: "destructive" }),
  });
}
