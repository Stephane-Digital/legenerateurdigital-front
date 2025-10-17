// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, me } from "@/lib/api";

type User = {
  id: number;
  email: string;
  name?: string | null;
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
        const u = await me<User>();
        if (!mounted) return;
        setUser(u);
      } catch (e: any) {
        if (!mounted) return;
        // 401 → pas connecté
        router.replace("/auth/login");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    clearToken();
    router.replace("/auth/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#d0eaff",
        }}
      >
        Chargement…
      </main>
    );
  }

  if (err) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#ffaaaa",
        }}
      >
        {err}
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 14,
          padding: "28px 24px",
          color: "#e6f3ff",
          boxShadow: "0 10px 40px rgba(0,0,0,.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(22px, 3vw, 28px)",
              color: "#00e0ff",
              margin: 0,
              textShadow: "0 0 10px rgba(0,224,255,.25)",
            }}
          >
            Mon compte
          </h1>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,.12)",
              padding: "10px 14px",
              borderRadius: 10,
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Se déconnecter
          </button>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <h3 style={{ marginTop: 0, color: "#9bd8ff" }}>Profil</h3>
            <p style={{ margin: "6px 0" }}>
              <strong>Nom:</strong> {user?.name || "—"}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            {user?.created_at && (
              <p style={{ margin: "6px 0" }}>
                <strong>Inscription:</strong>{" "}
                {new Date(user.created_at).toLocaleString()}
              </p>
            )}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <h3 style={{ marginTop: 0, color: "#9bd8ff" }}>Prochaines étapes</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Connecter Stripe (paiements)</li>
              <li>Ajouter la page “Automatisations”</li>
              <li>Mettre en place un onboarding</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
