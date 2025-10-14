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
  const [activeUsers, setActiveUsers] = useState<number>(48); // Démarre à 50
  const [displayedUsers, setDisplayedUsers] = useState<number>(48); // Pour l'animation

  // 🔄 Simulation / API + animation du compteur
  useEffect(() => {
    async function fetchActiveUsers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/active`);
        const data = await res.json();
        const target = data.count || Math.floor(Math.random() * 80) + 50;
        setActiveUsers(target);
      } catch {
        setActiveUsers(Math.floor(Math.random() * 80) + 50); // Valeur simulée
      }
    }

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🧮 Animation fluide du compteur (incrémentation progressive)
  useEffect(() => {
    const duration = 1000; // 1 seconde d’animation
    const frameRate = 30; // images/seconde
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const newValue = Math.round(
        displayedUsers + (activeUsers - displayedUsers) * progress
      );
      setDisplayedUsers(newValue);
      if (frame === totalFrames) clearInterval(counter);
    }, 1000 / frameRate);

    return () => clearInterval(counter);
  }, [activeUsers]);

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
        backgroundImage: "url('/ai-tech-bg.jpg')", // 📷 Image IA
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
        fontFamily: "'Poppins', sans-serif",
        color: "#fff",
      }}
    >
      {/* Couche de flou semi-transparente */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(20, 20, 40, 0.6)",
          backdropFilter: "blur(6px)",
        }}
      ></div>

      {/* Contenu principal */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.1)",
          padding: "40px 50px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginBottom: 6, fontWeight: 600 }}>
          Créer un compte
        </h1>
        <p style={{ fontSize: 14, marginBottom: 20, color: "#d0eaff" }}>
          👥 Utilisateurs actifs :{" "}
          <strong style={{ color: "#00ffb3", fontSize: 18 }}>
            {displayedUsers}
          </strong>
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
              padding: "16px 18px",
              borderRadius: 12,
              border: "none",
              fontSize: 16,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              outline: "none",
            }}
          />
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              border: "none",
              fontSize: 16,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              border: "none",
              fontSize: 16,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #00e0ff, #007bff)",
              color: "white",
              padding: "16px 0",
              border: "none",
              borderRadius: 12,
              fontSize: 17,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.background =
                "linear-gradient(90deg, #00b8e6, #0066cc)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.background =
                "linear-gradient(90deg, #00e0ff, #007bff)")
            }
          >
            {loading ? "Création..." : "Créer un compte"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ff8080", marginTop: 16, fontWeight: "bold" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
