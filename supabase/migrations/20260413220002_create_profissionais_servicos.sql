-- ============================================================
-- Migration 2: Profissionais Clínica + Serviços + Horários
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Tabela de profissionais de clínica (separada da tabela "professores" legada)
CREATE TABLE public.profissionais_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  especialidades TEXT[] DEFAULT '{}',
  registro_profissional TEXT,
  comissao_percentual NUMERIC(5,2) DEFAULT 50.00,
  cor_agenda TEXT DEFAULT '#7c3aed',
  avatar_url TEXT,
  bio TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profissionais_clinica_empresa ON public.profissionais_clinica (empresa_id);
CREATE INDEX idx_profissionais_clinica_user ON public.profissionais_clinica (user_id);

CREATE TRIGGER tr_profissionais_clinica_updated_at
  BEFORE UPDATE ON public.profissionais_clinica
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de categorias de serviços
CREATE TABLE public.categorias_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#7c3aed',
  icone TEXT DEFAULT 'Sparkles',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categorias_servicos_empresa ON public.categorias_servicos (empresa_id);

-- Adicionar empresa_id e categoria_id na tabela servicos existente
ALTER TABLE public.servicos
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categorias_servicos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS imagem_url TEXT,
  ADD COLUMN IF NOT EXISTS permite_agendamento_online BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_servicos_empresa ON public.servicos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON public.servicos (categoria_id);

-- Tabela de associação profissional ↔ serviço
CREATE TABLE public.profissional_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  preco_customizado NUMERIC(10,2),
  duracao_customizada INTEGER,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profissional_id, servico_id)
);

CREATE INDEX idx_profissional_servicos_prof ON public.profissional_servicos (profissional_id);
CREATE INDEX idx_profissional_servicos_serv ON public.profissional_servicos (servico_id);

-- Tabela de horários de funcionamento por profissional
CREATE TABLE public.horarios_funcionamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  intervalo_minutos INTEGER DEFAULT 30,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT horario_valido CHECK (hora_fim > hora_inicio)
);

CREATE INDEX idx_horarios_empresa ON public.horarios_funcionamento (empresa_id);
CREATE INDEX idx_horarios_profissional ON public.horarios_funcionamento (profissional_id);
CREATE INDEX idx_horarios_dia ON public.horarios_funcionamento (dia_semana);

-- RLS para todas as novas tabelas
ALTER TABLE public.profissionais_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissional_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Profissionais: ver apenas da sua empresa
CREATE POLICY "profissionais_clinica_select"
  ON public.profissionais_clinica FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "profissionais_clinica_insert"
  ON public.profissionais_clinica FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "profissionais_clinica_update"
  ON public.profissionais_clinica FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "profissionais_clinica_delete"
  ON public.profissionais_clinica FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Categorias de serviços
CREATE POLICY "categorias_servicos_select"
  ON public.categorias_servicos FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "categorias_servicos_insert"
  ON public.categorias_servicos FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "categorias_servicos_update"
  ON public.categorias_servicos FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "categorias_servicos_delete"
  ON public.categorias_servicos FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Profissional-Serviços (join table, acessível pela empresa do profissional)
CREATE POLICY "profissional_servicos_select"
  ON public.profissional_servicos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profissionais_clinica pc
      WHERE pc.id = profissional_id
      AND pc.empresa_id = public.get_user_empresa_id()
    )
  );

CREATE POLICY "profissional_servicos_insert"
  ON public.profissional_servicos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profissionais_clinica pc
      WHERE pc.id = profissional_id
      AND pc.empresa_id = public.get_user_empresa_id()
    )
  );

CREATE POLICY "profissional_servicos_update"
  ON public.profissional_servicos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profissionais_clinica pc
      WHERE pc.id = profissional_id
      AND pc.empresa_id = public.get_user_empresa_id()
    )
  );

CREATE POLICY "profissional_servicos_delete"
  ON public.profissional_servicos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profissionais_clinica pc
      WHERE pc.id = profissional_id
      AND pc.empresa_id = public.get_user_empresa_id()
    )
  );

-- Horários de funcionamento
CREATE POLICY "horarios_funcionamento_select"
  ON public.horarios_funcionamento FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "horarios_funcionamento_insert"
  ON public.horarios_funcionamento FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "horarios_funcionamento_update"
  ON public.horarios_funcionamento FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "horarios_funcionamento_delete"
  ON public.horarios_funcionamento FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());
