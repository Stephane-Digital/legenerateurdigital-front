"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken } from "@/lib/api";

type User = {
  id: number | string;
  name?: string;
  email: string;
  created_at?: string;
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
        const me = await api("/users/me");
        if (!mounted) return;
        setUser(me);
      } catch (e: any) {
        // Non connecté ou token invalide → retour au login
        setErr(e?.message || "Non connecté");
        router.replace("/auth/login");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  function onLogout() {
    clearToken();
    router.replace("/auth/login");
  }

  return (
    <main style={rootStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Mon compte</h1>

        {loading ? (
          <p style={mutedStyle}>Chargement…</p>
        ) : err ? (
          <p style={{ ...mutedStyle, color: "#ff8b8b" }}>{err}</p>
        ) : user ? (
          <>
            <div style={rowStyle}>
              <span style={labelStyle}>Nom</span>
              <span style={valueStyle}>{user.name || "—"}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Email</span>
              <span style={valueStyle}>{user.email}</span>
            </div>
            {user.created_at && (
              <div style={rowStyle}>
                <span style={labelStyle}>Inscrit le</span>
                <span style={valueStyle}>
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )}

            <div style={{ marginTop: 22 }}>
              <button onClick={onLogout} style={logoutBtnStyle}>
                Se déconnecter
              </button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

/* ------------------------ Styles inline (sobre & responsive) ------------------------ */

const rootStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  background:
    "linear-gradient(135deg, rgba(6,33,46,1) 0%, rgba(12,52,70,1) 60%, rgba(16,73,96,1) 100%)",
  color: "#e7f5ff",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 560,
  background: "rgba(255,255,255,0.06)",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  padding: 24,
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#7ee0ff",
  letterSpacing: 0.2,
};

const mutedStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#b7c6cf",
};

const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px dashed rgba(255,255,255,0.12)",
};

const labelStyle: React.CSSProperties = {
  color: "#9ec0cf",
  fontWeight: 600,
  fontSize: 14,
};

const valueStyle: React.CSSProperties = {
  color: "#e7f5ff",
  fontSize: 15,
};

const logoutBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 600,
  color: "#0a2b38",
  background:
    "linear-gradient(90deg, rgba(126,224,255,1) 0%, rgba(0,184,255,1) 100%)",
  boxShadow: "0 8px 18px rgba(0,184,255,0.25)",
};
