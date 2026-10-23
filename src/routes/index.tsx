import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { metadata } from '@/lib/goat/content';
import { getCatalog, getNews, getHomepage } from '@/lib/goat/data.functions';
import { useCurrency } from '@/lib/goat/currency';
import { hasPublishedCollection } from '@/lib/goat/presentation';
import campaign from '@/assets/maison-campaign.jpg';
import tailoring from '@/assets/tailoring-editorial.jpg';
import leather from '@/assets/leather-editorial.jpg';
import jewelry from '@/assets/jewelry-editorial.jpg';

const catalog = queryOptions({ queryKey: ['catalog'], queryFn: () => getCatalog() });
const news = queryOptions({ queryKey: ['news'], queryFn: () => getNews() });
const homepage = queryOptions({ queryKey: ['homepage'], queryFn: () => getHomepage() });

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(news);
    return Promise.all([context.queryClient.ensureQueryData(catalog),context.queryClient.ensureQueryData(homepage)]);
  },
  head: () =>
    metadata(
      'La Maison',
      'Découvrez GOAT’99, maison de mode et univers de luxe contemporain. Création et développement par Nuvex Technology.',
    ),
  component: Index,
});

function Index() {
  const { formatPrice } = useCurrency();
  const { data: { campaign: copy, collections } } = useSuspenseQuery(homepage);
  const { data: products } = useSuspenseQuery(catalog);
  const { data: posts } = useSuspenseQuery(news);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const selection = featured.length ? featured : products.slice(0, 4);

  return (
    <>
      <section className="campaign campaign-modern" aria-label="GOAT’99 — la campagne de la Maison">
        <div className="campaign-copy">
          {hasPublishedCollection(collections) && <span className="collection-badge"><span aria-hidden="true"/>Nouvelle collection</span>}
          <div className="eyebrow">GOAT’99 · LA MAISON</div>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="hero-actions">
            <Button variant="hero" className="campaign-primary" asChild>
              <Link to="/boutique">{copy.primary_label} <ArrowRight /></Link>
            </Button>
            <Button variant="editorial" className="campaign-secondary" asChild>
              <Link to="/boutique" search={{ vedettes: true }}>{copy.secondary_label} <ArrowRight /></Link>
            </Button>
          </div>
          <div className="campaign-signature"><span/>MODE · CRÉATION · ART DE VIVRE</div>
        </div>
        <div className="campaign-visual">
          <img src={campaign} width={1920} height={1088} alt="Vision éditoriale GOAT’99 : silhouette de couture noire dans une galerie de pierre" fetchPriority="high" />
          <div className="campaign-image-caption"><span>GOAT’99</span><span>L’ALLURE, EN SIGNATURE.</span></div>
        </div>
      </section>

      {selection.length > 0 && (
        <section className="section" id="articles-en-vedette">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ARTICLES EN VEDETTE</div>
              <h2>La sélection de la Maison.</h2>
            </div>
            <Link className="text-link" to="/boutique">Toute la boutique <ArrowRight size={15} /></Link>
          </div>
          <div className="universe-grid featured-grid">
            {selection.map((p) => (
              <Link key={p.id} to="/produit/$slug" params={{ slug: p.slug }} className="universe-item">
                <div className="universe-image">
                  {p.image_url ? (
                    <img src={p.image_url} width={1024} height={1280} loading="lazy" alt={p.name} />
                  ) : (
                    <div className="product-placeholder" />
                  )}
                </div>
                <h3>{p.name}<ArrowRight size={18} /></h3>
                <p>{p.category} · {formatPrice(p.price_minor, p.currency)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">LES EXPRESSIONS DE LA MAISON</div>
            <h2>Un univers, mille nuances.</h2>
          </div>
          <Link className="text-link" to="/$page" params={{ page: 'collections' }}>Explorer les collections <ArrowRight size={15} /></Link>
        </div>
        <div className="universe-grid">
          {[
            { name: 'Le vestiaire', sub: 'L’élégance dans chaque ligne', image: tailoring, page: 'collections' },
            { name: 'La maroquinerie', sub: 'Le caractère jusque dans le détail', image: leather, page: 'collections' },
            { name: 'La joaillerie', sub: 'Une présence précieuse', image: jewelry, page: 'joaillerie' },
          ].map((item) => (
            <Link key={item.name} to="/$page" params={{ page: item.page }} className="universe-item">
              <div className="universe-image">
                <img src={item.image} width={1024} height={1280} loading="lazy" alt={`Vision éditoriale : ${item.name}`} />
              </div>
              <h3>{item.name}<ArrowRight size={18} /></h3>
              <p>{item.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="editorial-band">
        <div className="eyebrow">L’ESPRIT GOAT’99</div>
        <h2>Au-delà de la mode.<br />Une manière d’être.</h2>
        <p>
          GOAT’99 réunit mode, création et art de vivre dans un même univers. Une invitation à affirmer son
          caractère, à cultiver sa singularité.
        </p>
        <Link className="text-link" to="/$page" params={{ page: 'maison' }}>Rencontrer la Maison <ArrowRight size={15} /></Link>
      </section>

      {posts.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ACTUALITÉS</div>
              <h2>Les nouvelles de la Maison.</h2>
            </div>
          </div>
          <div className="universe-grid">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="universe-item">
                <div className="universe-image">
                  {post.image_url && <img src={post.image_url} width={1024} height={1280} loading="lazy" alt={post.title} />}
                </div>
                <h3>{post.title}</h3>
                <p>
                  {post.published_at &&
                    new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {post.excerpt ? ` — ${post.excerpt}` : ''}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="club-band">
        <div>
          <div className="eyebrow">LE CERCLE GOAT’99</div>
          <h2>Un autre regard sur l’exclusif.</h2>
          <p>
            Un cercle privé au cœur de l’univers de la Maison.
            <br />
            Exprimez votre intérêt pour GOAT’99 Club.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/club">DÉCOUVRIR LE CLUB <ArrowRight /></Link>
        </Button>
      </section>
    </>
  );
}
