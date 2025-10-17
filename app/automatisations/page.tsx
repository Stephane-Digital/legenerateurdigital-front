// app/automatisations/page.tsx
// Page propre, sans fond animé ni keyframes ni halos.

export default function AutomatisationsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          width: "min(1000px, 92vw)",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 16,
          padding: 28,
          backdropFilter: "blur(6px)",
          boxShadow: "0 12px 32px rgba(0,0,0,.25)",
        }}
      >
        <header style={{ marginBottom: 16, textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              lineHeight: 1.25,
              fontSize: "clamp(22px, 3.2vw, 34px)",
              color: "#00e0ff",
              textShadow: "0 1px 8px rgba(0,224,255,.25)",
            }}
          >
            Automatisations
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              opacity: 0.85,
              fontSize: "clamp(14px, 2.2vw, 16px)",
            }}
          >
            Centralisez et gérez vos automatisations sans prise de tête.
          </p>
        </header>

        {/* Contenu exemple — tu peux remplacer par ta logique réelle */}
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            { title: "Bienvenue", desc: "Ajoutez vos scénarios d’automatisation." },
            { title: "Exécution", desc: "Planifiez ou lancez vos tâches." },
            { title: "Logs", desc: "Suivez l’historique et les statuts." },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.06)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#bff6ff",
                }}
              >
                {item.title}
              </h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
