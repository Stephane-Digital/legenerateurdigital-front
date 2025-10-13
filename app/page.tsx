'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '@/lib/api';

export default function HomePage() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'ko'>('checking');
  const [message, setMessage] = useState('');
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const testAPI = async () => {
      setStatus('checking');
      setMessage('');

      const isHealthy = await checkHealth();

if (isHealthy) {
  setStatus('ok');
  setMessage('API joignable !');
} else {
  setStatus('ko');
  setMessage('API non joignable 😢');
}
    };

    testAPI();
  }, []);

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 800,
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Le Générateur Digital</h1>

      <div
        style={{
          background: '#111',
          color: 'white',
          padding: 24,
          borderRadius: 12,
        }}
      >
        <p>
          <strong>Base URL API :</strong>{' '}
          <a
            href={base}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0af' }}
          >
            {base}
          </a>
        </p>

        <p style={{ marginTop: 12 }}>
          <strong>API :</strong>{' '}
          {status === 'checking' && <span>⏳ Vérification...</span>}
          {status === 'ok' && (
            <span style={{ color: 'limegreen' }}>Joignable ✅</span>
          )}
          {status === 'ko' && (
            <span style={{ color: 'red' }}>Non joignable ❌</span>
          )}
        </p>

        <p style={{ marginTop: 8, color: '#ccc' }}>{message}</p>
      </div>
    </main>
  );
}
