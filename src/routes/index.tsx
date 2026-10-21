import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { metadata } from '@/lib/goat/content';
import { getCatalog, getNews } from '@/lib/goat/data.functions';
import campaign from '@/assets/maison-campaign.jpg';
import tailoring from '@/assets/tailoring-editorial.jpg';
import leather from '@/assets/leather-editorial.jpg';
import jewelry from '@/assets/jewelry-editorial.jpg';

const catalog = queryOptions({ queryKey: ['catalog'], queryFn: () => getCatalog() });
const news = queryOptions({ queryKey: ['news'], queryFn: () => getNews() });

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(news);
    return context.queryClient.ensureQueryData(catalog);
  },
  head: () =>
    metadata(
      'La Maison',
      'Découvrez GOAT’99, maison de mode et univers de luxe contemporain. Création et développement par Nuvex Technology.',
    ),
  component: Index,
});

const formatPrice = (minor: number, currency: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(minor / 100);

function Index() {
  const { data: products } = useSuspenseQuery(catalog);
  const { data: posts } = useSuspenseQuery(news);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const selection = featured.length ? featured : products.slice(0, 4);

  return (
    <>
      <section className="campaign">
        <img
          src={campaign}
          width={1920}
          height={1088}
          alt="Vision éditoriale GOAT’99 : silhouette de couture noire dans une galerie de pierre"
          fetchPriority="high"
        />
        <div className="campaign-copy">
          <div className="eyebrow">GOAT’99 · LUXURY HOUSE</div>
          <h1>
            L’allure est
            <br />
            une <em>signature.</em>
          </h1>
          <p>
            Un regard singulier. Une élégance sans compromis.
            <br />
            Entrez dans l’univers GOAT’99.
          </p>
          <div className="hero-actions">
            <Button variant="hero" asChild>
              <Link to="/boutique">DÉCOUVRIR LA BOUTIQUE <ArrowRight /></Link>
            </Button>
            <Button variant="editorial" asChild>
              <Link to="/$page" params={{ page: 'maison' }}>L’ESPRIT DE LA MAISON <ArrowRight /></Link>
            </Button>
          </div>
        </div>
        <div className="campaign-caption">
          <span>MODE · CRÉATION · ART DE VIVRE</span>
          <span>EXPLORER LA MAISON <ArrowDown size={12} /></span>
        </div>
      </section>

      {selection.length > 0 && (
        <section className="section">
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
