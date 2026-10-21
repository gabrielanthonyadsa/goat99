import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import {
  getWorkspace,
  upsertProduct,
  deleteProduct,
  upsertEvent,
  deleteEvent,
  upsertNewsPost,
  deleteNewsPost,
  setMembershipStatus,
} from '@/lib/goat/data.functions';
import { useAccount } from '@/lib/goat/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { metadata } from '@/lib/goat/content';

export const Route = createFileRoute('/admin')({
  head: () => metadata('Administration', 'Espace de gestion réservé aux équipes autorisées de GOAT’99.'),
  component: Admin,
});

type Workspace = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof getWorkspace>>>>;
type Product = Workspace['products'][number];
type EventRow = Workspace['events'][number];
type NewsRow = Workspace['news'][number];
type MemberRow = Workspace['members'][number];

const memberStatus: Record<string, string> = {
  pending: 'en cours',
  approved: 'approuvée',
  rejected: 'non retenue',
  suspended: 'suspendue',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uploadImage(file: File): Promise<string | null> {
  const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
  if (error) return null;
  return path;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <label>
      Visuel (fichier ou URL)
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          const path = await uploadImage(file);
          setBusy(false);
          if (path) onChange(path);
        }}
      />
      <input
        placeholder="https://… ou chemin du visuel téléversé"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {busy && <span>Envoi du visuel…</span>}
    </label>
  );
}

function ProductForm({ initial, onDone }: { initial?: Product; onDone: () => void }) {
  const save = useServerFn(upsertProduct);
  const remove = useServerFn(deleteProduct);
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    price: initial ? String(initial.price_minor / 100) : '',
    currency: initial?.currency ?? 'XAF',
    image_url: initial?.image_url ?? '',
    status: initial?.status ?? 'draft',
    featured: initial?.featured ?? false,
  });
  const [message, setMessage] = useState('');
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setMessage('');
        try {
          await save({
            data: {
              id: initial?.id,
              name: form.name,
              slug: form.slug || slugify(form.name),
              category: form.category,
              description: form.description,
              price_minor: Math.round(parseFloat(form.price.replace(',', '.')) * 100) || 0,
              currency: form.currency,
              image_url: form.image_url || null,
              status: form.status,
              featured: form.featured,
            },
          });
          onDone();
        } catch {
          setMessage('L’enregistrement a échoué. Vérifiez les champs.');
        }
      }}
    >
      <label>Nom<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <label>Identifiant (slug)<input value={form.slug} placeholder={slugify(form.name)} onChange={(e) => set('slug', e.target.value)} /></label>
      <label>Catégorie<input required value={form.category} placeholder="T-shirts, Accessoires, Collections…" onChange={(e) => set('category', e.target.value)} /></label>
      <label>Description<textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
      <label>Prix<input required inputMode="decimal" value={form.price} placeholder="20000" onChange={(e) => set('price', e.target.value)} /></label>
      <label>Devise<input required value={form.currency} onChange={(e) => set('currency', e.target.value)} /></label>
      <ImageField value={form.image_url} onChange={(v) => set('image_url', v)} />
      <label>Statut
        <select value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>
      <label className="check">
        <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
        Mettre en avant sur l’accueil
      </label>
      <div className="admin-form-actions">
        <Button type="submit">{initial ? 'Enregistrer les modifications' : 'Ajouter la pièce'}</Button>
        {initial && (
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await remove({ data: { id: initial.id } });
              onDone();
            }}
          >
            Retirer
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onDone}>Annuler</Button>
      </div>
      {message && <p role="alert">{message}</p>}
    </form>
  );
}

