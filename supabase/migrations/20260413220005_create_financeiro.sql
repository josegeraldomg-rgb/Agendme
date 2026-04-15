-- ============================================================
-- Migration 5: Módulo Financeiro
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Enum para meio de pagamento
CREATE TYPE public.meio_pagamento AS ENUM (
  'dinheiro', 'pix', 'cartao_credito', 'cartao_debito',
  'transferencia', 'boleto', 'convenio', 'cortesia'
);

-- Tabela de receitas financeiras
CREATE TABLE public.financeiro_receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos_clinica(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES public.profissionais_clinica(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL,
  desconto NUMERIC(10,2) DEFAULT 0,
  valor_final NUMERIC(10,2) GENERATED ALWAYS AS (valor - COALESCE(desconto, 0)) STORED,
  meio_pagamento public.meio_pagamento NOT NULL DEFAULT 'pix',
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  data_competencia DATE NOT NULL DEFAULT CURRENT_DATE,
  parcelas INTEGER DEFAULT 1,
  parcela_atual INTEGER DEFAULT 1,
  comissao_empresa_perc NUMERIC(5,2) DEFAULT 50.00,
  comissao_profissional_perc NUMERIC(5,2) DEFAULT 50.00,
  comissao_empresa_valor NUMERIC(10,2),
  comissao_profissional_valor NUMERIC(10,2),
  categoria TEXT DEFAULT 'servico',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fin_receitas_empresa ON public.financeiro_receitas (empresa_id);
CREATE INDEX idx_fin_receitas_profissional ON public.financeiro_receitas (profissional_id);
CREATE INDEX idx_fin_receitas_paciente ON public.financeiro_receitas (paciente_id);
CREATE INDEX idx_fin_receitas_data ON public.financeiro_receitas (data_pagamento);
CREATE INDEX idx_fin_receitas_competencia ON public.financeiro_receitas (data_competencia);
CREATE INDEX idx_fin_receitas_agendamento ON public.financeiro_receitas (agendamento_id);

CREATE TRIGGER tr_fin_receitas_updated_at
  BEFORE UPDATE ON public.financeiro_receitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para calcular comissões automaticamente
CREATE OR REPLACE FUNCTION public.calcular_comissoes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.comissao_empresa_valor := (NEW.valor - COALESCE(NEW.desconto, 0)) * (NEW.comissao_empresa_perc / 100);
  NEW.comissao_profissional_valor := (NEW.valor - COALESCE(NEW.desconto, 0)) * (NEW.comissao_profissional_perc / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_fin_receitas_comissoes
  BEFORE INSERT OR UPDATE ON public.financeiro_receitas
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_comissoes();

-- Tabela de configuração de comissões por serviço/profissional
CREATE TABLE public.comissoes_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('global', 'profissional', 'servico', 'profissional_servico')),
  profissional_id UUID REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE,
  perc_empresa NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  perc_profissional NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comissao_soma_valida CHECK (perc_empresa + perc_profissional <= 100)
);

CREATE INDEX idx_comissoes_config_empresa ON public.comissoes_config (empresa_id);

-- Enum para status do repasse
CREATE TYPE public.status_repasse AS ENUM ('pendente', 'pago', 'cancelado');

-- Tabela de repasses para profissionais
CREATE TABLE public.repasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_clinica(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  status public.status_repasse NOT NULL DEFAULT 'pendente',
  meio_pagamento public.meio_pagamento,
  data_pagamento DATE,
  comprovante_url TEXT,
  observacoes TEXT,
  receitas_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_repasses_empresa ON public.repasses (empresa_id);
CREATE INDEX idx_repasses_profissional ON public.repasses (profissional_id);
CREATE INDEX idx_repasses_status ON public.repasses (status);

CREATE TRIGGER tr_repasses_updated_at
  BEFORE UPDATE ON public.repasses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.financeiro_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repasses ENABLE ROW LEVEL SECURITY;

-- Receitas
CREATE POLICY "fin_receitas_select"
  ON public.financeiro_receitas FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "fin_receitas_insert"
  ON public.financeiro_receitas FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "fin_receitas_update"
  ON public.financeiro_receitas FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "fin_receitas_delete"
  ON public.financeiro_receitas FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());

-- Comissões config
CREATE POLICY "comissoes_config_select"
  ON public.comissoes_config FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "comissoes_config_insert"
  ON public.comissoes_config FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "comissoes_config_update"
  ON public.comissoes_config FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

-- Repasses
CREATE POLICY "repasses_select"
  ON public.repasses FOR SELECT
  USING (empresa_id = public.get_user_empresa_id() OR public.has_role('saas_owner', auth.uid()));

CREATE POLICY "repasses_insert"
  ON public.repasses FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "repasses_update"
  ON public.repasses FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());
