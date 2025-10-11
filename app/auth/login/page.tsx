'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Selon ton backend FastAPI (ou autre), ajuste les clés si besoin :
      // ex: { email, password } ou { username, password }
      const res = await api<{ access_token: string; token_type?: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      // Stocker le token et rediriger
      if (res?.access_token) {
        setToken(res.access_token);
        router.push('/dashboard');
      } else {
        setError("Réponse inattendue du serveur : token manquant");
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h1>Connexion</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
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
            autoComplete="current-password"
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
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        {error && (
          <p style={{ color: 'tomato', marginTop: 8 }}>
            {error}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Pas de compte ? <a href="/auth/register">Créer un compte</a>
      </p>
    </main>
  );
}
