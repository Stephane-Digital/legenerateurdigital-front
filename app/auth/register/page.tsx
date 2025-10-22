"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as apiRegister } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      await apiRegister({ name, email, password: pwd });
      setMsg("Compte créé ! Redirection...");
      setTimeout(() => router.push("/auth/login"), 1000);
    } catch (err: any) {
      setMsg(err?.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #020617, #0d253a)",
        padding: "20px",
        color: "#fff",
      }}
    >
      {/* LOGO + TITRE + SLOGAN */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.8rem",
            background: "linear-gradient(90deg,#ffcc00,#ff8800)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 12px rgba(255,136,0,0.6)",
            marginBottom: "0.4rem",
            fontWeight: 800,
            letterSpacing: "2px",
          }}
        >
          LGD
        </h1>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.3rem" }}>
          Le Générateur Digital
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#9fd0ff",
            opacity: 0.85,
            margin: 0,
          }}
        >
          Propulse ton business numérique
        </p>
      </div>

      {/* FORMULAIRE */}
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(0, 0, 0, 0.35)",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 style={{ color: "#00e0ff", textAlign: "center", marginBottom: 16 }}>
          Créer un compte
        </h3>

        <input
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
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
          {loading ? "Création..." : "Créer un compte"}
        </button>

        {msg && (
          <p style={{ color: "#9bf89b", marginTop: 12, textAlign: "center" }}>
            {msg}
          </p>
        )}

        <p style={{ marginTop: 10, textAlign: "center" }}>
          Déjà inscrit ?{" "}
          <a href="/auth/login" style={{ color: "#00e0ff" }}>
            Se connecter
          </a>
        </p>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: 12,
  borderRadius: 10,
  border: "none",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: "linear-gradient(90deg,#00e0ff,#007bff)",
  fontWeight: 600,
};
