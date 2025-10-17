"use client";

import React from "react";
import { ProfileTile } from "../components/dashboard/ProfileTile";

export default function DashboardPage() {
  const user = {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    avatarUrl: "",
  };

  const handleLogout = () => {
    console.log("Déconnexion...");
    // plus tard : tu ajouteras ici la vraie déconnexion (clear token + redirect)
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <ProfileTile
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          onLogout={handleLogout}
        />
      </div>
    </main>
  );
}
