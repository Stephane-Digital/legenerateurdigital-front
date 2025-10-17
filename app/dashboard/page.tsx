"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, clearToken } from "@/lib/api";

type User = {
  id: number;
  email: string;
  name?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await me(); // <-- pas de <User> ici
        if (!mounted) return;
        setUser(data as User);   // on caste si tu veux une aide TS
        setErr(null);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Non connecté");
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>Chargement…</div>
      </main>
    );
  }

  if (err || !user) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Non connecté</h1>
          <p style={styles.p}>{err || "Veuillez vous connecter."}</p>
          <button style={styles.button} onClick={() => router.push("/auth/login")}>
            Se connecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Bonjour {user.name || user.email}</h1>
        <p style={styles.p}>Bienvenue sur votre tableau de bord.</p>

        <div style={{ height: 16 }} />

        <button style={styles.button} onClick={logout}>
          Se déconnecter
        </button>
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
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
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
  h1: {
    margin: "0 0 12px 0",
    fontSize: 28,
    fontWeight: 700,
    color: "#6df2ff",
  },
  p: {
    margin: 0,
    opacity: 0.9,
  },
  button: {
    marginTop: 14,
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#fff",
    background:
      "linear-gradient(90deg, rgb(0, 224, 255), rgb(0, 123, 255))",
    boxShadow: "0 10px 24px rgba(0,123,255,.22)",
  },
};
