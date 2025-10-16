// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 style={{ fontSize: 42, fontWeight: 700, color: "#00e0ff" }}>
        LeGenerateurDigital
      </h1>

      <p>Bienvenue 👋 — Utilise les liens ci-dessous pour t’inscrire ou te connecter.</p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link
          href="/auth/register"
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "linear-gradient(90deg, #00e0ff, #007bff)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Créer un compte
        </Link>

        <Link
          href="/auth/login"
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
