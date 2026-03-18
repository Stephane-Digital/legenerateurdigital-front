"use client";

import Header from "@/components/dashboard/Header";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white">
      <Header />
      {/* ESPACE LGD → 40px pour ne pas coller au header */}
      <main className="pt-[40px] px-6">
        {children}
      </main>
    </div>
  );
}
