import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        gap: 16,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>
          <span style={{ color: "#00e0ff" }}>LeGenerateur</span>Digital
        </h1>
        <p>Bienvenue 👋 — Utilise les liens ci-dessous pour t’inscrire ou te connecter.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          <Link
            href="/register"
            style={{
              background: "linear-gradient(90deg, #00e0ff, #007bff)",
              color: "white",
              padding: "12px 18px",
              borderRadius: 10,
            }}
          >
            Créer un compte
          </Link>
          <Link
            href="/auth/login"
            style={{
              background: "#2b2f3a",
              color: "white",
              padding: "12px 18px",
              borderRadius: 10,
              border: "1px solid #3d4455",
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
