"use client";

import { usePathname } from "next/navigation";
import React from "react";

import LGDWorkspaceSidebar from "./components/LGDWorkspaceSidebar";
import LGDModuleFixedBanner from "./components/LGDModuleFixedBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <LGDWorkspaceSidebar />

      <main className="min-h-screen px-4 py-4 lg:pl-[320px] lg:pr-6">
        {!isDashboardHome ? <LGDModuleFixedBanner /> : null}
        {children}
      </main>
    </div>
  );
}
