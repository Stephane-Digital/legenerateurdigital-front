"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pwd }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Identifiants invalides");

      // stocker le token (localStorage côté client)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
      }

      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Erreur inconnue");
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
        background:
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
        paddingTop: 80, // laisse de la place pour le header
      }}
    >
      {/* === HEADER / TITRE === */}
      <header
        style={{
          position: "fixed",
          top: 18,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 0.3,
            background:
              "linear-gradient(90deg, #00e0ff 0%, #00ffb3 50%, #007bff 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 30px rgba(0, 224, 255, 0.15)",
          }}
        >
          Le Générateur Digital
        </h1>
      </header>

      {/* Carte / Formulaire */}
      <div
        style={{
          width: "92%",
          maxWidth: 640,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 0,
        }}
      >
        <div
          style={{
            background:
              "radial-gradient(1200px 600px at 0% 0%, rgba(0, 255, 255, 0.08), transparent 60%), radial-gradient(1200px 600px at 100% 100%, rgba(0, 100, 255, 0.08), transparent 60%)",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "38px 32px",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: 28,
                margin: 0,
                marginBottom: 22,
                fontWeight: 700,
                color: "#00e0ff",
              }}
            >
              Se connecter
            </h2>

            <form
              onSubmit={onSubmit}
              style={{
                display: "grid",
                gap: 14,
                maxWidth: 520,
                margin: "0 auto",
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

              {err && (
                <p
                  style={{
                    color: "#ff9595",
                    textAlign: "center",
                    marginTop: 6,
                    fontWeight: 600,
                  }}
                >
                  {err}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.15)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "16px 0",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  cursor: "pointer",
  fontWeight: 700,
};
