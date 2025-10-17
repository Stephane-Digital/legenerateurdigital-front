// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            marginBottom: 16,
            color: "#00e0ff",
            fontWeight: 700,
            textShadow: "0 0 10px rgba(0,224,255,.25)",
          }}
        >
          LeGenerateurDigital
        </h1>

        <p style={{ color: "#d0eaff", opacity: 0.9, marginBottom: 28 }}>
          Bienvenue 👋 — Utilise les liens ci-dessous pour t’inscrire ou te connecter.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/auth/register"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,224,255,1) 0%, rgba(0,123,255,1) 100%)",
              padding: "14px 18px",
              borderRadius: 10,
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Créer un compte
          </Link>
          <Link
            href="/auth/login"
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "14px 18px",
              borderRadius: 10,
              color: "#e6f3ff",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
