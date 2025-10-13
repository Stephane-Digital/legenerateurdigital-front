'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Adapte les clés à ton backend si besoin (username vs email, etc.)
     const res = await api('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, password }),
});

      // Plusieurs backends renvoient soit access_token, soit token.
      const token = res?.access_token ?? res?.token;

      if (token) {
        setToken(token);
        router.push('/dashboard');
        return;
      }

      // Si le backend ne renvoie pas de token à l'inscription,
      // on enchaîne par un login.
      try {
        const login = await api<{ access_token?: string; token?: string }>(
          '/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          }
        );
        const t = login?.access_token ?? login?.token;
        if (t) {
          setToken(t);
          router.push('/dashboard');
        } else {
          setError('Inscription réussie, mais aucun token reçu.');
        }
      } catch (e: any) {
        setError(e?.message || 'Inscription OK, connexion auto impossible.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h1>Créer un compte</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Nom</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: '1px solid #444' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={{ padding: 10, borderRadius: 8, border: '1px solid #444' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            style={{ padding: 10, borderRadius: 8, border: '1px solid #444' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Création…' : 'Créer un compte'}
        </button>

        {error && (
          <p style={{ color: 'tomato', marginTop: 8 }}>
            {error}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Déjà un compte ? <a href="/auth/login">Se connecter</a>
      </p>
    </main>
  );
}
