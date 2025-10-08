'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [apiBase, setApiBase] = useState<string | undefined>(undefined);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    setApiBase(base);
    async function ping() {
      if (!base) {
        setApiStatus('fail');
        setMessage('NEXT_PUBLIC_API_BASE_URL est manquant côté Vercel.');
        return;
      }
      try {
        const r = await fetch(`${base}/health`, { cache: 'no-store' });
        if (r.ok) {
          setApiStatus('ok');
          setMessage('API joignable ✅');
        } else {
          setApiStatus('fail');
          setMessage(`API a répondu ${r.status}`);
        }
      } catch (e: any) {
        setApiStatus('fail');
        setMessage(e?.message ?? 'Erreur réseau');
      }
    }
    ping();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Le Générateur Digital</h1>
        <p className="mt-3 text-lg opacity-80">
          Crée & publie du contenu, gère pubs, tunnels, emails — en automatique.
        </p>

        {/* DIAGNOSTICS */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-3">Diagnostics</h2>
          <div className="space-y-1 text-sm">
            <div>
              <span className="opacity-70">Base URL API :</span>{' '}
              <code className="bg-black/30 px-2 py-0.5 rounded">{apiBase ?? '—'}</code>
            </div>
            <div>
              <span className="opacity-70">API :</span>{' '}
              {apiStatus === 'checking' && <span>vérification…</span>}
              {apiStatus === 'ok' && <span className="text-emerald-400">OK ✅</span>}
              {apiStatus === 'fail' && <span className="text-rose-400">Non joignable ❌</span>}
            </div>
            {message && <div className="opacity-80">{message}</div>}
          </div>
        </div>

        {/* PRICING */}
        <section className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold">Abonnement</h3>
            <p className="mt-2 opacity-80">Accès complet au Générateur Digital.</p>
            <div className="mt-4 text-3xl font-extrabold">27€ <span className="text-base font-medium opacity-70">/ mois</span></div>
            <ul className="mt-4 space-y-1 text-sm opacity-90">
              <li>• Création & publication auto</li>
              <li>• Gestion pubs & tunnels</li>
              <li>• Emails & automatisations</li>
              <li>• Mises à jour incluses</li>
            </ul>
            <a
              href="https://systeme.io/marketplace/checkout/TON-LIEN-CHECKOUT" // remplace par ton lien Systeme.io
              target="_blank" rel="noreferrer"
              className="mt-6 inline-block rounded-lg bg-white text-black px-4 py-2 font-semibold"
            >
              S’abonner maintenant
            </a>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-bold">Contact & Support</h3>
            <p className="mt-2 opacity-80">Besoin d’aide ? On s’occupe de tout.</p>
            <div className="mt-4 text-sm">
              Email : <a className="underline" href="mailto:contact@profitsduweb.com">contact@profitsduweb.com</a>
            </div>
            <div className="mt-6 text-sm opacity-80">
              Après achat, tu reçois l’accès automatiquement.
            </div>
          </div>
        </section>

        <footer className="mt-12 opacity-60 text-sm">
          © {new Date().getFullYear()} Le Générateur Digital — Tous droits réservés.
        </footer>
      </div>
    </main>
  );
}
