"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, clearToken } from "@/lib/api";

type User = {
  id?: number | string;
  email?: string;
  name?: string;
  // ajoute d’autres champs si ton API en renvoie
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await me<User>();
        if (!mounted) return;
        setUser(u);
      } catch (e: any) {
        // pas connecté → retour login
        if (!mounted) return;
        setErr(e?.message ?? "Non connecté");
        router.replace("/auth/login");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/auth/login");
  }

  if (loading) {
    return (
      <main style={styles.wrap}>
        <div style={styles.card}>Chargement…</div>
      </main>
    );
  }

  if (err && !user) {
    return (
      <main style={styles.wrap}>
        <div style={styles.card}>
          <p style={{ color: "#ff9a9a", marginBottom: 16 }}>{err}</p>
          <button style={styles.btn} onClick={() => router.replace("/auth/login")}>
            Se connecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ marginTop: 0, marginBottom: 12 }}>Mon compte</h1>

        <div style={{ lineHeight: 1.8, marginBottom: 16 }}>
          <div><strong>Nom :</strong> {user?.name ?? "-"}</div>
          <div><strong>Email :</strong> {user?.email ?? "-"}</div>
          <div><strong>ID :</strong> {String(user?.id ?? "-")}</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={styles.btn} onClick={logout}>Se déconnecter</button>
          <button style={styles.btnGhost} onClick={() => location.reload()}>
            Rafraîchir
          </button>
        </div>
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
    background:
      "linear-gradient(180deg, #0f2a3a 0%, #123e53 40%, #0b2e40 100%)",
  },
  card: {
    width: 520,
    maxWidth: "90vw",
    background: "#142736",
    color: "#e9f3ff",
    borderRadius: 14,
    boxShadow: "0 12px 26px rgba(0,0,0,0.25)",
    padding: 24,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  btn: {
    background:
      "linear-gradient(90deg, rgba(0,224,255,1) 0%, rgba(0,123,255,1) 100%)",
    color: "white",
    padding: "12px 16px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnGhost: {
    background: "transparent",
    color: "#cfe7ff",
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
};
