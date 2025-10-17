"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setErr(null);
        const me = await api("/users/me", { method: "GET" });
        if (!cancelled) setUser(me);
      } catch (e: any) {
        if (!cancelled) {
          // 401/403 -> pas connecté
          if (e?.message?.includes("401") || e?.message?.includes("403")) {
            router.replace("/auth/login");
            return;
          }
          setErr(e?.message || "Impossible de charger vos informations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const onLogout = () => {
    clearToken();
    router.replace("/auth/login");
  };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mon compte</h1>

        {loading && <p style={styles.muted}>Chargement…</p>}

        {!loading && err && (
          <p style={{ ...styles.muted, color: "#ff8a8a" }}>{err}</p>
        )}

        {!loading && user && (
          <div style={styles.block}>
            <div style={styles.row}>
              <span style={styles.label}>Nom</span>
              <span style={styles.value}>{user.name}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user.email}</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button onClick={() => router.push("/automatisations")} style={styles.secondaryBtn}>
            Mes automatisations
          </button>
          <button onClick={onLogout} style={styles.primaryBtn}>
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    padding: 16,
    fontFamily: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#eaf4ff",
  },
  card: {
    width: "min(92vw, 720px)",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: "28px 26px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(6px)",
  },
  title: {
    margin: 0,
    marginBottom: 14,
    fontSize: 24,
    fontWeight: 700,
    color: "#7be3ff",
  },
  muted: {
    margin: "8px 0 0",
    opacity: 0.9,
  },
  block: {
    marginTop: 10,
    display: "grid",
    gap: 10,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 10,
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "12px 14px",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  label: {
    fontSize: 13,
    color: "#9cc7d6",
  },
  value: {
    fontSize: 15,
    fontWeight: 600,
    color: "#eef8ff",
  },
  primaryBtn: {
    background:
      "linear-gradient(90deg, rgba(0,224,255,1) 0%, rgba(0,123,255,1) 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
};
