'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'register') {
        const res = await apiPost('/auth/register', { email, password, name });
        if ((res as any)?.token) {
          localStorage.setItem('token', (res as any).token);
          setMsg({ kind: 'ok', text: 'Compte créé 🎉 — vous êtes connecté.' });
        } else setMsg({ kind: 'ok', text: 'Inscription réussie.' });
      } else {
        const res = await apiPost('/auth/login', { email, password });
        if ((res as any)?.token) {
          localStorage.setItem('token', (res as any).token);
          setMsg({ kind: 'ok', text: 'Connexion réussie ✅' });
        } else setMsg({ kind: 'ok', text: 'Connecté.' });
      }
    } catch (err: any) {
      setMsg({ kind: 'err', text: err?.message || 'Erreur inattendue' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <div style={{ width: 520, maxWidth: '100%', background: '#121212', border: '1px solid #2b2b2b', borderRadius: 12, padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Mon compte</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setMode('login')}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2b2b2b', background: mode === 'login' ? '#1e1e1e' : 'transparent', color: '#fff' }}
          >
            Se connecter
          </button>
          <button
            onClick={() => setMode('register')}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2b2b2b', background: mode === 'register' ? '#1e1e1e' : 'transparent', color: '#fff' }}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          {mode === 'register' && (
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Nom</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                style={inputStyle}
              />
            </label>
          )}
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="vous@email.com"
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Mot de passe</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </label>

          <button
            disabled={busy}
            style={{
              marginTop: 6,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#2563eb',
              color: '#fff',
              border: '1px solid #1e40af',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Patientez…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
          </button>

          {msg && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                border: '1px solid',
                borderColor: msg.kind === 'ok' ? '#1b4332' : '#5c2b2b',
                background: msg.kind === 'ok' ? '#0c2612' : '#2a0e0e',
              }}
            >
              {msg.text}
            </div>
          )}

          <small style={{ opacity: 0.7 }}>
            Astuce : le jeton (si renvoyé) est stocké dans <code>localStorage</code>.
          </small>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #2b2b2b',
  background: '#1b1b1b',
  color: '#fff',
};
