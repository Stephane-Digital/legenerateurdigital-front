export default function PricingPage() {
  const tiers = [
    { name: 'Essai', price: '0 €', features: ['10 crédits', 'Support communautaire'], cta: 'Commencer', href: '/auth' },
    { name: 'Pro', price: '29 € / mois', features: ['Illimité', 'Support prioritaire'], cta: 'Passer Pro', href: '/auth' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ margin: '8px 0 20px' }}>Tarifs</h1>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {tiers.map((t) => (
            <div key={t.name} style={{ background: '#121212', border: '1px solid #2b2b2b', borderRadius: 12, padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>{t.name}</h3>
              <div style={{ fontSize: 22, marginBottom: 12 }}>{t.price}</div>
              <ul style={{ margin: '0 0 12px 18px' }}>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                href={t.href}
                style={{
                  display: 'inline-block',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#2563eb',
                  color: '#fff',
                  border: '1px solid #1e40af',
                  textDecoration: 'none',
                }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
