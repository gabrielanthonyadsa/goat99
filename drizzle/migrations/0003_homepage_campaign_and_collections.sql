CREATE TABLE public.homepage_campaign (
 id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
 title text NOT NULL,
 description text NOT NULL,
 primary_label text NOT NULL DEFAULT 'Découvrir la boutique',
 secondary_label text NOT NULL DEFAULT 'Voir les articles en vedette'
);
GRANT SELECT ON public.homepage_campaign TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_campaign TO authenticated;
GRANT ALL ON public.homepage_campaign TO service_role;
ALTER TABLE public.homepage_campaign ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public campaign read" ON public.homepage_campaign FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin campaign write" ON public.homepage_campaign FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TABLE public.collections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published collections read" ON public.collections FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admin collections read" ON public.collections FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin collections write" ON public.collections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());