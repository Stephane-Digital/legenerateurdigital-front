"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");

  // 🔐 Vérification du token et mise à jour de l’heure
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const email = localStorage.getItem("user_email");
    setUser(email || "Utilisateur connecté");

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    router.push("/auth/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Poppins', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌌 Fond animé */}
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
      ></div>

      {/* ✨ Effet lumineux */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.1) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      ></div>

      {/* 🧭 Barre latérale */}
      <aside
        style={{
          width: "240px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "30px 20px",
          borderRight: "1px solid rgba(255,255,255,0.15)",
          zIndex: 2,
        }}
      >
        <div>
          <h2 style={{ color: "#00e0ff", marginBottom: 40, fontWeight: 600 }}>
            ⚙️ Générateur Digital
          </h2>

          <nav style={{ display: "grid", gap: 18 }}>
            <a href="/dashboard" style={navLinkStyle}>
              📊 Tableau de bord
            </a>
            <a href="/automatisations" style={navLinkStyle}>
              🤖 Automatisations
            </a>
            <a href="/profil" style={navLinkStyle}>
              👤 Profil
            </a>
            <a href="/paiement" style={navLinkStyle}>
              💳 Abonnement
            </a>
          </nav>
        </div>

        <button onClick={logout} style={logoutButtonStyle}>
          🚪 Déconnexion
        </button>
      </aside>

      {/* 🧠 Contenu principal */}
      <section
        style={{
          flex: 1,
          zIndex: 2,
          padding: "60px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginBottom: 10, fontSize: 30 }}>
          👋 Bienvenue {user || "Utilisateur"}
        </h1>
        <p style={{ color: "#cfeaff", marginBottom: 25, fontSize: 18 }}>
          Vous êtes connecté à votre espace <strong>Générateur Digital</strong>.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            padding: 25,
            borderRadius: 14,
            minWidth: 280,
          }}
        >
          <h3 style={{ color: "#00ffb3", marginBottom: 6 }}>🕒 Heure actuelle</h3>
          <p style={{ fontSize: 20, fontWeight: "bold" }}>{time}</p>
        </div>
      </section>

      {/* 🌀 Animation du fond */}
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

const navLinkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.05)",
  transition: "all 0.3s ease",
  fontWeight: 500,
  fontSize: "16px",
};

const logoutButtonStyle = {
  background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
  color: "white",
  padding: "12px 0",
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.3s ease",
};
