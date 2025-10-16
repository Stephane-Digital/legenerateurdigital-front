// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Base API : accepte les 2 noms d'env
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // ⚠️ FastAPI /auth/login attend du form-url-encoded avec username & password
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Identifiants invalides");
      }

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      setSuccess("Connecté !");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
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
        fontFamily: "'Poppins', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌌 Dégradé animé */}
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

      {/* ✨ Effets lumineux */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.10) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* Carte */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(30, 35, 50, 0.55)",
          padding: "40px 50px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginBottom: 10, fontWeight: 600 }}>
          Se connecter
        </h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            className="auth-input"
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ff8080", marginTop: 16, fontWeight: "bold" }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "#00ffb3", marginTop: 12, fontWeight: "bold" }}>
            {success}
          </p>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <style jsx global>{`
        .auth-input::placeholder {
          color: rgba(255,255,255,0.88);
        }
        .auth-input:focus {
          background: rgba(255,255,255,0.28);
          outline: 2px solid #00e0ff;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #fff;
        }
      `}</style>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.35)",
  fontSize: 16,
  background: "rgba(255,255,255,0.22)",
  color: "#fff",
  outline: "none",
  caretColor: "#fff",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "16px 0",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  cursor: "pointer",
};
