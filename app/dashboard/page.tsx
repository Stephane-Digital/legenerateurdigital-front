"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, clearToken } from "@/lib/api";

type User = {
  id?: number;
  email?: string;
  name?: string;
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
        const u = await me(); // <-- PAS de générique ici
        if (!mounted) return;
        setUser(u);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Non connecté");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onLogout = () => {
    clearToken();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff" }}>
        Chargement…
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff" }}>
        <div>
          <p style={{ marginBottom: 12 }}>{err}</p>
          <button
            onClick={() => router.push("/auth/login")}
            style={{ padding: "12px 18px", borderRadius: 12, border: "none", cursor: "pointer" }}
          >
            Se connecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontFamily: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: 28,
          width: "min(680px, 92%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#00e0ff" }}>Mon compte</h1>
        <p style={{ margin: "6px 0" }}>
          <strong>Nom :</strong> {user?.name ?? "—"}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Email :</strong> {user?.email ?? "—"}
        </p>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          <button
            onClick={onLogout}
            style={{
              background: "linear-gradient(90deg, #00e0ff, #007bff)",
              color: "white",
              padding: "12px 18px",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}
