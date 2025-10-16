// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Base API : accepte les 2 noms d'env
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

type Me = {
  id?: number | string;
  email?: string;
  full_name?: string | null;
  is_active?: boolean;
  created_at?: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setErr("Non connecté");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Impossible de récupérer le profil");
      }

      setUser(data);
      setErr(null);
    } catch (e: any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌌 Dégradé animé */}
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

      {/* ✨ Effets lumineux */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.10) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* Carte */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(30, 35, 50, 0.55)",
          padding: "36px 44px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          maxWidth: 720,
          width: "92%",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ color: "#00e0ff", margin: 0, fontWeight: 700 }}>Mon espace</h1>
          <button onClick={logout} style={buttonStyle}>Se déconnecter</button>
        </div>

        <div style={{ marginTop: 18 }}>
          {loading ? (
            <p>Chargement...</p>
          ) : err ? (
            <div>
              <p style={{ color: "#ff8080", fontWeight: "bold" }}>{err}</p>
              <button onClick={() => router.push("/login")} style={buttonStyle}>
                Aller à la connexion
              </button>
            </div>
          ) : user ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                background: "rgba(255,255,255,0.10)",
                padding: 18,
                borderRadius: 12,
                marginTop: 8,
              }}
            >
              <Row label="Nom">{user.full_name || "—"}</Row>
              <Row label="Email">{user.email || "—"}</Row>
              <Row label="Actif">{user.is_active ? "Oui" : "Non"}</Row>
              <Row label="ID">{String(user.id ?? "—")}</Row>
              {user.created_at && <Row label="Créé le">{new Date(user.created_at).toLocaleString()}</Row>}
            </div>
          ) : (
            <p>Aucune donnée.</p>
          )}
        </div>
      </div>

      {/* Styles */}
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
      <div style={{ opacity: 0.9, color: "#d0eaff" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{children}</div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "10px 14px",
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  cursor: "pointer",
};
