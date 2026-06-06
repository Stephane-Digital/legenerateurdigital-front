"use client";

import React from "react";
import LGDWorkspaceSidebar from "./components/LGDWorkspaceSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <LGDWorkspaceSidebar />
      <main className="min-h-screen px-4 pb-16 pt-4 sm:px-6 lg:pl-[320px] lg:pr-8 lg:pt-4">
        {children}
      </main>
    </div>
  );
}
