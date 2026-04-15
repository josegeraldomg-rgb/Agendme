-- ============================================================
-- Migration 4: Agendamentos Clínica + Ausências + Feriados
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Enum para status do agendamento
CREATE TYPE public.status_agendamento AS ENUM (
  'agendado', 'confirmado', 'em_atendimento', 'atendido',
  'cancelado_paciente', 'cancelado_clinica', 'faltou', 'remarcado'
);

-- Tabela de agendamentos da clínica
CREATE TABLE public.agendamentos_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE RESTRICT,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status public.status_agendamento NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  observacoes_internas TEXT,
  valor NUMERIC(10,2),
  origem TEXT DEFAULT 'painel', -- painel, app_cliente, whatsapp, agente_bolso
  recorrencia_id UUID, -- se faz parte de uma série recorrente
  cancelamento_motivo TEXT,
  cancelado_em TIMESTAMPTZ,
  confirmado_em TIMESTAMPTZ,
  atendido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT agendamento_horario_valido CHECK (hora_fim > hora_inicio)
);

CREATE INDEX idx_agendamentos_clinica_empresa ON public.agendamentos_clinica (empresa_id);
CREATE INDEX idx_agendamentos_clinica_paciente ON public.agendamentos_clinica (paciente_id);
CREATE INDEX idx_agendamentos_clinica_profissional ON public.agendamentos_clinica (profissional_id);
CREATE INDEX idx_agendamentos_clinica_data ON public.agendamentos_clinica (data);
CREATE INDEX idx_agendamentos_clinica_status ON public.agendamentos_clinica (status);
CREATE INDEX idx_agendamentos_clinica_data_prof ON public.agendamentos_clinica (data, profissional_id);

CREATE TRIGGER tr_agendamentos_clinica_updated_at
  BEFORE UPDATE ON public.agendamentos_clinica
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar FK de prontuario para agendamento
ALTER TABLE public.prontuarios
  ADD CONSTRAINT prontuarios_agendamento_id_fkey
  FOREIGN KEY (agendamento_id) REFERENCES public.agendamentos_clinica(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prontuarios_agendamento ON public.prontuarios (agendamento_id);

-- Tabela de ausências (folgas, férias, bloqueios de horário)
CREATE TABLE public.ausencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dia_todo BOOLEAN DEFAULT true,
  hora_inicio TIME,
  hora_fim TIME,
  motivo TEXT,
  tipo TEXT DEFAULT 'folga' CHECK (tipo IN ('folga', 'ferias', 'bloqueio', 'outro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ausencia_data_valida CHECK (data_fim >= data_inicio)
);

CREATE INDEX idx_ausencias_empresa ON public.ausencias (empresa_id);
CREATE INDEX idx_ausencias_profissional ON public.ausencias (profissional_id);
CREATE INDEX idx_ausencias_datas ON public.ausencias (data_inicio, data_fim);

-- Tabela de feriados por empresa
CREATE TABLE public.feriados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  nome TEXT NOT NULL,
  recorrente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, data)
);

CREATE INDEX idx_feriados_empresa ON public.feriados (empresa_id);

-- Tabela de lista de espera da clínica
CREATE TABLE public.lista_espera_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES public.profissionais_clinica(id) ON DELETE SET NULL,
  data_preferida DATE,
  periodo_preferido TEXT CHECK (periodo_preferido IN ('manha', 'tarde', 'noite', 'qualquer')),
  observacoes TEXT,
  status TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'notificado', 'agendado', 'cancelado')),
  notificado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lista_espera_clinica_empresa ON public.lista_espera_clinica (empresa_id);
CREATE INDEX idx_lista_espera_clinica_status ON public.lista_espera_clinica (status);

-- RLS para todas as tabelas
ALTER TABLE public.agendamentos_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_espera_clinica ENABLE ROW LEVEL SECURITY;

-- Agendamentos
CREATE POLICY "agendamentos_clinica_select"
  ON public.agendamentos_clinica FOR SELECT
  USING (
    empresa_id = public.get_user_empresa_id()
    OR public.has_role('saas_owner', auth.uid())
    OR paciente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
  );

CREATE POLICY "agendamentos_clinica_insert"
  ON public.agendamentos_clinica FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "agendamentos_clinica_update"
  ON public.agendamentos_clinica FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "agendamentos_clinica_delete"
  ON public.agendamentos_clinica FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Ausências
CREATE POLICY "ausencias_select"
  ON public.ausencias FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "ausencias_insert"
  ON public.ausencias FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "ausencias_update"
  ON public.ausencias FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "ausencias_delete"
  ON public.ausencias FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Feriados
CREATE POLICY "feriados_select"
  ON public.feriados FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "feriados_insert"
  ON public.feriados FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "feriados_update"
  ON public.feriados FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "feriados_delete"
  ON public.feriados FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Lista de espera
CREATE POLICY "lista_espera_clinica_select"
  ON public.lista_espera_clinica FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "lista_espera_clinica_insert"
  ON public.lista_espera_clinica FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "lista_espera_clinica_update"
  ON public.lista_espera_clinica FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "lista_espera_clinica_delete"
  ON public.lista_espera_clinica FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Function para validar conflito de agendamento
CREATE OR REPLACE FUNCTION public.check_agendamento_conflito(
  p_empresa_id UUID,
  p_profissional_id UUID,
  p_data DATE,
  p_hora_inicio TIME,
  p_hora_fim TIME,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agendamentos_clinica
    WHERE empresa_id = p_empresa_id
    AND profissional_id = p_profissional_id
    AND data = p_data
    AND status NOT IN ('cancelado_paciente', 'cancelado_clinica', 'faltou')
    AND (id IS DISTINCT FROM p_exclude_id)
    AND hora_inicio < p_hora_fim
    AND hora_fim > p_hora_inicio
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
