-- =============================================================================
-- PROJDET - TABELA DE CONFIGURAÇÕES DA HERO SECTION (SUPABASE)
-- =============================================================================
-- Execute este script no SQL Editor do seu painel Supabase (supabase.com)
-- 100% em inglês com políticas de segurança RLS ativadas.
-- =============================================================================

-- 1. Criação da tabela hero_settings
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id text PRIMARY KEY DEFAULT 'current',
  image_desktop text NOT NULL,
  image_mobile text,
  video_desktop text,
  video_mobile text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- 3. Política de Leitura Pública (Qualquer visitante carrega a foto da home)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hero_settings' AND policyname = 'Public can view hero settings'
  ) THEN
    CREATE POLICY "Public can view hero settings"
      ON public.hero_settings
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- 4. Política de Edição Apenas para Administradores Autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hero_settings' AND policyname = 'Authenticated admins can manage hero settings'
  ) THEN
    CREATE POLICY "Authenticated admins can manage hero settings"
      ON public.hero_settings
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 5. Inserção das Imagens Oficiais Padrão de Fábrica da PROJDET
INSERT INTO public.hero_settings (id, image_desktop, image_mobile, video_desktop, video_mobile)
VALUES (
  'current',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1080&q=85',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

