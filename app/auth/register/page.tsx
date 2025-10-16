// app/register/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Base API : accepte les 2 noms d'env pour éviter toute confusion
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(15);
  const [displayedUsers, setDisplayedUsers] = useState<number>(15);

  // 🔄 Compteur d’utilisateurs simulé
  useEffect(() => {
    const update = () => setActiveUsers(Math.floor(Math.random() * 5) + 15);
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🧮 Animation du compteur
  useEffect(() => {
    const duration = 1000;
    const frameRate = 30;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const newValue = Math.round(
        displayedUsers + (activeUsers - displayedUsers) * progress
      );
      setDisplayedUsers(newValue);
      if (frame === totalFrames) clearInterval(counter);
    }, 1000 / frameRate);

    return () => clearInterval(counter);
  }, [activeUsers, displayedUsers]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // IMPORTANT : l’API attend { email, password, full_name }
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Erreur lors de l'inscription");
      }

      // L’API renvoie { access_token, token_type } → on le stocke pour être connecté
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      localStorage.setItem("successMessage", "✅ Compte créé avec succès 🎉");

      // Redirection vers le dashboard (tu peux changer en /auth/login si tu préfères)
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

      {/* ✨ Effet de particules lumineuses */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.10) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* 🧩 Formulaire */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(30, 35, 50, 0.55)", // + lisible
          padding: "40px 50px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginBottom: 6, fontWeight: 600 }}>
          Créer un compte
        </h1>
        <p style={{ fontSize: 14, marginBottom: 20, color: "#d0eaff" }}>
          👥 Utilisateurs actifs :{" "}
          <strong style={{ color: "#00ffb3", fontSize: 18 }}>
            {displayedUsers}
          </strong>
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            className="auth-input"
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
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
            {loading ? "Création..." : "Créer un compte"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ff8080", marginTop: 16, fontWeight: "bold" }}>
            {error}
          </p>
        )}
      </div>

      {/* CSS : animation + lisibilité des inputs */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <style jsx global>{`
        /* Placeholder bien visible */
        .auth-input::placeholder {
          color: rgba(255,255,255,0.88);
        }
        /* Focus net et lisible */
        .auth-input:focus {
          background: rgba(255,255,255,0.28);
          outline: 2px solid #00e0ff;
        }
        /* Compat Chrome / autofill */
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
  border: "1px solid rgba(255,255,255,0.35)", // + contraste
  fontSize: 16,
  background: "rgba(255,255,255,0.22)", // moins transparent => plus lisible
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
