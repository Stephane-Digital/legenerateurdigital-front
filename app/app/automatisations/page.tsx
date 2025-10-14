"use client";

import { useEffect, useState } from "react";

export default function AutomatisationsPage() {
  const [tasks, setTasks] = useState([
    { id: 1, name: "Création automatique de contenu", status: "En cours..." },
    { id: 2, name: "Campagne publicitaire IA", status: "Analyse des audiences..." },
    { id: 3, name: "Optimisation des tunnels de vente", status: "Calcul des conversions..." },
    { id: 4, name: "Automatisation des emails", status: "Segmentation intelligente..." },
  ]);

  const [activeIndex, setActiveIndex] = useState(0);

  // 🔄 Simulation des automatisations actives
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tasks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tasks.length]);

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

      {/* ✨ Lumières */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 30%, rgba(0,255,255,0.1) 0%, transparent 70%), radial-gradient(circle at 75% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      ></div>

      {/* ⚙️ Bloc principal */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.1)",
          padding: "50px 60px",
          borderRadius: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          maxWidth: 700,
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
          🤖 Automatisations IA
        </h1>
        <p style={{ color: "#cfeaff", marginBottom: 30 }}>
          L’intelligence artificielle travaille pour vous 24h/24 — 7j/7 💼
        </p>

        {/* 🔁 Liste animée */}
        <div
          style={{
            display: "grid",
            gap: 18,
          }}
        >
          {tasks.map((task, index) => (
            <div
              key={task.id}
              style={{
                background:
                  index === activeIndex
                    ? "linear-gradient(90deg, #00e0ff33, #007bff44)"
                    : "rgba(255,255,255,0.08)",
                padding: "20px 25px",
                borderRadius: 12,
                border:
                  index === activeIndex
                    ? "1px solid #00e0ff"
                    : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.4s ease",
                transform:
                  index === activeIndex ? "scale(1.03)" : "scale(1.0)",
                boxShadow:
                  index === activeIndex
                    ? "0 0 12px rgba(0,224,255,0.3)"
                    : "none",
              }}
            >
              <h3
                style={{
                  color: index === activeIndex ? "#00ffb3" : "#ffffff",
                  marginBottom: 6,
                }}
              >
                {task.name}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: index === activeIndex ? "#c8f7ff" : "#d8eaff",
                }}
              >
                {task.status}
              </p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 35, fontSize: 14, color: "#a6c8ff" }}>
          🚀 Générateur Digital : vos campagnes se lancent automatiquement
        </p>
      </div>

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
