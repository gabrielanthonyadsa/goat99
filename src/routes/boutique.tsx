import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getCatalog } from '@/lib/goat/data.functions';
import { metadata } from '@/lib/goat/content';

const catalog = queryOptions({ queryKey: ['catalog'], queryFn: () => getCatalog() });

export const Route = createFileRoute('/boutique')({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalog),
  head: () =>
    metadata(
      'La Boutique',
      'Le catalogue officiel GOAT’99. Les pièces sont disponibles après validation et publication par la Maison.',
    ),
  component: Boutique,
});

function Boutique() {
  const { data } = useSuspenseQuery(catalog);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('q') ?? '');
  }, []);
  const products = data.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) && (category === 'all' || p.category === category),
  );
  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">LA SÉLECTION GOAT’99</div>
        <h1>La Boutique</h1>
        <p>Les expressions de la Maison, réunies en un même lieu.</p>
      </div>
      <div className="catalog-toolbar">
        <input
          aria-label="Rechercher une pièce"
          placeholder="Rechercher une pièce"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          {[...new Set(data.map((p) => p.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {products.length ? (
        <div className="catalog-grid">
          {products.map((p) => (
            <Link key={p.id} to="/produit/$slug" params={{ slug: p.slug }} className="catalog-item">
              <article>
                {p.image_url ? (
                  <img src={p.image_url} width={600} height={750} alt={p.name} loading="lazy" />
                ) : (
                  <div className="product-placeholder" />
                )}
                <h2>{p.name}</h2>
                <p>{p.description}</p>
                <p>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency }).format(p.price_minor / 100)}</p>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={28} />
          <h2>{data.length ? 'Aucune pièce trouvée' : 'Le prochain chapitre se prépare.'}</h2>
          <p>
            {data.length
              ? 'Essayez une autre recherche.'
              : 'La Maison n’a pas encore publié de pièces. Découvrez bientôt le catalogue officiel GOAT’99.'}
          </p>
        </div>
      )}
    </>
  );
}
