"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ReactNode } from "react";

export default function ProtectedPage({ children }: { children: ReactNode }) {
  const { loading } = useAuthGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300 text-lg">
        Vérification de la session...
      </div>
    );
  }

  return <>{children}</>;
}
