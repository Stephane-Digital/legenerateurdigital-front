"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Impossible de se connecter");
      }

      // si ton API renvoie un token, tu peux le stocker ici si besoin
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErr(err?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",

        // ✅ fond bleu dégradé statique (aucune animation)
        background:
          "linear-gradient(180deg, #0E2A3A 0%, #0F3E5A 50%, #0B2740 100%)",
      }}
    >
      {/* ⛳️ Titre de marque en haut */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: 0.2,
            color: "#00E0FF",
            textShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          LeGenerateurDigital
        </h1>
      </div>

      {/* 🧩 Carte / formulaire */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.08)",
          padding: "34px 42px",
          borderRadius: 16,
          boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
          maxWidth: 520,
          width: "90%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2 style={{ color: "#BFEAFF", marginBottom: 12, fontWeight: 700 }}>
          Se connecter
        </h2>

        <form
          onSubmit={onSubmit}
          style={{ display: "grid", gap: 14, marginTop: 10 }}
        >
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPwd(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ff9aa2", marginTop: 14, fontWeight: 600 }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 10,
  border: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.16)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "14px 0",
  border: "none",
  borderRadius: 10,
  fontSize: 17,
  cursor: "pointer",
  fontWeight: 700,
};
