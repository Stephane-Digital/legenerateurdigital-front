"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

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
      await login(email, pwd); // stocke le token via lib/api.ts
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Impossible de se connecter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.brand}>LeGenerateurDigital</h1>
        <h2 style={styles.title}>Se connecter</h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {err && (
          <p style={{ color: "#ff9aa2", marginTop: 12, fontWeight: 600 }}>
            {err}
          </p>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: "#fff",
    background:
      "linear-gradient(180deg, #0E2A3A 0%, #0F3E5A 50%, #0B2740 100%)", // fond bleu dégradé statique
    padding: 16,
  },
  card: {
    width: "92%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    padding: "32px 40px",
    textAlign: "center",
  },
  brand: {
    margin: 0,
    marginBottom: 6,
    fontWeight: 800,
    fontSize: 28,
    color: "#00E0FF",
    textShadow: "0 4px 14px rgba(0,224,255,.25)",
  },
  title: {
    margin: 0,
    marginBottom: 18,
    fontWeight: 700,
    color: "#CFE8FF",
    fontSize: 20,
  },
  input: {
    padding: "14px 16px",
    borderRadius: 10,
    border: "none",
    fontSize: 16,
    background: "rgba(255,255,255,0.16)",
    color: "#fff",
    outline: "none",
  },
  button: {
    background:
      "linear-gradient(90deg, rgba(0,224,255,1) 0%, rgba(0,123,255,1) 100%)",
    color: "white",
    padding: "14px 0",
    border: "none",
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
  },
};
