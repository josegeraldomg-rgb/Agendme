-- ============================================================
-- Migration 9: Webhooks + Configurações + Notificações (adapt)
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Tabela de webhooks por empresa
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  eventos TEXT[] DEFAULT '{}', -- ex: ['agendamento.criado', 'agendamento.cancelado', 'pagamento.recebido']
  ativo BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}'::jsonb,
  ultimo_disparo TIMESTAMPTZ,
  ultimo_status INTEGER,
  falhas_consecutivas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_empresa ON public.webhooks (empresa_id);
CREATE INDEX idx_webhooks_ativo ON public.webhooks (ativo);

CREATE TRIGGER tr_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Log de disparos de webhook
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  payload JSONB,
  status_code INTEGER,
  response_body TEXT,
  duracao_ms INTEGER,
  sucesso BOOLEAN NOT NULL DEFAULT true,
  erro TEXT,
  tentativa INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_logs_webhook ON public.webhook_logs (webhook_id);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs (created_at DESC);

-- Tabela de configurações dinâmicas por empresa
CREATE TABLE public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, chave)
);

CREATE INDEX idx_configuracoes_empresa ON public.configuracoes (empresa_id);
CREATE INDEX idx_configuracoes_chave ON public.configuracoes (chave);

CREATE TRIGGER tr_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adaptar tabela notificacoes existente: adicionar empresa_id
ALTER TABLE public.notificacoes
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS acao_url TEXT,
  ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'geral';

CREATE INDEX IF NOT EXISTS idx_notificacoes_empresa ON public.notificacoes (empresa_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON public.notificacoes (user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes (lida);

-- Tabela de audit log (ações importantes)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  dados_antes JSONB,
  dados_depois JSONB,
  ip TEXT,
  user_agent TEXT,
  origem TEXT DEFAULT 'painel', -- painel, api, agente_bolso, webhook
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_empresa ON public.audit_log (empresa_id);
CREATE INDEX idx_audit_log_user ON public.audit_log (user_id);
CREATE INDEX idx_audit_log_acao ON public.audit_log (acao);
CREATE INDEX idx_audit_log_created ON public.audit_log (created_at DESC);

-- RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Webhooks
CREATE POLICY "webhooks_select"
  ON public.webhooks FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "webhooks_insert"
  ON public.webhooks FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "webhooks_update"
  ON public.webhooks FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "webhooks_delete"
  ON public.webhooks FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Webhook logs
CREATE POLICY "webhook_logs_select"
  ON public.webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.webhooks w
      WHERE w.id = webhook_id
      AND (w.empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()))
    )
  );

-- Configurações
CREATE POLICY "configuracoes_select"
  ON public.configuracoes FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "configuracoes_insert"
  ON public.configuracoes FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "configuracoes_update"
  ON public.configuracoes FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

-- Notificações (atualizar RLS existente)
DO $$
BEGIN
  DROP POLICY IF EXISTS "notificacoes_select" ON public.notificacoes;
  DROP POLICY IF EXISTS "notificacoes_insert" ON public.notificacoes;
  DROP POLICY IF EXISTS "notificacoes_update" ON public.notificacoes;
END $$;

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificacoes_select"
  ON public.notificacoes FOR SELECT
  USING (
    empresa_id = public.get_user_empresa_id()
    OR user_id = auth.uid()
    OR public.has_role('saas_owner', auth.uid())
  );

CREATE POLICY "notificacoes_insert"
  ON public.notificacoes FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "notificacoes_update"
  ON public.notificacoes FOR UPDATE
  USING (
    empresa_id = public.get_user_empresa_id()
    OR user_id = auth.uid()
  );

-- Audit log
CREATE POLICY "audit_log_select"
  ON public.audit_log FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "audit_log_insert"
  ON public.audit_log FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));
