"use client";

import { motion } from "framer-motion";
import React from "react";
import { usePathname } from "next/navigation";

export default function CardLuxe({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  // 📍 Détecte la page actuelle
  const isDashboard = pathname?.startsWith("/dashboard");

  // ⚙️ Taille par défaut selon la page
  const maxWidth = isDashboard ? "500px" : "900px";

  return (
    <motion.div
      className={`card-luxe w-full ${className}`}
      style={{
        maxWidth,
        margin: "0 auto 20px",
        borderRadius: "16px",
        padding: "24px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.6))",
        border: "1px solid rgba(255, 200, 100, 0.2)",
        boxShadow: "0 0 20px rgba(255, 184, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.3s ease",
      }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 0 25px rgba(255, 184, 0, 0.35)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
