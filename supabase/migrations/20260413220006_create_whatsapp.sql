-- ============================================================
-- Migration 6: WhatsApp (Config, Templates, Mensagens)
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Tabela de configuração WhatsApp por empresa
CREATE TABLE public.whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE UNIQUE,
  numero TEXT,
  token_api TEXT, -- Será encriptado via Supabase Vault em produção
  provedor TEXT DEFAULT 'uazapi' CHECK (provedor IN ('uazapi', 'evolution', 'z-api', 'outro')),
  url_api TEXT,
  conectado BOOLEAN DEFAULT false,
  ultimo_status_check TIMESTAMPTZ,
  regras_envio JSONB DEFAULT '{
    "enviar_confirmacao_agendamento": true,
    "enviar_lembrete_1": true,
    "enviar_lembrete_2": true,
    "enviar_cancelamento": true,
    "enviar_aniversario": true,
    "notificar_lista_espera": false,
    "reenvio_automatico_erro": true,
    "max_tentativas": 3,
    "horario_inicio": "07:00",
    "horario_fim": "21:00",
    "limite_envios_simultaneos": 5
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enum para tipo de template WhatsApp
CREATE TYPE public.whatsapp_template_tipo AS ENUM (
  'lembrete1', 'lembrete2', 'confirmacao', 'cancelamento',
  'aniversario', 'lista_espera', 'personalizado'
);

-- Tabela de templates de mensagem
CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo public.whatsapp_template_tipo NOT NULL,
  mensagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  antecedencia_minutos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_templates_empresa ON public.whatsapp_templates (empresa_id);
CREATE INDEX idx_whatsapp_templates_tipo ON public.whatsapp_templates (tipo);

CREATE TRIGGER tr_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enum para status de mensagem
CREATE TYPE public.whatsapp_msg_status AS ENUM ('pendente', 'enviando', 'enviado', 'entregue', 'lido', 'erro');

-- Tabela de mensagens enviadas/recebidas
CREATE TABLE public.whatsapp_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES public.agendamentos_clinica(id) ON DELETE SET NULL,
  tipo public.whatsapp_template_tipo NOT NULL,
  direcao TEXT NOT NULL DEFAULT 'saida' CHECK (direcao IN ('saida', 'entrada')),
  telefone TEXT NOT NULL,
  texto TEXT NOT NULL,
  status public.whatsapp_msg_status NOT NULL DEFAULT 'pendente',
  tentativas INTEGER DEFAULT 0,
  max_tentativas INTEGER DEFAULT 3,
  erro_detalhe TEXT,
  resposta_api JSONB,
  message_id_externo TEXT, -- ID retornado pela API do provedor
  enviado_em TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_msgs_empresa ON public.whatsapp_mensagens (empresa_id);
CREATE INDEX idx_whatsapp_msgs_paciente ON public.whatsapp_mensagens (paciente_id);
CREATE INDEX idx_whatsapp_msgs_status ON public.whatsapp_mensagens (status);
CREATE INDEX idx_whatsapp_msgs_created ON public.whatsapp_mensagens (created_at DESC);
CREATE INDEX idx_whatsapp_msgs_agendamento ON public.whatsapp_mensagens (agendamento_id);
CREATE INDEX idx_whatsapp_msgs_externo ON public.whatsapp_mensagens (message_id_externo);

-- RLS
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;

-- Config
CREATE POLICY "whatsapp_config_select"
  ON public.whatsapp_config FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "whatsapp_config_insert"
  ON public.whatsapp_config FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "whatsapp_config_update"
  ON public.whatsapp_config FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

-- Templates
CREATE POLICY "whatsapp_templates_select"
  ON public.whatsapp_templates FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "whatsapp_templates_insert"
  ON public.whatsapp_templates FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "whatsapp_templates_update"
  ON public.whatsapp_templates FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "whatsapp_templates_delete"
  ON public.whatsapp_templates FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Mensagens
CREATE POLICY "whatsapp_mensagens_select"
  ON public.whatsapp_mensagens FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "whatsapp_mensagens_insert"
  ON public.whatsapp_mensagens FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());
