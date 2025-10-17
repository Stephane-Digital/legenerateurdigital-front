"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, clearToken } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await me(); // appelle GET /users/me avec le token
        if (!mounted) return;
        setUser(u);
      } catch (e: any) {
        if (!mounted) return;
        // si pas connecté → on renvoie vers /auth/login
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

  const onLogout = () => {
    clearToken();
    router.push("/auth/login");
  };

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
      {/* Dégradé animé */}
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

      {/* Particules */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.1) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* Carte */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.1)",
          padding: "32px 40px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          maxWidth: 560,
          width: "92%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Titre visuel marque */}
        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
            fontSize: 26,
            letterSpacing: 0.5,
            color: "#00e0ff",
            textShadow: "0 0 10px rgba(0, 224, 255, 0.4)",
          }}
        >
          LeGenerateurDigital
        </h1>

        <p style={{ marginTop: 0, opacity: 0.8 }}>Mon compte</p>

        {loading ? (
          <p style={{ marginTop: 20 }}>Chargement…</p>
        ) : err ? (
          <p style={{ color: "#ff8080", marginTop: 16, fontWeight: "bold" }}>
            {err}
          </p>
        ) : (
          <div style={{ marginTop: 16, lineHeight: 1.8 }}>
            <div>
              <strong>Nom :</strong> {user?.name ?? "—"}
            </div>
            <div>
              <strong>Email :</strong> {user?.email ?? "—"}
            </div>

            <button
              onClick={onLogout}
              style={{
                marginTop: 24,
                background: "linear-gradient(90deg, #00e0ff, #007bff)",
                color: "#fff",
                padding: "12px 18px",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>

      {/* Animation CSS */}
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
