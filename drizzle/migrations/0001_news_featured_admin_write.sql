-- Produits mis en avant sur l'accueil
ALTER TABLE public.products ADD COLUMN featured boolean NOT NULL DEFAULT false;

-- Actualités de la Maison
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public lit les actualités publiées"
ON public.news_posts FOR SELECT TO anon
USING (status = 'published');

CREATE POLICY "Membres connectés lisent les actualités publiées"
ON public.news_posts FOR SELECT TO authenticated
USING (status = 'published');

CREATE POLICY "Admins gèrent les actualités"
ON public.news_posts FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Écriture réservée à l'équipe sur le catalogue et les événements
CREATE POLICY "Admins gèrent les produits"
ON public.products FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins gèrent les événements"
ON public.events FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins traitent les candidatures"
ON public.membership_applications FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());