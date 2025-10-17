"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!base) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE_URL est manquant dans Vercel > Settings > Environment Variables."
        );
      }

      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Impossible de se connecter");
      }

      // ✅ Stockage du token puis redirection
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Erreur inconnue");
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
        fontFamily: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#fff",
        position: "relative", // <-- important pour positionner le titre
        overflow: "hidden",
      }}
    >
      {/* 🌌 Dégradé animé de fond */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #1a2a6c, #0f2027)",
          backgroundSize: "400% 400%",
          animation: "gradientMove 15s ease infinite",
          zIndex: 0,
        }}
      />

      {/* ✨ Particules / halos */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.10) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* 🧷 TITRE en haut de page */}
      <h1
        style={{
          position: "absolute",
          top: 32,
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 800,
          letterSpacing: 0.5,
          background: "linear-gradient(90deg, #00e0ff, #00ffb3)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textShadow: "0 0 18px rgba(0, 224, 255, 0.15)",
          zIndex: 3,
        }}
      >
        LeGenerateurDigital
      </h1>

      {/* 🧩 Carte / formulaire */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.08)",
          padding: "36px 42px",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          maxWidth: 520,
          width: "92%",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 18,
            fontWeight: 700,
            color: "#cfefff",
            textAlign: "center",
          }}
        >
          Se connecter
        </h2>

        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gap: 14,
          }}
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
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {err && (
          <p style={{ color: "#ff9a9a", marginTop: 14, textAlign: "center" }}>
            {err}
          </p>
        )}
      </div>

      {/* 🌀 Animation CSS du dégradé */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
  );
}

/* ---- Styles réutilisables ---- */

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.14)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "14px 0",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer",
  transition: "transform .08s ease",
};
