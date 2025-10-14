"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  // 🔄 Simulation : compteur d'utilisateurs actifs
  useEffect(() => {
    async function fetchActiveUsers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/active`);
        const data = await res.json();
        setActiveUsers(data.count || 0);
      } catch {
        setActiveUsers(Math.floor(Math.random() * 50) + 10); // Valeur simulée si API non dispo
      }
    }

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 10000); // refresh toutes les 10 sec
    return () => clearInterval(interval);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }

      localStorage.setItem("successMessage", "✅ Compte créé avec succès 🎉");
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5f6caf, #2e3a59)",
        fontFamily: "'Poppins', sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          padding: "40px 50px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#2e3a59", marginBottom: 8 }}>Créer un compte</h1>
        <p style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>
          👥 Utilisateurs actifs :{" "}
          <strong style={{ color: "#1a73e8" }}>{activeUsers}</strong>
        </p>

        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#1a73e8",
              color: "white",
              padding: "14px 0",
              border: "none",
              borderRadius: 12,
              fontSize: 17,
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#185abc")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#1a73e8")
            }
          >
            {loading ? "Création..." : "Créer un compte"}
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: 16, fontWeight: "bold" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
