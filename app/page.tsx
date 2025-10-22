"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-logo">LGD</div>
          <nav className="sidebar-nav">
            <Link href="/dashboard/overview" className={pathname === "/dashboard/overview" ? "active" : ""}>
              Vue d’ensemble
            </Link>
            <Link href="/dashboard/automatisations" className={pathname === "/dashboard/automatisations" ? "active" : ""}>
              Automatisations
            </Link>
            <Link href="/dashboard/clients" className={pathname === "/dashboard/clients" ? "active" : ""}>
              Clients
            </Link>
            <Link href="/dashboard/campagnes" className={pathname === "/dashboard/campagnes" ? "active" : ""}>
              Campagnes
            </Link>
            <Link href="/dashboard/settings" className={pathname === "/dashboard/settings" ? "active" : ""}>
              Paramètres
            </Link>
          </nav>
        </div>

        <button
          onClick={() => alert("Déconnexion à venir...")}
          style={{
            marginTop: "2rem",
            width: "100%",
            background: "linear-gradient(90deg, #FFB800, #FF6B00)",
            color: "#0a2540",
            fontWeight: 700,
            borderRadius: "8px",
            padding: "0.75rem 1rem",
          }}
        >
          Déconnexion
        </button>
      </aside>

      {/* HEADER */}
      <header className="dashboard-header">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span className="username">Stéphane</span>
          <div className="avatar">S</div>
        </div>
      </header>

      {/* CONTENU */}
      <main className="dashboard-content">{children}</main>
    </div>
  );
}
