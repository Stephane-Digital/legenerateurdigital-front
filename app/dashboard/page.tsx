"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, clearToken } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // IMPORTANT: no generic type argument here; just call me()
        const u = await me();
        if (!mounted) return;
        setUser(u);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Non connecté");
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

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: 680,
          maxWidth: "92vw",
          padding: 24,
          borderRadius: 16,
          background: "rgba(0,0,0,0.35)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginBottom: 12, textAlign: "center" }}>
          Mon compte
        </h1>

        {err && (
          <p style={{ color: "#ff7b7b", marginBottom: 16, textAlign: "center" }}>
            {err}
          </p>
        )}

        {user ? (
          <>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "rgba(255,255,255,0.08)",
                padding: 12,
                borderRadius: 8,
                color: "#e6f7ff",
              }}
            >
              {JSON.stringify(user, null, 2)}
            </pre>

            <button onClick={onLogout} style={buttonStyle}>
              Se déconnecter
            </button>
          </>
        ) : (
          !err && <p style={{ textAlign: "center" }}>Chargement…</p>
        )}
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: "linear-gradient(90deg,#ff6b6b,#ef476f)",
  fontWeight: 600,
};
