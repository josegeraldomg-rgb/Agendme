-- ============================================================
-- Migration 10: Storage Buckets + Supabase Realtime
-- Épico 1 — Modelagem Multi-Tenant AgendMe
-- ============================================================

-- Storage buckets para uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]),
  ('prontuarios', 'prontuarios', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]),
  ('teleconsulta-files', 'teleconsulta-files', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: avatars (público para leitura, auth para upload)
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: logos (público para leitura)
CREATE POLICY "logos_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "logos_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Storage policies: prontuarios (privado, isolado por empresa)
CREATE POLICY "prontuarios_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prontuarios'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "prontuarios_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prontuarios'
    AND auth.role() = 'authenticated'
  );

-- Storage policies: teleconsulta files
CREATE POLICY "teleconsulta_files_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'teleconsulta-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "teleconsulta_files_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'teleconsulta-files'
    AND auth.role() = 'authenticated'
  );

-- Habilitar Realtime para tabelas que precisam de updates em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos_clinica;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teleconsulta_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_mensagens;

-- Adicionar novos roles ao enum se necessário
DO $$
BEGIN
  -- Verificar se 'paciente' já existe no enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'paciente'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'paciente';
  END IF;
END $$;
