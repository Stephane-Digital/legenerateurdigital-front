'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ width: 680, maxWidth: '100%', background: '#121212', border: '1px solid #2b2b2b', borderRadius: 12, padding: 20 }}>
        <h1>Tableau de bord</h1>
        {!token ? (
          <p>
            Vous n’êtes pas connecté(e). <a href="/auth">Aller à l’auth</a>
          </p>
        ) : (
          <>
            <p>Jeton présent en localStorage ✅</p>
            <code style={{ wordBreak: 'break-all' }}>{token}</code>
          </>
        )}
      </div>
    </main>
  );
}
