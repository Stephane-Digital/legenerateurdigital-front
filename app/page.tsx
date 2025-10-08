'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    async function check() {
      if (!apiBase) {
        setStatus('fail');
        setMsg('NEXT_PUBLIC_API_BASE_URL est manquant sur Vercel.');
        return;
      }
      try {
        const r = await fetch(`${apiBase}/health`, { cache: 'no-store' });
        if (r.ok) {
          setStatus('ok');
          setMsg('API joignable ✅');
        } else {
          setStatus('fail');
          setMsg(`API a répondu ${r.status}`);
        }
      } catch (e: any) {
        setStatus('fail');
        setMsg(e?.message ?? 'Erreur réseau');
      }
    }
    check();
  }, [apiBase]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>Le Générateur Digital</h1>
      <p style={{ marginTop: 8 }}>Page custom (pas le template Next.js)</p>

      <section style={{ marginTop: 24, padding: 16, border: '1px solid #333', borderRadius: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Diagnostics</h2>
        <p style={{ marginTop: 8 }}>
          Base URL API : <code>{apiBase ?? '—'}</code>
        </p>
        <p>
          API :{' '}
          {status === 'checking' ? 'vérification…' : status === 'ok' ? 'OK ✅' : 'Non joignable ❌'}
        </p>
        {msg && <p style={{ opacity: 0.8 }}>{msg}</p>}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: '1px solid #333', borderRadius: 12 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>Abonnement</h3>
        <p style={{ marginTop: 8 }}>Accès complet au Générateur Digital.</p>
        <p style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>27€ / mois</p>
        <a
          href="https://systeme.io/marketplace/checkout/TON-LIEN-CHECKOUT"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '10px 16px',
            background: 'black',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
            border: '1px solid #333',
          }}
        >
          S’abonner maintenant
        </a>
      </section>
    </main>
  );
}