function EventForm({ initial, onDone }: { initial?: EventRow; onDone: () => void }) {
  const save = useServerFn(upsertEvent);
  const remove = useServerFn(deleteEvent);
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    event_date: initial?.event_date ?? '',
    venue: initial?.venue ?? '',
    capacity: initial?.capacity != null ? String(initial.capacity) : '',
    status: initial?.status ?? 'draft',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await save({
          data: {
            id: initial?.id,
            title: form.title,
            description: form.description,
            event_date: form.event_date || null,
            venue: form.venue || null,
            capacity: form.capacity ? parseInt(form.capacity, 10) : null,
            status: form.status,
          },
        });
        onDone();
      }}
    >
      <label>Titre<input required value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
      <label>Description<textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
      <label>Date<input type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} /></label>
      <label>Lieu<input value={form.venue} onChange={(e) => set('venue', e.target.value)} /></label>
      <label>Capacité<input inputMode="numeric" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} /></label>
      <label>Statut
        <select value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>
      <div className="admin-form-actions">
        <Button type="submit">{initial ? 'Enregistrer' : 'Ajouter l’événement'}</Button>
        {initial && (
          <Button type="button" variant="outline" onClick={async () => { await remove({ data: { id: initial.id } }); onDone(); }}>
            Retirer
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onDone}>Annuler</Button>
      </div>
    </form>
  );
}

function NewsForm({ initial, onDone }: { initial?: NewsRow; onDone: () => void }) {
  const save = useServerFn(upsertNewsPost);
  const remove = useServerFn(deleteNewsPost);
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt ?? '',
    content: initial?.content ?? '',
    image_url: initial?.image_url ?? '',
    status: initial?.status ?? 'draft',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await save({
          data: {
            id: initial?.id,
            title: form.title,
            slug: form.slug || slugify(form.title),
            excerpt: form.excerpt,
            content: form.content,
            image_url: form.image_url || null,
            status: form.status,
            published_at: form.status === 'published' ? (initial?.published_at ?? new Date().toISOString()) : null,
          },
        });
        onDone();
      }}
    >
      <label>Titre<input required value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
      <label>Identifiant (slug)<input value={form.slug} placeholder={slugify(form.title)} onChange={(e) => set('slug', e.target.value)} /></label>
      <label>Résumé<textarea rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></label>
      <label>Contenu<textarea rows={6} value={form.content} onChange={(e) => set('content', e.target.value)} /></label>
      <ImageField value={form.image_url} onChange={(v) => set('image_url', v)} />
      <label>Statut
        <select value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>
      <div className="admin-form-actions">
        <Button type="submit">{initial ? 'Enregistrer' : 'Publier l’actualité'}</Button>
        {initial && (
          <Button type="button" variant="outline" onClick={async () => { await remove({ data: { id: initial.id } }); onDone(); }}>
            Retirer
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onDone}>Annuler</Button>
      </div>
    </form>
  );
}

