'use client';
import { useState } from 'react';
import { api, setToken } from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      setMsg('Compte créé ✅');
    } catch (err: any) {
      setMsg(err?.message ?? 'Erreur');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Créer un compte</h1>
      <form onSubmit={onSubmit} style={{ display:'grid', gap: 8, maxWidth: 360 }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom" required />
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" required />
        <button type="submit">Créer le compte</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
