// app/auth/login/page.tsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: appel API login
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        padding: "40px 16px",
      }}
    >
      {/* Fond animé */}
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
  }}
>
  LeGenerateurDigital
</h1>

      {/* Carte + titre à l’intérieur */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 720 }}>
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 640,
            background: "rgba(21, 36, 50, 0.65)",
            borderRadius: 18,
            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            padding: "28px 24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div
              style={{
                display: "inline-block",
                fontSize: "clamp(22px, 3.2vw, 34px)",
                fontWeight: 800,
                letterSpacing: "0.4px",
                lineHeight: 1.1,
                background:
                  "linear-gradient(90deg, #00e0ff 0%, #00ffb3 50%, #00a3ff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 12px rgba(0, 224, 255, 0.25)",
                whiteSpace: "nowrap",
              }}
              aria-label="LeGenerateurDigital"
            >
              LeGenerateurDigital
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 20,
                fontWeight: 700,
                color: "#cfefff",
              }}
            >
              Se connecter
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            style={{
              display: "grid",
              gap: 14,
              maxWidth: 560,
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
            <button type="submit" style={buttonStyle}>
              Se connecter
            </button>
          </form>
        </div>
      </div>

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
  cursor: "pointer",
};
