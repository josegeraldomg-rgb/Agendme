-- ============================================================
-- Migration 1: Empresas + Helper Function + Profiles FK
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Enum para status da empresa
CREATE TYPE public.empresa_status AS ENUM ('ativa', 'suspensa', 'cancelada', 'trial');

-- Enum para plano da empresa
CREATE TYPE public.empresa_plano AS ENUM ('basico', 'profissional', 'premium', 'enterprise');

-- Tabela principal de empresas (tenants)
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT,
  telefone TEXT,
  cnpj TEXT,
  plano public.empresa_plano NOT NULL DEFAULT 'basico',
  status public.empresa_status NOT NULL DEFAULT 'trial',
  logo_url TEXT,
  dominio_customizado TEXT,
  subdominio TEXT UNIQUE,
  config JSONB DEFAULT '{}'::jsonb,
  limites JSONB DEFAULT '{
    "max_profissionais": 5,
    "max_pacientes": 100,
    "max_agendamentos_mes": 500,
    "whatsapp_habilitado": false,
    "teleconsulta_habilitada": false,
    "agente_bolso_habilitado": false
  }'::jsonb,
  white_label JSONB DEFAULT '{
    "cor_primaria": "#7c3aed",
    "cor_secundaria": "#a78bfa",
    "cor_fundo": "#ffffff",
    "cor_texto": "#1a1a2e",
    "fonte": "Inter",
    "nome_exibicao": null,
    "logo_login_url": null,
    "favicon_url": null
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para empresas
CREATE INDEX idx_empresas_slug ON public.empresas (slug);
CREATE INDEX idx_empresas_status ON public.empresas (status);
CREATE INDEX idx_empresas_subdominio ON public.empresas (subdominio);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar empresa_id em profiles (coluna já existe nos types, garantir FK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_empresa_id_fkey'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_empresa_id_fkey
      FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Índice para busca rápida por empresa
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_id ON public.profiles (empresa_id);

-- Helper function: retorna o empresa_id do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id
  FROM public.profiles
  WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: verifica se o usuário pertence a uma empresa específica
CREATE OR REPLACE FUNCTION public.user_belongs_to_empresa(p_empresa_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND empresa_id = p_empresa_id
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS para empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Admins e owners veem apenas sua empresa
CREATE POLICY "empresas_select_own"
  ON public.empresas FOR SELECT
  USING (
    id = public.get_user_empresa_id()
    OR public.has_role('saas_owner', auth.uid())
  );

-- Apenas saas_owner pode criar empresas
CREATE POLICY "empresas_insert_saas_owner"
  ON public.empresas FOR INSERT
  WITH CHECK (
    public.has_role('saas_owner', auth.uid())
  );

-- Admins podem atualizar sua própria empresa, saas_owner qualquer uma
CREATE POLICY "empresas_update_own"
  ON public.empresas FOR UPDATE
  USING (
    id = public.get_user_empresa_id()
    OR public.has_role('saas_owner', auth.uid())
  );

-- Leitura pública para resolução de slug (app do cliente)
CREATE POLICY "empresas_select_by_slug_public"
  ON public.empresas FOR SELECT
  USING (status = 'ativa');
