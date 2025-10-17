"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Affiche un message de succès si on arrive depuis l'inscription
  useEffect(() => {
    const ok = localStorage.getItem("successMessage");
    if (ok) {
      setMsg(ok);
      localStorage.removeItem("successMessage");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      const { access_token } = await loginApi(email, pwd);
      setToken(access_token);
      setMsg("Connecté !");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Se connecter</h1>

        {msg && <p style={{ ...styles.text, color: "#35e1a1" }}>{msg}</p>}
        {error && <p style={{ ...styles.text, color: "#ff6b6b" }}>{error}</p>}

        <form onSubmit={onSubmit} style={styles.form}>
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

        <p style={{ ...styles.text, marginTop: 12 }}>
          Pas encore de compte ?{" "}
          <a href="/auth/register" style={styles.link}>
            Créer un compte
          </a>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(1000px 600px at 20% 20%, rgba(0, 255, 255, 0.12), transparent 60%), radial-gradient(900px 600px at 80% 80%, rgba(0, 120, 255, 0.12), transparent 60%), linear-gradient(180deg, #0f2027, #203a43 40%, #2c5364)",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: "#e9f6ff",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    padding: 28,
    borderRadius: 16,
    background: "rgba(12, 20, 28, 0.55)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.06)",
    textAlign: "center",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: 28,
    fontWeight: 700,
    color: "#6df2ff",
  },
  text: {
    margin: 0,
    opacity: 0.95,
  },
  form: {
    display: "grid",
    gap: 12,
    marginTop: 12,
  },
  input: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    outline: "none",
  },
  button: {
    marginTop: 6,
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#fff",
    background: "linear-gradient(90deg, rgb(0, 224, 255), rgb(0, 123, 255))",
    boxShadow: "0 10px 24px rgba(0,123,255,.22)",
  },
  link: {
    color: "#6df2ff",
    textDecoration: "underline",
  },
};
