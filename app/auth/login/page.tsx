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
    position: "relative",
    overflow: "hidden",

    // ✅ Fond bleu dégradé (plus d’animation)
    background:
      "linear-gradient(180deg, #0E2A3A 0%, #0F3E5A 50%, #0B2740 100%)",
  }}
>
  {/* ⛔️ Supprimé : toutes les DIVs d'arrière-plan animées */}

  {/* 🧩 Ta carte / formulaire reste identique */}
  <div
    style={{
      position: "relative",
      zIndex: 2,
      background: "rgba(255, 255, 255, 0.08)",
      padding: "40px 50px",
      borderRadius: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      maxWidth: 520,
      width: "90%",
      textAlign: "center",
      backdropFilter: "blur(10px)",
    }}
  >
    {/* --- ton contenu existant (titre, inputs, bouton, messages d’erreur) --- */}
    {/** Exemple minimal : 
    <h1 style={{ color: "#00e0ff", marginBottom: 12, fontWeight: 700 }}>
      Se connecter
    </h1>
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
      <input ... />
      <input ... />
      <button ...>Se connecter</button>
    </form>
    {error && <p style={{ color: "#ff8080", marginTop: 16 }}>{error}</p>}
    **/}
    {/** ↳ conserve ici ton code de formulaire actuel **/}
  </div>
</main>

  );
}

/* Styles réutilisables */
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
