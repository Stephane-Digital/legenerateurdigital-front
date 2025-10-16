// app/page.tsx
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "'Poppins', sans-serif",
        background:
          "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #1a2a6c, #0f2027)",
        color: "#fff",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 720 }}>
        <h1 style={{ marginBottom: 12, fontWeight: 700, color: "#00e0ff" }}>
          LeGenerateurDigital
        </h1>
        <p style={{ opacity: 0.9, marginBottom: 24 }}>
          Bienvenue 👋 — Utilise les liens ci-dessous pour t’inscrire ou te
          connecter.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a
            href="/register"
            style={{
              background: "linear-gradient(90deg, #00e0ff, #007bff)",
              color: "white",
              padding: "12px 18px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Créer un compte
          </a>
          <a
            href="/login"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              padding: "12px 18px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            Se connecter
          </a>
        </div>
      </div>
    </main>
  );
}
