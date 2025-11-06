"use client";

import React from "react";
import Header from "@/app/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-gradient-to-b from-[#0a0a0a] to-[#111827]
        text-white
      "
      style={{
        background: "linear-gradient(to bottom, #0a0a0a 0%, #111827 100%)",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }}
    >
      {/* Header fixe */}
      <Header />

      {/* ✅ On ajoute ici un padding-top global de 110px */}
      <main className="flex-1 flex flex-col items-center justify-start w-full px-4 pt-[110px]">
        {children}
      </main>
    </div>
  );
}
