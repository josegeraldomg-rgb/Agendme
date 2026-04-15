-- ============================================================
-- Migration 3: Pacientes (adaptar clientes) + Prontuários
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Adicionar empresa_id na tabela clientes existente
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('M', 'F', 'O')),
  ADD COLUMN IF NOT EXISTS foto_url TEXT,
  ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON public.clientes (empresa_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user ON public.clientes (user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes USING gin (nome gin_trgm_ops);

-- Habilitar extensão pg_trgm para busca fuzzy (se não existir)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabela de prontuários
CREATE TABLE public.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE SET NULL,
  agendamento_id UUID, -- FK será adicionada na migration 4
  data_atendimento TIMESTAMPTZ NOT NULL DEFAULT now(),
  queixa_principal TEXT,
  anamnese TEXT,
  exame_fisico TEXT,
  diagnostico TEXT,
  conduta TEXT,
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb, -- [{nome, url, tipo, created_at}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prontuarios_empresa ON public.prontuarios (empresa_id);
CREATE INDEX idx_prontuarios_paciente ON public.prontuarios (paciente_id);
CREATE INDEX idx_prontuarios_profissional ON public.prontuarios (profissional_id);
CREATE INDEX idx_prontuarios_data ON public.prontuarios (data_atendimento DESC);

CREATE TRIGGER tr_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prontuarios_select"
  ON public.prontuarios FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "prontuarios_insert"
  ON public.prontuarios FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "prontuarios_update"
  ON public.prontuarios FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "prontuarios_delete"
  ON public.prontuarios FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- RLS para clientes (tabela existente, adicionar policies de empresa)
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Dropar RLS policies antigas se existirem (sem error se não existir)
DO $$
BEGIN
  DROP POLICY IF EXISTS "clientes_select" ON public.clientes;
  DROP POLICY IF EXISTS "clientes_insert" ON public.clientes;
  DROP POLICY IF EXISTS "clientes_update" ON public.clientes;
  DROP POLICY IF EXISTS "clientes_delete" ON public.clientes;
END $$;

CREATE POLICY "clientes_select"
  ON public.clientes FOR SELECT
  USING (
    empresa_id = public.get_user_empresa_id()
    OR public.has_role('saas_owner', auth.uid())
    OR user_id = auth.uid() -- paciente vê seu próprio perfil
  );

CREATE POLICY "clientes_insert"
  ON public.clientes FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "clientes_update"
  ON public.clientes FOR UPDATE
  USING (
    empresa_id = public.get_user_empresa_id()
    OR user_id = auth.uid() -- paciente edita seu próprio perfil
  );

CREATE POLICY "clientes_delete"
  ON public.clientes FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());
