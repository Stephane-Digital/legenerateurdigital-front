"use client";
import { useEffect, useState } from "react";

export default function AutomatisationsPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setMsg(null);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "rgba(20, 30, 40, 0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#e9f0f6",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "28px 28px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 0.3,
              color: "#a9d8ff",
            }}
          >
            Automatisations
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              opacity: 0.85,
              fontSize: 14,
              color: "#d5e6f3",
            }}
          >
            Centralisez ici vos futures actions automatiques (envois, webhooks, intégrations…)
          </p>
        </div>

        <div style={{ padding: 24 }}>
          <div
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Exemple – Notification Discord
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  Quand un utilisateur s’inscrit, envoie un message sur un canal.
                </div>
              </div>
              <button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    setMsg("Exécution simulée : OK");
                  }, 900);
                }}
                disabled={loading}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,224,255,1) 0%, rgba(0,123,255,1) 100%)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 600,
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Exécution…" : "Tester"}
              </button>
            </div>
          </div>

          {msg && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                background: "rgba(22,163,74,0.15)",
                border: "1px solid rgba(74,222,128,0.35)",
                color: "#9be7b0",
                fontSize: 14,
              }}
            >
              {msg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
