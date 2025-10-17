"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { register as registerApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number>(15);
  const [displayedUsers, setDisplayedUsers] = useState<number>(15);

  // compteur simulé
  useEffect(() => {
    const update = () => setActiveUsers(Math.floor(Math.random() * 5) + 15);
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  // animation du compteur
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
  }, [activeUsers]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      await registerApi(name, email, pwd);
      localStorage.setItem(
        "successMessage",
        "✅ Compte créé avec succès 🎉"
      );
      router.push("/auth/login");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Créer un compte</h1>
        <p style={{ ...styles.text, marginBottom: 10 }}>
          👥 Utilisateurs actifs :{" "}
          <strong style={{ color: "#00ffb3", fontSize: 18 }}>
            {displayedUsers}
          </strong>
        </p>

        {msg && <p style={{ ...styles.text, color: "#35e1a1" }}>{msg}</p>}
        {error && <p style={{ ...styles.text, color: "#ff6b6b" }}>{error}</p>}

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
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
            {loading ? "Création..." : "Créer un compte"}
          </button>
        </form>

        <p style={{ ...styles.text, marginTop: 12 }}>
          Déjà inscrit ?{" "}
          <a href="/auth/login" style={styles.link}>
            Se connecter
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
    margin: "0 0 6px 0",
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
