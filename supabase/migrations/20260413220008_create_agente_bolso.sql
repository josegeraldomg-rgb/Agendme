-- ============================================================
-- Migration 8: Agente de Bolso (IA)
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Configuração do agente por empresa
CREATE TABLE public.agente_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE UNIQUE,
  ativo BOOLEAN DEFAULT false,
  modelo_ia TEXT DEFAULT 'gpt-4o',
  system_prompt TEXT DEFAULT 'Você é um assistente virtual da clínica. Ajude o administrador a gerenciar agendamentos, consultar informações de pacientes e verificar o financeiro. Seja objetivo e profissional.',
  acoes_permitidas JSONB DEFAULT '[
    "listar_agendamentos",
    "criar_agendamento",
    "cancelar_agendamento",
    "buscar_paciente",
    "horarios_disponiveis",
    "listar_pacientes_dia",
    "metricas_dashboard"
  ]'::jsonb,
  numeros_autorizados TEXT[] DEFAULT '{}',
  limites JSONB DEFAULT '{
    "max_mensagens_dia": 100,
    "max_tokens_mes": 500000,
    "max_mensagens_conversa": 20,
    "timeout_conversa_minutos": 30
  }'::jsonb,
  tokens_usados_mes INTEGER DEFAULT 0,
  mensagens_hoje INTEGER DEFAULT 0,
  ultimo_reset_diario DATE,
  ultimo_reset_mensal DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_agente_config_updated_at
  BEFORE UPDATE ON public.agente_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enum para status da conversa
CREATE TYPE public.agente_conversa_status AS ENUM ('ativa', 'encerrada', 'timeout');

-- Conversas do agente
CREATE TABLE public.agente_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_phone TEXT NOT NULL,
  user_name TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.agente_conversa_status NOT NULL DEFAULT 'ativa',
  total_mensagens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  encerrada_em TIMESTAMPTZ
);

CREATE INDEX idx_agente_conversas_empresa ON public.agente_conversas (empresa_id);
CREATE INDEX idx_agente_conversas_phone ON public.agente_conversas (user_phone);
CREATE INDEX idx_agente_conversas_status ON public.agente_conversas (status);
CREATE INDEX idx_agente_conversas_last_msg ON public.agente_conversas (last_message_at DESC);

-- Mensagens individuais da conversa
CREATE TABLE public.agente_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID NOT NULL REFERENCES public.agente_conversas(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT,
  tool_name TEXT,
  tool_call_id TEXT,
  tool_args JSONB,
  tool_result JSONB,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  modelo TEXT,
  latencia_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agente_msgs_conversa ON public.agente_mensagens (conversa_id);
CREATE INDEX idx_agente_msgs_role ON public.agente_mensagens (role);
CREATE INDEX idx_agente_msgs_created ON public.agente_mensagens (created_at);

-- Log de ações executadas pelo agente
CREATE TABLE public.agente_acoes_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  conversa_id UUID REFERENCES public.agente_conversas(id) ON DELETE SET NULL,
  mensagem_id UUID REFERENCES public.agente_mensagens(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  parametros JSONB,
  resultado JSONB,
  sucesso BOOLEAN NOT NULL DEFAULT true,
  erro TEXT,
  duracao_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agente_acoes_empresa ON public.agente_acoes_log (empresa_id);
CREATE INDEX idx_agente_acoes_conversa ON public.agente_acoes_log (conversa_id);
CREATE INDEX idx_agente_acoes_acao ON public.agente_acoes_log (acao);
CREATE INDEX idx_agente_acoes_created ON public.agente_acoes_log (created_at DESC);

-- RLS
ALTER TABLE public.agente_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agente_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agente_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agente_acoes_log ENABLE ROW LEVEL SECURITY;

-- Config
CREATE POLICY "agente_config_select"
  ON public.agente_config FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "agente_config_insert"
  ON public.agente_config FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "agente_config_update"
  ON public.agente_config FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

-- Conversas
CREATE POLICY "agente_conversas_select"
  ON public.agente_conversas FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

-- Mensagens (via conversa da empresa)
CREATE POLICY "agente_mensagens_select"
  ON public.agente_mensagens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agente_conversas c
      WHERE c.id = conversa_id
      AND (c.empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()))
    )
  );

-- Ações log
CREATE POLICY "agente_acoes_log_select"
  ON public.agente_acoes_log FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));
