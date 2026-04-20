-- ============================================================
-- Fix: Corrigir ordem dos argumentos em has_role nas policies de empresas
-- O has_role aceita (_user_id UUID, _role app_role) mas estava invertido
-- como has_role('saas_owner', auth.uid()) causando erro de cast para anon
-- ============================================================

-- Drop policies existentes
DROP POLICY IF EXISTS "empresas_select_own" ON public.empresas;
DROP POLICY IF EXISTS "empresas_insert_saas_owner" ON public.empresas;
DROP POLICY IF EXISTS "empresas_update_own" ON public.empresas;
DROP POLICY IF EXISTS "empresas_select_by_slug_public" ON public.empresas;

-- Recriar com argumentos corrigidos

-- Admins e owners veem sua empresa
CREATE POLICY "empresas_select_own"
  ON public.empresas FOR SELECT
  USING (
    id = public.get_user_empresa_id()
    OR public.has_role(auth.uid(), 'saas_owner')
  );

-- Apenas saas_owner pode criar empresas
CREATE POLICY "empresas_insert_saas_owner"
  ON public.empresas FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'saas_owner')
  );

-- Admins podem atualizar sua própria empresa, saas_owner qualquer uma
CREATE POLICY "empresas_update_own"
  ON public.empresas FOR UPDATE
  USING (
    id = public.get_user_empresa_id()
    OR public.has_role(auth.uid(), 'saas_owner')
  );

-- Leitura pública para resolução de slug (portal do cliente - inclui anon)
-- Permite acesso a empresas ativas E em trial para o portal público
CREATE POLICY "empresas_select_by_slug_public"
  ON public.empresas FOR SELECT
  USING (status IN ('ativa', 'trial'));
