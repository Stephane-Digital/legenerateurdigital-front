import React from "react";

import LGDWorkspaceSidebar from "./components/LGDWorkspaceSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <style>{`
        body > header,
        header {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
        }
      `}</style>

      <LGDWorkspaceSidebar />

      <main className="min-h-screen lg:pl-[320px]">
        {children}
      </main>
    </div>
  );
}
