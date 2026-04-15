-- ============================================================
-- Security Fix Migration
-- Fix 8 warnings from Supabase Linter
-- ============================================================

-- ─── 0.1 Fix search_path on 5 functions ───

-- 1) update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2) get_user_empresa_id
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = ''
AS $function$
  SELECT empresa_id
  FROM public.profiles
  WHERE id = auth.uid()
$function$;

-- 3) user_belongs_to_empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_empresa(p_empresa_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND empresa_id = p_empresa_id
  )
$function$;

-- 4) check_agendamento_conflito
CREATE OR REPLACE FUNCTION public.check_agendamento_conflito(
  p_empresa_id uuid,
  p_profissional_id uuid,
  p_data date,
  p_hora_inicio time without time zone,
  p_hora_fim time without time zone,
  p_exclude_id uuid DEFAULT NULL::uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = ''
AS $function$
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
$function$;

-- 5) calcular_comissoes
CREATE OR REPLACE FUNCTION public.calcular_comissoes()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
BEGIN
  NEW.comissao_empresa_valor := (NEW.valor - COALESCE(NEW.desconto, 0)) * (NEW.comissao_empresa_perc / 100);
  NEW.comissao_profissional_valor := (NEW.valor - COALESCE(NEW.desconto, 0)) * (NEW.comissao_profissional_perc / 100);
  RETURN NEW;
END;
$function$;

-- ─── 0.2 Move pg_trgm from public to extensions ───

DROP INDEX IF EXISTS public.idx_clientes_nome;
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
CREATE INDEX idx_clientes_nome ON public.clientes USING gin (nome extensions.gin_trgm_ops);

-- ─── 0.3 Restrict storage bucket policies ───

DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
DROP POLICY IF EXISTS "logos_select_public" ON storage.objects;
