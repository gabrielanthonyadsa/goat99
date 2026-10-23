import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAccount } from '@/lib/goat/auth';
import { metadata } from '@/lib/goat/content';
import { AddsLogo, AppleLogo, GoogleLogo } from '@/components/goat/brand-icons';
import campaign from '@/assets/maison-campaign.jpg';
 
// Identifiant du fournisseur OIDC personnalisé créé dans Lovable Cloud (Utilisateurs > Authentification > OIDC).
// Si Cloud affiche un autre identifiant, modifier uniquement cette ligne.
const ADDS_PROVIDER = 'custom:adds';
 
export const Route = createFileRoute('/auth')({
  head: () => metadata('Connexion', 'Connectez-vous à votre espace GOAT’99 avec ADDS, Google, Apple ou e-mail.'),
  component: Auth,
});
 
type Mode = 'login' | 'signup' | 'forgot';
 
function Auth() {
  const { user } = useAccount();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
 
  // Erreur renvoyée par le fournisseur au retour sur /auth.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const err = q.get('error_description') || h.get('error_description') || q.get('error') || h.get('error');
    if (err) setMessage('La connexion avec le fournisseur n’a pas abouti. Veuillez réessayer ou choisir un autre mode de connexion.');
  }, []);
 
  async function adds() {
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: ADDS_PROVIDER as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
        options: { redirectTo: window.location.origin + '/auth', scopes: 'openid profile email' },
      });
      if (error) setMessage('ADDS n’est pas encore activé sur ce site. Utilisez un autre mode de connexion en attendant.');
    } catch {
      setMessage('Le service de connexion ADDS est momentanément indisponible.');
    } finally {
      setBusy(false);
    }
  }
 
  async function social(provider: 'google' | 'apple') {
    setMessage('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + '/auth' });
      if (result.error) return setMessage('La connexion n’a pas abouti. Veuillez réessayer.');
      if (!result.redirected) navigate({ to: '/compte' });
    } catch {
      setMessage('Le service de connexion est indisponible.');
    }
  }
 
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
        setMessage(error ? 'La demande n’a pas abouti. Réessayez plus tard.' : 'Si cette adresse correspond à un compte, vous recevrez un lien de réinitialisation.');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/auth', data: { display_name: name } } });
        setMessage(error ? 'L’inscription n’a pas abouti. Vérifiez les informations ou réessayez.' : 'Consultez votre e-mail pour confirmer votre compte avant de vous connecter.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage('Connexion impossible. Vérifiez vos informations.');
        else navigate({ to: '/compte' });
      }
    } catch {
      setMessage('Le service est momentanément indisponible.');
    } finally {
      setBusy(false);
    }
  }
 
  const title = mode === 'signup' ? 'Créer votre compte' : mode === 'forgot' ? 'Mot de passe oublié' : 'Bienvenue chez GOAT’99';
  const subtitle =
    mode === 'signup'
      ? 'Un seul compte pour la boutique, les événements et le Club.'
      : mode === 'forgot'
        ? 'Indiquez votre adresse e-mail, nous vous enverrons un lien sécurisé.'
        : 'Accédez à vos commandes, vos invitations et votre espace privé.';
 
  return (
    <section className="auth-shell">
      <aside className="auth-visual" aria-hidden="true">
        <img src={campaign} alt="" loading="eager" />
        <div className="auth-visual-copy">
          <div className="eyebrow">GOAT’99 · LUXURY HOUSE</div>
          <p>L’allure est une <em>signature.</em></p>
        </div>
      </aside>
 
      <div className="auth-panel">
        {user ? (
          <div className="auth-card">
            <div className="auth-badge"><Check size={18} /></div>
            <h1>Votre espace</h1>
            <p className="auth-sub">Vous êtes connecté à GOAT’99.</p>
            <Button className="auth-primary" asChild>
              <Link to="/compte">Accéder à mon compte <ArrowRight /></Link>
            </Button>
          </div>
        ) : (
          <div className="auth-card">
            <div className="eyebrow">ESPACE CLIENT</div>
            <h1>{title}</h1>
            <p className="auth-sub">{subtitle}</p>
 
            {mode !== 'forgot' && (
              <>
                <div className="auth-providers">
                  <button type="button" className="auth-btn auth-btn-adds" disabled={busy} onClick={adds}>
                    <AddsLogo /> <span>Continuer avec ADDS</span>
                  </button>
                  <button type="button" className="auth-btn" onClick={() => social('google')}>
                    <GoogleLogo /> <span>Continuer avec Google</span>
                  </button>
                  <button type="button" className="auth-btn" onClick={() => social('apple')}>
                    <AppleLogo /> <span>Continuer avec Apple</span>
                  </button>
                </div>
                <div className="auth-divider"><span><Mail size={12} /> ou avec votre e-mail</span></div>
              </>
            )}
 
            <form onSubmit={submit} className="auth-form">
              {mode === 'signup' && (
                <label>Nom d’affichage
                  <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
              )}
              <label>Adresse e-mail
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              {mode !== 'forgot' && (
                <label>Mot de passe
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                </label>
              )}
              <Button disabled={busy} type="submit" className="auth-primary">
                {busy ? 'Veuillez patienter…' : mode === 'signup' ? 'Créer mon compte' : mode === 'forgot' ? 'Recevoir le lien' : 'Se connecter'} <ArrowRight />
              </Button>
            </form>
 
            {message && <div className="auth-message" role="status">{message}</div>}
 
            <div className="auth-links">
              <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage(''); }}>
                {mode === 'signup' ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? Créer un compte'}
              </button>
              {mode === 'login' && <button type="button" onClick={() => { setMode('forgot'); setMessage(''); }}>Mot de passe oublié ?</button>}
              {mode === 'forgot' && <button type="button" onClick={() => { setMode('login'); setMessage(''); }}>Retour à la connexion</button>}
            </div>
 
            <ul className="auth-trust">
              <li><ShieldCheck size={14} /> Connexion sécurisée</li>
              <li><Lock size={14} /> Vos données restent privées</li>
            </ul>
            <p className="auth-legal">
              En continuant, vous acceptez notre <Link to="/$page" params={{ page: 'confidentialite' }}>politique de confidentialité</Link>.
              <span className="auth-credit">Conçu et développé par Nuvex Technology</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
 
