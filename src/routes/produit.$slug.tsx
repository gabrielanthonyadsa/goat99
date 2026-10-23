import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProduct } from '@/lib/goat/data.functions';
import { metadata } from '@/lib/goat/content';
import { useCurrency } from '@/lib/goat/currency';

const productQuery = (slug: string) =>
  queryOptions({ queryKey: ['product', slug], queryFn: () => getProduct({ data: { slug } }) });

export const Route = createFileRoute('/produit/$slug')({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} — GOAT’99` },
            { name: 'description', content: loaderData.description || `${loaderData.name}, pièce GOAT’99.` },
            { property: 'og:title', content: `${loaderData.name} — GOAT’99` },
            { property: 'og:description', content: loaderData.description || `${loaderData.name}, pièce GOAT’99.` },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary_large_image' },
            ...(loaderData.image_url?.startsWith('https://')
              ? [
                  { property: 'og:image', content: loaderData.image_url },
                  { name: 'twitter:image', content: loaderData.image_url },
                ]
              : []),
          ],
        }
      : metadata('Pièce', 'Une pièce de la Maison GOAT’99.'),
  component: ProductPage,
});

function ProductPage() {
  const { formatPrice } = useCurrency();
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  if (!product) return null;
  const price = formatPrice(product.price_minor, product.currency);
  return (
    <>
      <div className="product-page">
        <div className="product-visual">
          {product.image_url ? (
            <img src={product.image_url} width={900} height={1125} alt={product.name} />
          ) : (
            <div className="product-placeholder"><ShoppingBag size={40} /></div>
          )}
        </div>
        <div className="product-info">
          <div className="eyebrow">{product.category}</div>
          <h1>{product.name}</h1>
          <p className="product-price">{price}</p>
          {product.description && <p className="product-description">{product.description}</p>}
          <p className="notice">
            La vente en ligne n’est pas encore ouverte. Contactez la Maison pour toute demande concernant cette pièce.
          </p>
          <Button variant="outline" asChild>
            <Link to="/boutique"><ArrowLeft /> Retour à la boutique</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
