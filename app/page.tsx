// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Home() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'ko'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api('/health');
        if (res.status === 'ok') {
          setStatus('ok');
          setMessage('API joignable ✅');
        } else {
          setStatus('ko');
          setMessage('Réponse inattendue');
        }
      } catch (e: any) {
        setStatus('ko');
        setMessage(e?.message ?? 'Failed to fetch');
      }
    })();
  }, []);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <main style={{ padding: 24 }}>
      <h1>Le Générateur Digital</h1>
      <div style={{ background: '#111', color: '#fff', padding: 16, borderRadius: 8, maxWidth: 760 }}>
        <p><b>Base URL API :</b> {base}</p>
        <p><b>API :</b> {status === 'ok' ? 'OK ✅' : status === 'checking' ? 'Vérification...' : 'Non joignable ❌'}</p>
        <p>{message}</p>
      </div>
    </main>
  );
}
