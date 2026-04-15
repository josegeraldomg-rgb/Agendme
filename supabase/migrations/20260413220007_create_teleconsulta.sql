-- ============================================================
-- Migration 7: Teleconsulta
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Enum para status da teleconsulta
CREATE TYPE public.status_teleconsulta AS ENUM ('criada', 'ativa', 'encerrada', 'cancelada');

-- Tabela de sessões de teleconsulta
CREATE TABLE public.teleconsultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos_clinica(id) ON DELETE SET NULL,
  paciente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status public.status_teleconsulta NOT NULL DEFAULT 'criada',
  duracao_minutos INTEGER,
  link_sala TEXT NOT NULL,
  link_sala_paciente TEXT, -- link simplificado/público para o paciente
  provedor TEXT DEFAULT 'jitsi' CHECK (provedor IN ('jitsi', 'daily', 'custom')),
  sala_id_externo TEXT,
  gravacao_url TEXT,
  iniciada_em TIMESTAMPTZ,
  encerrada_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teleconsultas_empresa ON public.teleconsultas (empresa_id);
CREATE INDEX idx_teleconsultas_paciente ON public.teleconsultas (paciente_id);
CREATE INDEX idx_teleconsultas_profissional ON public.teleconsultas (profissional_id);
CREATE INDEX idx_teleconsultas_data ON public.teleconsultas (data);
CREATE INDEX idx_teleconsultas_status ON public.teleconsultas (status);

CREATE TRIGGER tr_teleconsultas_updated_at
  BEFORE UPDATE ON public.teleconsultas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Chat da teleconsulta
CREATE TABLE public.teleconsulta_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teleconsulta_id UUID NOT NULL REFERENCES public.teleconsultas(id) ON DELETE CASCADE,
  remetente TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('profissional', 'paciente', 'sistema')),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teleconsulta_chat_sessao ON public.teleconsulta_chat (teleconsulta_id);

-- Arquivos compartilhados na teleconsulta
CREATE TABLE public.teleconsulta_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teleconsulta_id UUID NOT NULL REFERENCES public.teleconsultas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('imagem', 'documento', 'outro')),
  tamanho_bytes BIGINT,
  remetente TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teleconsulta_arquivos_sessao ON public.teleconsulta_arquivos (teleconsulta_id);

-- RLS
ALTER TABLE public.teleconsultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsulta_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsulta_arquivos ENABLE ROW LEVEL SECURITY;

-- Teleconsultas
CREATE POLICY "teleconsultas_select"
  ON public.teleconsultas FOR SELECT
  USING (
    empresa_id = public.get_user_empresa_id()
    OR public.has_role('saas_owner', auth.uid())
    OR paciente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  );

CREATE POLICY "teleconsultas_insert"
  ON public.teleconsultas FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "teleconsultas_update"
  ON public.teleconsultas FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

-- Chat (acesso via teleconsulta da empresa)
CREATE POLICY "teleconsulta_chat_select"
  ON public.teleconsulta_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teleconsultas t
      WHERE t.id = teleconsulta_id
      AND (
        t.empresa_id = public.get_user_empresa_id()
        OR t.paciente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "teleconsulta_chat_insert"
  ON public.teleconsulta_chat FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teleconsultas t
      WHERE t.id = teleconsulta_id
      AND (
        t.empresa_id = public.get_user_empresa_id()
        OR t.paciente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
      )
    )
  );

-- Arquivos (mesmo padrão do chat)
CREATE POLICY "teleconsulta_arquivos_select"
  ON public.teleconsulta_arquivos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teleconsultas t
      WHERE t.id = teleconsulta_id
      AND (
        t.empresa_id = public.get_user_empresa_id()
        OR t.paciente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "teleconsulta_arquivos_insert"
  ON public.teleconsulta_arquivos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teleconsultas t
      WHERE t.id = teleconsulta_id
      AND (
        t.empresa_id = public.get_user_empresa_id()
        OR t.paciente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
      )
    )
  );