function Admin() {
  const { user } = useAccount();
  const load = useServerFn(getWorkspace);
  const setStatus = useServerFn(setMembershipStatus);
  const queryClient = useQueryClient();
  const workspace = useQuery({ queryKey: ['admin', user?.id], enabled: !!user, queryFn: () => load() });
  const [tab, setTab] = useState<'produits' | 'evenements' | 'actualites' | 'club'>('produits');
  const [editing, setEditing] = useState<string | null>(null); // 'new' ou id
  const refresh = () => {
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ['admin'] });
    queryClient.invalidateQueries({ queryKey: ['catalog'] });
    queryClient.invalidateQueries({ queryKey: ['news'] });
  };

  if (!user)
    return (
      <div className="empty-state">
        <p>Connexion requise pour accéder à la gestion.</p>
        <Button asChild><Link to="/auth">Se connecter</Link></Button>
      </div>
    );
  if (workspace.isPending) return <div className="empty-state"><p>Vérification des autorisations…</p></div>;
  if (workspace.isError)
    return (
      <div className="empty-state">
        <p role="alert">Accès réservé à l’équipe autorisée. Aucun rôle administrateur n’est attribué automatiquement.</p>
      </div>
    );

  const { products, events, members, news } = workspace.data;

  return (
    <>
      <div className="page-intro">
        <div className="eyebrow">CENTRE DE CONTRÔLE</div>
        <h1>GOAT’99 · Administration</h1>
      </div>
      <div className="account-layout">
        <div className="admin-grid">
          <article>Produits<strong>{products.length}</strong></article>
          <article>Événements<strong>{events.length}</strong></article>
          <article>Actualités<strong>{news.length}</strong></article>
          <article>Candidatures au Club<strong>{members.length}</strong></article>
        </div>
        <div className="account-tabs">
          {([['produits', 'Produits'], ['evenements', 'Événements'], ['actualites', 'Actualités'], ['club', 'Club']] as const).map(([key, label]) => (
            <Button key={key} variant={tab === key ? 'default' : 'ghost'} onClick={() => { setTab(key); setEditing(null); }}>
              {label}
            </Button>
          ))}
        </div>

        {tab === 'produits' && (
          <>
            <Button onClick={() => setEditing('new')}>Ajouter une pièce</Button>
            {editing === 'new' && <ProductForm onDone={refresh} />}
            {products.map((p) => (
              <div key={p.id}>
                <div className="admin-list">
                  <span>
                    {p.name} · {p.category} · {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency }).format(p.price_minor / 100)}
                    {p.featured ? ' · vedette' : ''}
                  </span>
                  <span>
                    {p.status === 'draft' ? 'Brouillon' : p.status === 'published' ? 'Publié' : 'Archivé'}{' '}
                    <Button variant="link" onClick={() => setEditing(editing === p.id ? null : p.id)}>Modifier</Button>
                  </span>
                </div>
                {editing === p.id && <ProductForm initial={p} onDone={refresh} />}
              </div>
            ))}
            {!products.length && <p>Aucune pièce. Ajoutez la première pièce du catalogue.</p>}
          </>
        )}

        {tab === 'evenements' && (
          <>
            <Button onClick={() => setEditing('new')}>Ajouter un événement</Button>
            {editing === 'new' && <EventForm onDone={refresh} />}
            {events.map((e) => (
              <div key={e.id}>
                <div className="admin-list">
                  <span>{e.title} · {e.event_date ?? 'date à confirmer'}</span>
                  <span>
                    {e.status === 'draft' ? 'Brouillon' : e.status}{' '}
                    <Button variant="link" onClick={() => setEditing(editing === e.id ? null : e.id)}>Modifier</Button>
                  </span>
                </div>
                {editing === e.id && <EventForm initial={e} onDone={refresh} />}
              </div>
            ))}
            {!events.length && <p>Aucun événement enregistré.</p>}
          </>
        )}

        {tab === 'actualites' && (
          <>
            <Button onClick={() => setEditing('new')}>Ajouter une actualité</Button>
            {editing === 'new' && <NewsForm onDone={refresh} />}
            {news.map((n) => (
              <div key={n.id}>
                <div className="admin-list">
                  <span>{n.title}</span>
                  <span>
                    {n.status === 'draft' ? 'Brouillon' : n.status === 'published' ? 'Publié' : 'Archivé'}{' '}
                    <Button variant="link" onClick={() => setEditing(editing === n.id ? null : n.id)}>Modifier</Button>
                  </span>
                </div>
                {editing === n.id && <NewsForm initial={n} onDone={refresh} />}
              </div>
            ))}
            {!news.length && <p>Aucune actualité publiée.</p>}
          </>
        )}

        {tab === 'club' && (
          <>
            {members.map((m) => (
              <div className="admin-list" key={m.id}>
                <span>{m.motivation.slice(0, 120)}{m.motivation.length > 120 ? '…' : ''}</span>
                <span>
                  <select
                    aria-label="Statut de la candidature"
                    value={m.status}
                    onChange={async (e) => {
                      await setStatus({ data: { id: m.id, status: e.target.value } });
                      refresh();
                    }}
                  >
                    {Object.entries(memberStatus).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </span>
              </div>
            ))}
            {!members.length && <p>Aucune candidature pour le moment.</p>}
          </>
        )}

        <p className="notice">
          Les paiements et la billetterie ne sont pas activés : les pièces publiées sont présentées sans achat en ligne.
        </p>
      </div>
    </>
  );
}
