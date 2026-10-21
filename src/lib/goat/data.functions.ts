import { createServerFn } from '@tanstack/react-start';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

type PublicClient = SupabaseClient<Database>;

function publicClient(): PublicClient {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url = process.env['SUPABASE_URL'];
  if (!key || !url) throw new Error('Service indisponible');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith('sb_') && h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization');
        h.set('apikey', key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Les visuels sont stockés dans un espace privé : on signe un lien temporaire.
async function signImages<T extends { image_url: string | null }>(client: PublicClient, rows: T[]): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.image_url || row.image_url.startsWith('http')) return row;
      const { data } = await client.storage.from('product-images').createSignedUrl(row.image_url, 3600);
      return { ...row, image_url: data?.signedUrl ?? null };
    }),
  );
}

export const getCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const client = publicClient();
  const { data, error } = await client
    .from('products')
    .select('id,name,category,description,price_minor,currency,image_url,slug,featured')
    .eq('status', 'published');
  if (error) throw new Error('Catalogue indisponible');
  return signImages(client, data);
});

export const getProduct = createServerFn({ method: 'GET' })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data: { slug } }) => {
    const client = publicClient();
    const { data, error } = await client
      .from('products')
      .select('id,name,category,description,price_minor,currency,image_url,slug,featured')
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error('Pièce indisponible');
    if (!data) return null;
    const [signed] = await signImages(client, [data]);
    return signed;
  });

export const getNews = createServerFn({ method: 'GET' }).handler(async () => {
  const client = publicClient();
  const { data, error } = await client
    .from('news_posts')
    .select('id,title,slug,excerpt,image_url,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw new Error('Actualités indisponibles');
  return signImages(client, data);
});

async function requireAdmin(context: { supabase: PublicClient }) {
  const { data: admin, error } = await context.supabase.rpc('is_admin');
  if (error || !admin) throw new Error('Accès réservé à l’équipe autorisée.');
}

export const getWorkspace = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const [products, events, members, news] = await Promise.all([
      context.supabase.from('products').select('*').order('created_at', { ascending: false }),
      context.supabase.from('events').select('*').order('created_at', { ascending: false }),
      context.supabase.from('membership_applications').select('*').order('created_at', { ascending: false }),
      context.supabase.from('news_posts').select('*').order('created_at', { ascending: false }),
    ]);
    if (products.error || events.error || members.error || news.error) throw new Error('Données indisponibles');
    return { products: products.data, events: events.data, members: members.data, news: news.data };
  });

type ProductInput = {
  id?: string | undefined;
  name: string;
  slug: string;
  category: string;
  description: string;
  price_minor: number;
  currency: string;
  image_url: string | null;
  status: string;
  featured: boolean;
};

export const upsertProduct = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ProductInput) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from('products').update(fields).eq('id', id)
      : context.supabase.from('products').insert(fields);
    const { error } = await query;
    if (error) throw new Error('La pièce n’a pas pu être enregistrée.');
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from('products').delete().eq('id', data.id);
    if (error) throw new Error('La pièce n’a pas pu être retirée.');
    return { ok: true };
  });

type EventInput = {
  id?: string | undefined;
  title: string;
  description: string;
  event_date: string | null;
  venue: string | null;
  capacity: number | null;
  status: string;
};

export const upsertEvent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: EventInput) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from('events').update(fields).eq('id', id)
      : context.supabase.from('events').insert(fields);
    const { error } = await query;
    if (error) throw new Error('L’événement n’a pas pu être enregistré.');
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from('events').delete().eq('id', data.id);
    if (error) throw new Error('L’événement n’a pas pu être retiré.');
    return { ok: true };
  });

type NewsInput = {
  id?: string | undefined;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  status: string;
  published_at: string | null;
};

export const upsertNewsPost = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: NewsInput) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from('news_posts').update(fields).eq('id', id)
      : context.supabase.from('news_posts').insert(fields);
    const { error } = await query;
    if (error) throw new Error('L’actualité n’a pas pu être enregistrée.');
    return { ok: true };
  });

export const deleteNewsPost = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from('news_posts').delete().eq('id', data.id);
    if (error) throw new Error('L’actualité n’a pas pu être retirée.');
    return { ok: true };
  });

export const setMembershipStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(data.status)) {
      throw new Error('Statut inconnu.');
    }
    const { error } = await context.supabase
      .from('membership_applications')
      .update({ status: data.status })
      .eq('id', data.id);
    if (error) throw new Error('Le statut n’a pas pu être mis à jour.');
    return { ok: true };
  });
