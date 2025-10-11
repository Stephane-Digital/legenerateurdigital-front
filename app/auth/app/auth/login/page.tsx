'use client';
import { useState } from 'react';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data?.token) {
        setToken(data.token);
        setMsg('Connecté ✅');
      } else {
        setMsg('Réponse inattendue');
      }
    } catch (err: any) {
      setMsg(err?.message ?? 'Erreur');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Connexion</h1>
      <form onSubmit={onSubmit} style={{ display:'grid', gap: 8, maxWidth: 360 }}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" required />
        <button type="submit">Se connecter</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
