"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");

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
        alignItems: "center",
        justifyContent: "center",
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

      {/* ✨ Effet de lumière */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(0,255,255,0.1) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      ></div>

      {/* 🧠 Tableau de bord */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.1)",
          padding: "50px 60px",
          borderRadius: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          maxWidth: 550,
          width: "90%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            color: "#00e0ff",
            marginBottom: 10,
            fontWeight: 600,
            fontSize: 28,
          }}
        >
          👋 Bienvenue {user || "Utilisateur"}
        </h1>
        <p style={{ color: "#cfeaff", marginBottom: 20 }}>
          Vous êtes connecté au <strong>Générateur Digital</strong>
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            padding: 20,
            borderRadius: 12,
            marginBottom: 25,
          }}
        >
          <h3 style={{ color: "#00ffb3", marginBottom: 6 }}>🕒 Heure actuelle</h3>
          <p style={{ fontSize: 18 }}>{time}</p>
        </div>

        <button onClick={logout} style={buttonStyle}>
          Se déconnecter
        </button>
      </div>

      {/* 🌀 Animation CSS */}
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

const buttonStyle = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "16px 40px",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.3s ease",
};
